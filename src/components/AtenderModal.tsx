import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { api, mensajeDeError } from '../api/client';
import type { Cita } from '../api/types';
import { fechaHora } from '../lib/fechas';
import { useToast } from './Toast';
import { Button, Field, Modal, inputClass } from './ui';

interface RecetaForm { medicamento: string; indicaciones: string }

/** Cierra una cita: registra diagnóstico, tratamiento y recetas, y la marca como atendida. */
export function AtenderModal({ cita, onCerrar }: { cita: Cita | null; onCerrar: () => void }) {
  return (
    <Modal abierto={cita !== null} onCerrar={onCerrar} titulo={cita ? `Atender a ${cita.paciente}` : ''} ancho="max-w-2xl">
      {cita && <Formulario cita={cita} onCerrar={onCerrar} />}
    </Modal>
  );
}

function Formulario({ cita, onCerrar }: { cita: Cita; onCerrar: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [recetas, setRecetas] = useState<RecetaForm[]>([]);

  const atender = useMutation({
    mutationFn: () =>
      api<Cita>(`/api/medico/citas/${cita.id}/atender`, {
        method: 'POST',
        body: {
          diagnostico: diagnostico.trim(),
          tratamiento: tratamiento.trim(),
          // las filas totalmente vacías se descartan
          recetas: recetas
            .filter((r) => r.medicamento.trim() || r.indicaciones.trim())
            .map((r) => ({ medicamento: r.medicamento.trim(), indicaciones: r.indicaciones.trim() })),
        },
      }),
    onSuccess: () => {
      toast.ok('Cita atendida');
      onCerrar();
      qc.invalidateQueries();
    },
  });

  const cambiar = (i: number, campo: keyof RecetaForm, valor: string) =>
    setRecetas((rs) => rs.map((r, j) => (j === i ? { ...r, [campo]: valor } : r)));

  return (
    <form
      noValidate
      onSubmit={(e) => { e.preventDefault(); atender.mutate(); }}
      className="space-y-5"
    >
      <p className="-mt-2 text-sm text-ink-soft">
        {fechaHora(cita.fechaHora)} · {cita.motivo}
      </p>

      <Field label="Diagnóstico">
        <textarea className={inputClass} rows={2} maxLength={200} value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} />
      </Field>
      <Field label="Tratamiento">
        <textarea className={inputClass} rows={2} maxLength={200} value={tratamiento} onChange={(e) => setTratamiento(e.target.value)} />
      </Field>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Recetas</legend>
        {recetas.length === 0 && <p className="mb-2 text-sm text-ink-soft">Esta atención no tiene recetas. Agrega una si el paciente necesita medicamentos.</p>}
        <div className="space-y-3">
          {recetas.map((r, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-line p-3 sm:grid-cols-[1fr_1.4fr_auto]">
              <input aria-label={`Medicamento ${i + 1}`} className={inputClass} placeholder="Medicamento" maxLength={100}
                value={r.medicamento} onChange={(e) => cambiar(i, 'medicamento', e.target.value)} />
              <input aria-label={`Indicaciones ${i + 1}`} className={inputClass} placeholder="Indicaciones" maxLength={200}
                value={r.indicaciones} onChange={(e) => cambiar(i, 'indicaciones', e.target.value)} />
              <Button type="button" variante="ghost" aria-label={`Quitar receta ${i + 1}`} onClick={() => setRecetas((rs) => rs.filter((_, j) => j !== i))}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variante="secondary" pequeno className="mt-3" onClick={() => setRecetas((rs) => [...rs, { medicamento: '', indicaciones: '' }])}>
          <Plus className="size-4" aria-hidden /> Agregar receta
        </Button>
      </fieldset>

      {atender.error && (
        <p role="alert" className="rounded-lg bg-cancel-tint px-3 py-2.5 text-sm font-medium text-cancel">{mensajeDeError(atender.error)}</p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variante="secondary" onClick={onCerrar}>Cancelar</Button>
        <Button type="submit" cargando={atender.isPending} disabled={!diagnostico.trim() || !tratamiento.trim()}>Guardar y cerrar cita</Button>
      </div>
    </form>
  );
}

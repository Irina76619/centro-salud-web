import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, mensajeDeError } from '../../api/client';
import type { HistorialDetalle, Medico, Paciente, Receta } from '../../api/types';
import { HistorialLista } from '../../components/HistorialLista';
import { useToast } from '../../components/Toast';
import { Button, Cargando, Confirmar, ErrorCaja, Field, Modal, PageHeader, inputClass } from '../../components/ui';

type Edicion =
  | { tipo: 'historial'; registro: HistorialDetalle }
  | { tipo: 'receta'; registro: HistorialDetalle; receta: Receta }
  | { tipo: 'nueva-receta'; registro: HistorialDetalle };

export default function HistorialPaciente() {
  const { id } = useParams();
  const qc = useQueryClient();
  const toast = useToast();
  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [aBorrar, setABorrar] = useState<Receta | null>(null);

  const historial = useQuery({
    queryKey: ['/api/medico/pacientes', id, 'historial'],
    queryFn: () => api<HistorialDetalle[]>(`/api/medico/pacientes/${id}/historial`),
  });
  const pacientes = useQuery({ queryKey: ['/api/medico/pacientes'], queryFn: () => api<Paciente[]>('/api/medico/pacientes') });
  const perfil = useQuery({ queryKey: ['/api/medico/perfil'], queryFn: () => api<Medico>('/api/medico/perfil') });

  const paciente = pacientes.data?.find((p) => String(p.id) === id);
  const miNombre = perfil.data ? `${perfil.data.nombre} ${perfil.data.apellidos}` : null;
  // Solo se pueden editar los registros que salieron de citas propias (el servidor también lo verifica)
  const esMio = (r: HistorialDetalle) => miNombre !== null && r.medico === miNombre;

  const borrar = useMutation({
    mutationFn: (r: Receta) => api<void>(`/api/medico/recetas/${r.id}`, { method: 'DELETE' }),
    onSuccess: () => { toast.ok('Receta eliminada'); setABorrar(null); qc.invalidateQueries(); },
    onError: (e) => { toast.error(mensajeDeError(e)); setABorrar(null); },
  });

  return (
    <>
      <Link to="/medico/pacientes" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-brand-dark">
        <ArrowLeft className="size-4" aria-hidden /> Mis pacientes
      </Link>
      <PageHeader
        titulo={paciente ? `${paciente.nombre} ${paciente.apellidos}` : 'Historial clínico'}
        subtitulo={paciente ? `DNI ${paciente.dni} · ${paciente.edad} años` : 'Atenciones, diagnósticos y recetas del paciente.'}
      />

      {historial.isPending ? <Cargando /> : historial.isError ? (
        <ErrorCaja mensaje={mensajeDeError(historial.error)} onReintentar={() => historial.refetch()} />
      ) : (
        <HistorialLista
          registros={historial.data}
          acciones={(r) => esMio(r) && (
            <Button variante="secondary" pequeno onClick={() => setEdicion({ tipo: 'historial', registro: r })}>
              <Pencil className="size-4" aria-hidden /> Editar
            </Button>
          )}
          accionesReceta={(r, rc) => esMio(r) && (
            <div className="flex gap-1">
              <Button variante="ghost" pequeno aria-label="Editar receta" onClick={() => setEdicion({ tipo: 'receta', registro: r, receta: rc })}><Pencil className="size-4" /></Button>
              <Button variante="ghost" pequeno aria-label="Eliminar receta" onClick={() => setABorrar(rc)}><Trash2 className="size-4" /></Button>
            </div>
          )}
          pie={(r) => esMio(r) && r.citaId !== null && (
            <Button variante="secondary" pequeno className="mt-3" onClick={() => setEdicion({ tipo: 'nueva-receta', registro: r })}>
              <Plus className="size-4" aria-hidden /> Agregar receta
            </Button>
          )}
        />
      )}

      <Modal
        abierto={edicion !== null}
        onCerrar={() => setEdicion(null)}
        titulo={edicion?.tipo === 'historial' ? 'Editar registro clínico' : edicion?.tipo === 'receta' ? 'Editar receta' : 'Agregar receta'}
      >
        {edicion?.tipo === 'historial' && <FormHistorial r={edicion.registro} onListo={() => setEdicion(null)} />}
        {edicion?.tipo === 'receta' && <FormReceta ruta={`/api/medico/recetas/${edicion.receta.id}`} metodo="PUT" inicial={edicion.receta} onListo={() => setEdicion(null)} />}
        {edicion?.tipo === 'nueva-receta' && <FormReceta ruta={`/api/medico/citas/${edicion.registro.citaId}/recetas`} metodo="POST" onListo={() => setEdicion(null)} />}
      </Modal>

      <Confirmar
        abierto={aBorrar !== null}
        titulo="¿Eliminar esta receta?"
        texto={aBorrar && <>Se eliminará <strong>{aBorrar.medicamento}</strong> de la atención.</>}
        cargando={borrar.isPending}
        onConfirmar={() => aBorrar && borrar.mutate(aBorrar)}
        onCerrar={() => setABorrar(null)}
      />
    </>
  );
}

function FormHistorial({ r, onListo }: { r: HistorialDetalle; onListo: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [diagnostico, setDiagnostico] = useState(r.diagnostico);
  const [tratamiento, setTratamiento] = useState(r.tratamiento);
  const guardar = useMutation({
    mutationFn: () => api(`/api/medico/historial/${r.id}`, { method: 'PUT', body: { diagnostico: diagnostico.trim(), tratamiento: tratamiento.trim() } }),
    onSuccess: () => { toast.ok('Cambios guardados'); onListo(); qc.invalidateQueries(); },
  });
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); guardar.mutate(); }} className="space-y-4">
      <Field label="Diagnóstico"><textarea className={inputClass} rows={2} maxLength={200} value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} /></Field>
      <Field label="Tratamiento"><textarea className={inputClass} rows={2} maxLength={200} value={tratamiento} onChange={(e) => setTratamiento(e.target.value)} /></Field>
      {guardar.error && <p role="alert" className="rounded-lg bg-cancel-tint px-3 py-2.5 text-sm font-medium text-cancel">{mensajeDeError(guardar.error)}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variante="secondary" onClick={onListo}>Cancelar</Button>
        <Button type="submit" cargando={guardar.isPending} disabled={!diagnostico.trim() || !tratamiento.trim()}>Guardar cambios</Button>
      </div>
    </form>
  );
}

function FormReceta({ ruta, metodo, inicial, onListo }: { ruta: string; metodo: 'POST' | 'PUT'; inicial?: Receta; onListo: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [medicamento, setMedicamento] = useState(inicial?.medicamento ?? '');
  const [indicaciones, setIndicaciones] = useState(inicial?.indicaciones ?? '');
  const guardar = useMutation({
    mutationFn: () => api(ruta, { method: metodo, body: { medicamento: medicamento.trim(), indicaciones: indicaciones.trim() } }),
    onSuccess: () => { toast.ok(metodo === 'POST' ? 'Receta agregada' : 'Cambios guardados'); onListo(); qc.invalidateQueries(); },
  });
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); guardar.mutate(); }} className="space-y-4">
      <Field label="Medicamento"><input className={inputClass} maxLength={100} value={medicamento} onChange={(e) => setMedicamento(e.target.value)} /></Field>
      <Field label="Indicaciones"><textarea className={inputClass} rows={2} maxLength={200} value={indicaciones} onChange={(e) => setIndicaciones(e.target.value)} /></Field>
      {guardar.error && <p role="alert" className="rounded-lg bg-cancel-tint px-3 py-2.5 text-sm font-medium text-cancel">{mensajeDeError(guardar.error)}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variante="secondary" onClick={onListo}>Cancelar</Button>
        <Button type="submit" cargando={guardar.isPending} disabled={!medicamento.trim() || !indicaciones.trim()}>{metodo === 'POST' ? 'Agregar receta' : 'Guardar cambios'}</Button>
      </div>
    </form>
  );
}

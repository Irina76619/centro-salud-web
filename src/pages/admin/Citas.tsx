import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban } from 'lucide-react';
import { api, mensajeDeError } from '../../api/client';
import type { Cita, EstadoCita, Medico, Paciente } from '../../api/types';
import { useLista } from '../../api/hooks';
import { CrudPage } from '../../components/CrudPage';
import { useToast } from '../../components/Toast';
import { Button, Confirmar, EstadoBadge, inputClass } from '../../components/ui';
import { fechaHora } from '../../lib/fechas';

export default function Citas() {
  const qc = useQueryClient();
  const toast = useToast();
  const pacientes = useLista<Paciente>('/api/admin/pacientes');
  const medicos = useLista<Medico>('/api/admin/medicos');
  const [estado, setEstado] = useState<EstadoCita | ''>('');
  const [medicoId, setMedicoId] = useState('');
  const [aCancelar, setACancelar] = useState<Cita | null>(null);

  const cancelar = useMutation({
    mutationFn: (c: Cita) => api<Cita>(`/api/admin/citas/${c.id}/cancelar`, { method: 'PATCH' }),
    onSuccess: () => { toast.ok('Cita cancelada'); setACancelar(null); qc.invalidateQueries(); },
    onError: (e) => { toast.error(mensajeDeError(e)); setACancelar(null); },
  });

  return (
    <>
      <CrudPage<Cita>
        titulo="Citas"
        subtitulo="Agenda del centro. Una cita pendiente puede reprogramarse o cancelarse."
        textoNuevo="Nueva cita"
        tituloCrear="Agendar cita"
        tituloEditar="Reprogramar cita"
        ruta="/api/admin/citas"
        busqueda={(c) => `${c.paciente} ${c.pacienteDni} ${c.medico} ${c.motivo}`}
        filtro={(c) => (!estado || c.estado === estado) && (!medicoId || c.medicoId === Number(medicoId))}
        barra={
          <>
            <select aria-label="Filtrar por estado" value={estado} onChange={(e) => setEstado(e.target.value as EstadoCita | '')} className={`${inputClass} w-auto`}>
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="ATENDIDA">Atendidas</option>
              <option value="CANCELADA">Canceladas</option>
            </select>
            <select aria-label="Filtrar por médico" value={medicoId} onChange={(e) => setMedicoId(e.target.value)} className={`${inputClass} w-auto max-w-[220px]`}>
              <option value="">Todos los médicos</option>
              {(medicos.data ?? []).map((m) => <option key={m.id} value={m.id}>{m.nombre} {m.apellidos}</option>)}
            </select>
          </>
        }
        columnas={[
          { titulo: 'Fecha y hora', celda: (c) => <span className="whitespace-nowrap font-semibold">{fechaHora(c.fechaHora)}</span> },
          { titulo: 'Paciente', celda: (c) => <>{c.paciente}<span className="block text-xs text-ink-faint">DNI {c.pacienteDni}</span></> },
          { titulo: 'Médico', celda: (c) => <>{c.medico}<span className="block text-xs text-ink-faint">{c.especialidad}</span></> },
          { titulo: 'Motivo', celda: (c) => c.motivo },
          { titulo: 'Estado', celda: (c) => <EstadoBadge estado={c.estado} /> },
        ]}
        campos={[
          {
            nombre: 'pacienteId', etiqueta: 'Paciente', tipo: 'select', numerico: true, completo: true,
            opciones: (pacientes.data ?? []).map((p) => ({ valor: p.id, texto: `${p.apellidos}, ${p.nombre} · DNI ${p.dni}` })),
          },
          {
            nombre: 'medicoId', etiqueta: 'Médico', tipo: 'select', numerico: true, completo: true,
            opciones: (medicos.data ?? []).map((m) => ({ valor: m.id, texto: `${m.nombre} ${m.apellidos} · ${m.especialidad}` })),
          },
          { nombre: 'fechaHora', etiqueta: 'Fecha y hora', tipo: 'datetime-local', completo: true, ayuda: 'Debe ser futura y estar dentro del horario del médico.' },
          { nombre: 'motivo', etiqueta: 'Motivo de la consulta', completo: true, placeholder: 'Ej. Control de presión' },
        ]}
        puedeEditar={(c) => c.estado === 'PENDIENTE'}
        acciones={(c) =>
          c.estado === 'PENDIENTE' ? (
            <Button variante="ghost" pequeno onClick={() => setACancelar(c)}><Ban className="size-4" aria-hidden /> Cancelar</Button>
          ) : null
        }
        textoEliminar={(c) => <>Se eliminará la cita de <strong>{c.paciente}</strong> del {fechaHora(c.fechaHora)}, con sus recetas. El historial clínico se conserva. Para dejar constancia sin borrar, mejor cancela la cita.</>}
        vacio={{ titulo: 'Aún no hay citas', texto: 'Agenda la primera cita eligiendo un paciente, un médico y una hora dentro de su horario.' }}
      />

      <Confirmar
        abierto={aCancelar !== null}
        titulo="¿Cancelar esta cita?"
        texto={aCancelar && <>La cita de <strong>{aCancelar.paciente}</strong> del {fechaHora(aCancelar.fechaHora)} quedará como cancelada y el horario volverá a estar libre.</>}
        textoBoton="Cancelar cita"
        textoCerrar="Volver"
        cargando={cancelar.isPending}
        onConfirmar={() => aCancelar && cancelar.mutate(aCancelar)}
        onCerrar={() => setACancelar(null)}
      />
    </>
  );
}

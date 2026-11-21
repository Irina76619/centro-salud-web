import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ClipboardCheck, FileText } from 'lucide-react';
import { api, mensajeDeError } from '../../api/client';
import type { Cita, EstadoCita } from '../../api/types';
import { AtenderModal } from '../../components/AtenderModal';
import { Button, Cargando, ErrorCaja, EstadoBadge, PageHeader, Panel, Tabla, Vacio, td, th } from '../../components/ui';
import { fechaHora } from '../../lib/fechas';

const FILTROS: { v: EstadoCita | ''; t: string }[] = [
  { v: '', t: 'Todas' }, { v: 'PENDIENTE', t: 'Pendientes' }, { v: 'ATENDIDA', t: 'Atendidas' }, { v: 'CANCELADA', t: 'Canceladas' },
];

export default function MisCitas() {
  const [estado, setEstado] = useState<EstadoCita | ''>('');
  const [atendiendo, setAtendiendo] = useState<Cita | null>(null);
  const q = useQuery({ queryKey: ['/api/medico/citas'], queryFn: () => api<Cita[]>('/api/medico/citas') });
  const filas = (q.data ?? []).filter((c) => !estado || c.estado === estado);

  return (
    <>
      <PageHeader titulo="Mis citas" subtitulo="Todas las citas que tienes asignadas." />

      <div role="group" aria-label="Filtrar por estado" className="mb-4 inline-flex gap-1 rounded-xl bg-line/60 p-1">
        {FILTROS.map((f) => (
          <button
            key={f.t}
            aria-pressed={estado === f.v}
            onClick={() => setEstado(f.v)}
            className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${estado === f.v ? 'bg-paper text-ink shadow-sm' : 'text-ink-soft hover:text-ink'}`}
          >
            {f.t}
          </button>
        ))}
      </div>

      <Panel>
        {q.isPending ? <Cargando /> : q.isError ? (
          <div className="p-4"><ErrorCaja mensaje={mensajeDeError(q.error)} onReintentar={() => q.refetch()} /></div>
        ) : filas.length === 0 ? (
          <Vacio titulo="No hay citas" texto={estado ? 'No tienes citas con este estado.' : 'Cuando el área administrativa te asigne citas, aparecerán aquí.'} />
        ) : (
          <Tabla>
            <thead className="border-b border-line bg-canvas/60">
              <tr><th className={th}>Fecha y hora</th><th className={th}>Paciente</th><th className={th}>Motivo</th><th className={th}>Estado</th><th className={`${th} text-right`}>Acciones</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filas.map((c) => (
                <tr key={c.id} className="hover:bg-canvas/50">
                  <td className={`${td} whitespace-nowrap font-semibold`}>{fechaHora(c.fechaHora)}</td>
                  <td className={td}>{c.paciente}</td>
                  <td className={td}>{c.motivo}</td>
                  <td className={td}><EstadoBadge estado={c.estado} /></td>
                  <td className={`${td} text-right`}>
                    {c.estado === 'PENDIENTE' && (
                      <Button pequeno onClick={() => setAtendiendo(c)}><ClipboardCheck className="size-4" aria-hidden /> Atender</Button>
                    )}
                    {c.estado === 'ATENDIDA' && (
                      <Link to={`/medico/pacientes/${c.pacienteId}`} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-ink-soft hover:bg-brand-tint hover:text-brand-dark">
                        <FileText className="size-4" aria-hidden /> Ver historial
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Panel>

      <AtenderModal cita={atendiendo} onCerrar={() => setAtendiendo(null)} />
    </>
  );
}

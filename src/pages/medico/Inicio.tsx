import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import { api, mensajeDeError } from '../../api/client';
import type { Cita } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { AgendaTimeline } from '../../components/AgendaTimeline';
import { AtenderModal } from '../../components/AtenderModal';
import { Button, Cargando, ErrorCaja, PageHeader, Panel, Vacio } from '../../components/ui';
import { fechaHora, hoyISO, hoyLargo } from '../../lib/fechas';

export default function Inicio() {
  const { sesion } = useAuth();
  const [atendiendo, setAtendiendo] = useState<Cita | null>(null);
  const hoy = useQuery({ queryKey: ['/api/medico/citas/hoy'], queryFn: () => api<Cita[]>('/api/medico/citas/hoy') });
  const todas = useQuery({ queryKey: ['/api/medico/citas'], queryFn: () => api<Cita[]>('/api/medico/citas') });

  const accionAtender = (c: Cita) =>
    c.estado === 'PENDIENTE' ? (
      <Button pequeno onClick={() => setAtendiendo(c)}><ClipboardCheck className="size-4" aria-hidden /> Atender</Button>
    ) : null;

  const pendientesOtros = (todas.data ?? []).filter((c) => c.estado === 'PENDIENTE' && c.fechaHora.slice(0, 10) !== hoyISO());
  const conteo = (e: Cita['estado']) => (todas.data ?? []).filter((c) => c.estado === e).length;

  return (
    <>
      <PageHeader titulo="Agenda de hoy" subtitulo={`${hoyLargo()} · ${sesion?.detalle ?? ''}`} />

      {todas.data && (
        <Panel className="mb-6 grid grid-cols-3 divide-x divide-line">
          {[
            { t: 'Citas hoy', v: hoy.data?.length ?? 0 },
            { t: 'Pendientes', v: conteo('PENDIENTE') },
            { t: 'Atendidas', v: conteo('ATENDIDA') },
          ].map((x) => (
            <div key={x.t} className="px-5 py-4">
              <p className="text-sm text-ink-soft">{x.t}</p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums">{x.v}</p>
            </div>
          ))}
        </Panel>
      )}

      <Panel className="p-5">
        <h2 className="mb-4 text-lg font-bold">Citas de hoy</h2>
        {hoy.isPending ? <Cargando /> : hoy.isError ? (
          <ErrorCaja mensaje={mensajeDeError(hoy.error)} onReintentar={() => hoy.refetch()} />
        ) : hoy.data.length === 0 ? (
          <Vacio
            titulo="No tienes citas para hoy"
            texto="Revisa abajo las citas pendientes de otros días o consulta tu agenda completa."
            accion={<Link to="/medico/citas" className="text-sm font-semibold text-brand underline underline-offset-2">Ver todas mis citas</Link>}
          />
        ) : (
          <AgendaTimeline citas={hoy.data} acciones={accionAtender} />
        )}
      </Panel>

      {pendientesOtros.length > 0 && (
        <Panel className="mt-6 p-5">
          <h2 className="mb-1 text-lg font-bold">Pendientes por atender</h2>
          <p className="mb-3 text-sm text-ink-soft">Citas de otros días que aún no se cierran.</p>
          <ul className="divide-y divide-line">
            {pendientesOtros.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">{c.paciente}</p>
                  <p className="text-sm text-ink-soft">{fechaHora(c.fechaHora)} · {c.motivo}</p>
                </div>
                {accionAtender(c)}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <AtenderModal cita={atendiendo} onCerrar={() => setAtendiendo(null)} />
    </>
  );
}

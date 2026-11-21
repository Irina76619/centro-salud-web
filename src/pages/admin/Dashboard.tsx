import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api, mensajeDeError } from '../../api/client';
import type { Conteo, Dashboard as DashboardT, ReporteCitas } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { AgendaTimeline } from '../../components/AgendaTimeline';
import { Cargando, ErrorCaja, PageHeader, Panel, Vacio } from '../../components/ui';
import { hoyISO, hoyLargo } from '../../lib/fechas';

function saludo(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

export default function Dashboard() {
  const { sesion } = useAuth();
  const hoy = hoyISO();
  const anio = Number(hoy.slice(0, 4));

  const resumen = useQuery({ queryKey: ['/api/admin/dashboard'], queryFn: () => api<DashboardT>('/api/admin/dashboard') });
  const agenda = useQuery({
    queryKey: ['agenda-hoy', hoy],
    queryFn: () => api<ReporteCitas>(`/api/admin/reportes/citas-por-dia?fecha=${hoy}`),
  });
  const anual = useQuery({
    queryKey: ['resumen-anual', anio],
    queryFn: () => api<Conteo[]>(`/api/admin/reportes/resumen-anual?anio=${anio}`),
  });

  const d = resumen.data;
  const tarjetas = d
    ? [
        { t: 'Pacientes', v: d.pacientes }, { t: 'Médicos', v: d.medicos }, { t: 'Citas hoy', v: d.citasHoy },
        { t: 'Pendientes', v: d.pendientes }, { t: 'Atendidas', v: d.atendidas },
      ]
    : [];

  return (
    <>
      <PageHeader
        titulo={`${saludo()}, ${sesion?.nombre.split(' ')[0] ?? ''}`}
        subtitulo={hoyLargo()}
      />

      {resumen.isError ? (
        <ErrorCaja mensaje={mensajeDeError(resumen.error)} onReintentar={() => resumen.refetch()} />
      ) : (
        <Panel className="mb-6 grid grid-cols-2 divide-line sm:grid-cols-5 sm:divide-x">
          {resumen.isPending
            ? <div className="col-span-full"><Cargando /></div>
            : tarjetas.map((x) => (
                <div key={x.t} className="px-5 py-4">
                  <p className="text-sm text-ink-soft">{x.t}</p>
                  <p className="mt-1 text-3xl font-extrabold tabular-nums">{x.v}</p>
                </div>
              ))}
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Panel className="p-5">
          <h2 className="mb-4 text-lg font-bold">Agenda de hoy</h2>
          {agenda.isPending ? <Cargando /> : agenda.isError ? (
            <ErrorCaja mensaje={mensajeDeError(agenda.error)} onReintentar={() => agenda.refetch()} />
          ) : agenda.data.citas.length === 0 ? (
            <Vacio titulo="No hay citas para hoy" texto="Cuando registres citas con fecha de hoy aparecerán aquí, ordenadas por hora." />
          ) : (
            <AgendaTimeline citas={agenda.data.citas} mostrarMedico />
          )}
        </Panel>

        <Panel className="p-5">
          <h2 className="mb-1 text-lg font-bold">Citas por mes</h2>
          <p className="mb-4 text-sm text-ink-soft">Año {anio}</p>
          {anual.isPending ? <Cargando /> : anual.isError ? (
            <ErrorCaja mensaje={mensajeDeError(anual.error)} />
          ) : (
            <div className="h-64" role="img" aria-label={`Gráfico de barras con las citas de cada mes de ${anio}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={anual.data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#d8e3e4" />
                  <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#46636d' }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#46636d' }} />
                  <Tooltip cursor={{ fill: '#dff1ef' }} formatter={(v) => [v, 'Citas']} />
                  <Bar dataKey="total" fill="#0b7a75" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}

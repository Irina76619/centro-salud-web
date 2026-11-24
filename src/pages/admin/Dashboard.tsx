import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarDays, CheckCircle2, Clock, Plus, Stethoscope, Users } from 'lucide-react';
import { api, mensajeDeError } from '../../api/client';
import type { Conteo, Dashboard as DashboardT, ReporteCitas } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { AgendaTimeline } from '../../components/AgendaTimeline';
import { IlustracionAgenda } from '../../components/Ilustracion';
import { StatTile } from '../../components/StatTile';
import { BotonLink, Cargando, ErrorCaja, PageHeader, Panel, Vacio, inputClass } from '../../components/ui';
import { hoyISO, hoyLargo } from '../../lib/fechas';

function saludo(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

export default function Dashboard() {
  const { sesion } = useAuth();
  const hoy = hoyISO();
  const anioActual = Number(hoy.slice(0, 4));
  const [anio, setAnio] = useState(anioActual);

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
  const totalAnio = anual.data?.reduce((suma, x) => suma + x.total, 0) ?? 0;

  return (
    <>
      <PageHeader
        titulo={`${saludo()}, ${sesion?.nombre.split(' ')[0] ?? ''}`}
        subtitulo={hoyLargo()}
        acciones={<BotonLink to="/admin/citas" state={{ nuevo: true }}><Plus className="size-4" aria-hidden /> Nueva cita</BotonLink>}
      />

      {resumen.isError ? (
        <ErrorCaja mensaje={mensajeDeError(resumen.error)} onReintentar={() => resumen.refetch()} />
      ) : resumen.isPending || !d ? (
        <Cargando />
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatTile titulo="Pacientes" valor={d.pacientes} detalle="Registrados" icono={Users} />
          <StatTile titulo="Médicos" valor={d.medicos} detalle="En el centro" icono={Stethoscope} />
          <StatTile titulo="Citas hoy" valor={d.citasHoy} detalle={d.citasHoy === 0 ? 'Sin programar' : 'Para hoy'} icono={CalendarDays} />
          <StatTile titulo="Pendientes" valor={d.pendientes} detalle="Por atender" icono={Clock} acento />
          <StatTile titulo="Atendidas" valor={d.atendidas} detalle="En total" icono={CheckCircle2} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Panel className="p-6">
          <h2 className="mb-4 text-lg font-bold">Agenda de hoy</h2>
          {agenda.isPending ? <Cargando /> : agenda.isError ? (
            <ErrorCaja mensaje={mensajeDeError(agenda.error)} onReintentar={() => agenda.refetch()} />
          ) : agenda.data.citas.length === 0 ? (
            <Vacio
              ilustracion={<IlustracionAgenda />}
              titulo="No hay citas para hoy"
              texto="Cuando registres citas con fecha de hoy aparecerán aquí, ordenadas por hora."
              accion={<BotonLink to="/admin/citas" state={{ nuevo: true }} variante="secondary"><Plus className="size-4" aria-hidden /> Programar cita</BotonLink>}
            />
          ) : (
            <AgendaTimeline citas={agenda.data.citas} mostrarMedico />
          )}
        </Panel>

        <Panel className="p-6">
          <h2 className="mb-3 text-lg font-bold">Citas por mes</h2>
          <div className="mb-4 flex items-center justify-between gap-3">
            <select
              aria-label="Año del gráfico"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className={`${inputClass} w-auto py-2`}
            >
              {[anioActual - 2, anioActual - 1, anioActual, anioActual + 1].map((a) => <option key={a} value={a}>Año {a}</option>)}
            </select>
            <p className="text-sm text-ink-soft">{totalAnio} {totalAnio === 1 ? 'cita registrada' : 'citas registradas'}</p>
          </div>
          {anual.isPending ? <Cargando /> : anual.isError ? (
            <ErrorCaja mensaje={mensajeDeError(anual.error)} />
          ) : (
            <div className="h-64" role="img" aria-label={`Gráfico de barras con las citas de cada mes de ${anio}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={anual.data} margin={{ top: 18, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barra-verde" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#12907a" />
                      <stop offset="100%" stopColor="#07554a" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#d9e5e1" />
                  <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#4a6a62' }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#4a6a62' }} />
                  <Tooltip cursor={{ fill: '#dcf0ea' }} formatter={(v) => [v, 'Citas']} />
                  <Bar dataKey="total" fill="url(#barra-verde)" radius={[6, 6, 0, 0]} maxBarSize={28}>
                    <LabelList
                      dataKey="total"
                      position="top"
                      formatter={(v: unknown) => (Number(v) > 0 ? String(v) : '')}
                      style={{ fontSize: 12, fontWeight: 700, fill: '#10302b' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download } from 'lucide-react';
import { api, mensajeDeError } from '../../api/client';
import type { Conteo, GrupoCitas, HistorialDetalle, Paciente, ReporteCitas } from '../../api/types';
import { useLista } from '../../api/hooks';
import { HistorialLista } from '../../components/HistorialLista';
import { TablaCitas } from '../../components/TablaCitas';
import { Button, Cargando, ErrorCaja, PageHeader, Panel, Vacio, inputClass } from '../../components/ui';
import { exportarCsv, fecha, fechaHora, hoyISO, NOMBRES_MES } from '../../lib/fechas';

const PESTANAS = [
  { id: 'medico', texto: 'Por médico' },
  { id: 'especialidad', texto: 'Por especialidad' },
  { id: 'dia', texto: 'Por día' },
  { id: 'mes', texto: 'Por mes' },
  { id: 'historial', texto: 'Historial de un paciente' },
  { id: 'recetas', texto: 'Recetas y tratamientos' },
] as const;
type Pestana = (typeof PESTANAS)[number]['id'];

export default function Reportes() {
  const [activa, setActiva] = useState<Pestana>('medico');

  return (
    <>
      <PageHeader titulo="Reportes" subtitulo="Consulta la actividad del centro y exporta los resultados a CSV." />

      <div role="tablist" aria-label="Tipo de reporte" className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-line/60 p-1">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            role="tab"
            id={`tab-${p.id}`}
            aria-selected={activa === p.id}
            aria-controls="panel-reporte"
            onClick={() => setActiva(p.id)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activa === p.id ? 'bg-paper text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {p.texto}
          </button>
        ))}
      </div>

      <div id="panel-reporte" role="tabpanel" aria-labelledby={`tab-${activa}`}>
        {activa === 'medico' && <Grupos ruta="/api/admin/reportes/citas-por-medico" nombre="citas-por-medico" etiquetaGrupo="Médico" />}
        {activa === 'especialidad' && <Grupos ruta="/api/admin/reportes/citas-por-especialidad" nombre="citas-por-especialidad" etiquetaGrupo="Especialidad" />}
        {activa === 'dia' && <PorDia />}
        {activa === 'mes' && <PorMes />}
        {activa === 'historial' && <HistorialPaciente />}
        {activa === 'recetas' && <Recetas />}
      </div>
    </>
  );
}

// ---------- utilidades locales ----------
function Estado<T>({ q, children }: { q: { isPending: boolean; isError: boolean; error: Error | null; data: T | undefined; refetch: () => void }; children: (d: T) => ReactNode }) {
  if (q.isPending) return <Cargando />;
  if (q.isError || q.data === undefined) return <ErrorCaja mensaje={mensajeDeError(q.error)} onReintentar={q.refetch} />;
  return <>{children(q.data)}</>;
}

function csvCitas(nombre: string, citas: GrupoCitas['citas']) {
  exportarCsv(`${nombre}.csv`, [
    ['Fecha y hora', 'Paciente', 'DNI', 'Médico', 'Especialidad', 'Motivo', 'Estado'],
    ...citas.map((c) => [fechaHora(c.fechaHora), c.paciente, c.pacienteDni, c.medico, c.especialidad, c.motivo, c.estado]),
  ]);
}

const ejes = { tickLine: false, axisLine: false, tick: { fontSize: 12, fill: '#46636d' } } as const;

// ---------- Por médico / por especialidad ----------
function Grupos({ ruta, nombre, etiquetaGrupo }: { ruta: string; nombre: string; etiquetaGrupo: string }) {
  const q = useQuery({ queryKey: [ruta], queryFn: () => api<GrupoCitas[]>(ruta) });
  const [abierto, setAbierto] = useState<string | null>(null);

  return (
    <Estado q={q}>
      {(grupos) => (
        <div className="space-y-5">
          <Panel className="p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Total de citas por {etiquetaGrupo.toLowerCase()}</h2>
              <Button variante="secondary" pequeno onClick={() => csvCitas(nombre, grupos.flatMap((g) => g.citas))}>
                <Download className="size-4" aria-hidden /> Exportar CSV
              </Button>
            </div>
            <div className="w-full" style={{ height: Math.max(160, grupos.length * 44) }} role="img" aria-label={`Gráfico de citas por ${etiquetaGrupo.toLowerCase()}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={grupos} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid horizontal={false} stroke="#d8e3e4" />
                  <XAxis type="number" allowDecimals={false} {...ejes} />
                  <YAxis type="category" dataKey="grupo" width={170} {...ejes} />
                  <Tooltip cursor={{ fill: '#dff1ef' }} formatter={(v) => [v, 'Citas']} />
                  <Bar dataKey="total" fill="#0b7a75" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            {grupos.map((g) => (
              <div key={g.grupo} className="border-b border-line last:border-b-0">
                <button
                  onClick={() => setAbierto(abierto === g.grupo ? null : g.grupo)}
                  aria-expanded={abierto === g.grupo}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-canvas/60"
                >
                  <span className="font-semibold">{g.grupo}</span>
                  <span className="text-sm text-ink-soft">{g.total} {g.total === 1 ? 'cita' : 'citas'}</span>
                </button>
                {abierto === g.grupo && <div className="border-t border-line"><TablaCitas citas={g.citas} /></div>}
              </div>
            ))}
          </Panel>
        </div>
      )}
    </Estado>
  );
}

// ---------- Por día ----------
function PorDia() {
  const [dia, setDia] = useState(hoyISO());
  const q = useQuery({
    queryKey: ['reporte-dia', dia],
    queryFn: () => api<ReporteCitas>(`/api/admin/reportes/citas-por-dia?fecha=${dia}`),
    enabled: dia !== '',
  });

  return (
    <Panel>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line p-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Día</span>
          <input type="date" value={dia} onChange={(e) => setDia(e.target.value)} className={`${inputClass} w-auto`} />
        </label>
        {q.data && q.data.citas.length > 0 && (
          <Button variante="secondary" pequeno onClick={() => csvCitas(`citas-${dia}`, q.data!.citas)}>
            <Download className="size-4" aria-hidden /> Exportar CSV
          </Button>
        )}
      </div>
      {dia === '' ? <Vacio titulo="Elige un día" /> : (
        <Estado q={q}>
          {(r) => (
            <>
              <p className="px-5 pt-4 text-sm text-ink-soft">{r.total} {r.total === 1 ? 'cita' : 'citas'} el {fecha(dia)}</p>
              <TablaCitas citas={r.citas} />
            </>
          )}
        </Estado>
      )}
    </Panel>
  );
}

// ---------- Por mes ----------
function PorMes() {
  const hoy = hoyISO();
  const [mes, setMes] = useState(Number(hoy.slice(5, 7)));
  const [anio, setAnio] = useState(Number(hoy.slice(0, 4)));
  const valido = anio >= 2000 && anio <= 2100;

  const q = useQuery({
    queryKey: ['reporte-mes', mes, anio],
    queryFn: () => api<ReporteCitas>(`/api/admin/reportes/citas-por-mes?mes=${mes}&anio=${anio}`),
    enabled: valido,
  });
  const anual = useQuery({
    queryKey: ['resumen-anual', anio],
    queryFn: () => api<Conteo[]>(`/api/admin/reportes/resumen-anual?anio=${anio}`),
    enabled: valido,
  });

  return (
    <div className="space-y-5">
      <Panel>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line p-5">
          <div className="flex gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Mes</span>
              <select value={mes} onChange={(e) => setMes(Number(e.target.value))} className={`${inputClass} w-auto`}>
                {NOMBRES_MES.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Año</span>
              <input type="number" min={2000} max={2100} value={anio} onChange={(e) => setAnio(Number(e.target.value))} className={`${inputClass} w-28`} />
            </label>
          </div>
          {q.data && q.data.citas.length > 0 && (
            <Button variante="secondary" pequeno onClick={() => csvCitas(`citas-${anio}-${String(mes).padStart(2, '0')}`, q.data!.citas)}>
              <Download className="size-4" aria-hidden /> Exportar CSV
            </Button>
          )}
        </div>
        {!valido ? <Vacio titulo="Año no válido" texto="Ingresa un año entre 2000 y 2100." /> : (
          <Estado q={q}>
            {(r) => (
              <>
                <p className="px-5 pt-4 text-sm text-ink-soft">{r.total} {r.total === 1 ? 'cita' : 'citas'} en {NOMBRES_MES[mes - 1].toLowerCase()} de {anio}</p>
                <TablaCitas citas={r.citas} />
              </>
            )}
          </Estado>
        )}
      </Panel>

      {valido && (
        <Panel className="p-5">
          <h2 className="mb-3 text-lg font-bold">Citas de cada mes en {anio}</h2>
          <Estado q={anual}>
            {(datos) => (
              <div className="h-56" role="img" aria-label={`Gráfico de citas por mes en ${anio}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datos} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#d8e3e4" />
                    <XAxis dataKey="etiqueta" {...ejes} />
                    <YAxis allowDecimals={false} {...ejes} />
                    <Tooltip cursor={{ fill: '#dff1ef' }} formatter={(v) => [v, 'Citas']} />
                    <Bar dataKey="total" fill="#0b7a75" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Estado>
        </Panel>
      )}
    </div>
  );
}

// ---------- Historial de un paciente ----------
function HistorialPaciente() {
  const pacientes = useLista<Paciente>('/api/admin/pacientes');
  const [id, setId] = useState('');
  const q = useQuery({
    queryKey: ['reporte-historial', id],
    queryFn: () => api<HistorialDetalle[]>(`/api/admin/reportes/historial/${id}`),
    enabled: id !== '',
  });

  return (
    <div className="space-y-5">
      <Panel className="p-5">
        <label className="block max-w-md">
          <span className="mb-1.5 block text-sm font-semibold">Paciente</span>
          <select value={id} onChange={(e) => setId(e.target.value)} className={inputClass}>
            <option value="">Selecciona un paciente…</option>
            {(pacientes.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.apellidos}, {p.nombre} · DNI {p.dni}</option>)}
          </select>
        </label>
      </Panel>
      {id === '' ? (
        <Panel><Vacio titulo="Elige un paciente" texto="Verás todas sus atenciones con diagnóstico, tratamiento y recetas." /></Panel>
      ) : (
        <Estado q={q}>{(datos) => <HistorialLista registros={datos} />}</Estado>
      )}
    </div>
  );
}

// ---------- Recetas y tratamientos ----------
function Recetas() {
  const q = useQuery({
    queryKey: ['/api/admin/reportes/recetas-tratamientos'],
    queryFn: () => api<HistorialDetalle[]>('/api/admin/reportes/recetas-tratamientos'),
  });
  const [texto, setTexto] = useState('');

  return (
    <Estado q={q}>
      {(datos) => {
        const t = texto.trim().toLowerCase();
        const lista = !t ? datos : datos.filter((r) =>
          [r.paciente, r.diagnostico, r.tratamiento, r.medico ?? '', ...r.recetas.map((x) => x.medicamento)].join(' ').toLowerCase().includes(t));
        return (
          <div className="space-y-5">
            <Panel className="flex flex-wrap items-center justify-between gap-3 p-5">
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Buscar por paciente, diagnóstico o medicamento…"
                aria-label="Buscar"
                className={`${inputClass} max-w-md`}
              />
              <Button
                variante="secondary"
                pequeno
                onClick={() =>
                  exportarCsv('recetas-y-tratamientos.csv', [
                    ['Fecha', 'Paciente', 'Médico', 'Diagnóstico', 'Tratamiento', 'Medicamentos'],
                    ...lista.map((r) => [fecha(r.fecha), r.paciente, r.medico ?? '', r.diagnostico, r.tratamiento,
                      r.recetas.map((x) => `${x.medicamento} (${x.indicaciones})`).join(' | ')]),
                  ])
                }
              >
                <Download className="size-4" aria-hidden /> Exportar CSV
              </Button>
            </Panel>
            <HistorialLista registros={lista} mostrarPaciente />
          </div>
        );
      }}
    </Estado>
  );
}

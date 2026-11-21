import type { ReactNode } from 'react';
import type { HistorialDetalle, Receta } from '../api/types';
import { fecha } from '../lib/fechas';
import { Panel, Vacio } from './ui';

/** Historial clínico: cada registro con su diagnóstico, tratamiento y las recetas de esa atención. */
export function HistorialLista({ registros, acciones, accionesReceta, pie, mostrarPaciente = false }: {
  registros: HistorialDetalle[];
  acciones?: (r: HistorialDetalle) => ReactNode;
  accionesReceta?: (r: HistorialDetalle, rc: Receta) => ReactNode;
  pie?: (r: HistorialDetalle) => ReactNode;
  mostrarPaciente?: boolean;
}) {
  if (registros.length === 0) {
    return <Panel><Vacio titulo="Sin registros" texto="Todavía no hay atenciones registradas." /></Panel>;
  }
  return (
    <div className="space-y-4">
      {registros.map((r) => (
        <Panel key={r.id} className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-canvas/60 px-5 py-3">
            <div>
              <p className="font-semibold">
                {mostrarPaciente ? `${r.paciente} · ` : ''}{fecha(r.fecha)}
              </p>
              <p className="text-xs text-ink-soft">{r.medico ? `Atendió ${r.medico}` : 'Registro sin cita asociada'}</p>
            </div>
            {acciones?.(r)}
          </div>
          <div className="grid gap-5 px-5 py-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-ink-faint">Diagnóstico</p>
              <p className="mt-1 text-sm">{r.diagnostico}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-faint">Tratamiento</p>
              <p className="mt-1 text-sm">{r.tratamiento}</p>
            </div>
          </div>
          <div className="border-t border-line px-5 py-4">
            <p className="text-xs font-semibold text-ink-faint">Recetas</p>
            {r.recetas.length === 0 ? (
              <p className="mt-1 text-sm text-ink-soft">Sin recetas en esta atención.</p>
            ) : (
              <ul className="mt-2 divide-y divide-line">
                {r.recetas.map((rc) => (
                  <li key={rc.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <div>
                      <p className="text-sm font-semibold">{rc.medicamento}</p>
                      <p className="text-sm text-ink-soft">{rc.indicaciones}</p>
                    </div>
                    {accionesReceta?.(r, rc)}
                  </li>
                ))}
              </ul>
            )}
            {pie?.(r)}
          </div>
        </Panel>
      ))}
    </div>
  );
}

import type { ReactNode } from 'react';
import type { Cita } from '../api/types';
import { hora } from '../lib/fechas';
import { COLOR_PUNTO, EstadoBadge } from './ui';

/**
 * La "agenda del día": cada cita sobre una línea de tiempo con la hora a la izquierda
 * y un punto de color según su estado.
 */
export function AgendaTimeline({ citas, acciones, mostrarMedico = false }: {
  citas: Cita[]; acciones?: (c: Cita) => ReactNode; mostrarMedico?: boolean;
}) {
  return (
    <ol>
      {citas.map((c, i) => (
        <li key={c.id} className="grid grid-cols-[3.5rem_1.25rem_1fr] gap-x-3">
          <time dateTime={c.fechaHora} className="pt-[14px] text-right text-lg font-bold leading-none tabular-nums">
            {hora(c.fechaHora)}
          </time>
          <div className="relative flex justify-center" aria-hidden>
            <span className={`z-10 mt-[15px] size-3 rounded-full ring-4 ring-paper ${COLOR_PUNTO[c.estado]}`} />
            {i < citas.length - 1 && <span className="absolute bottom-0 top-[30px] w-px bg-line" />}
          </div>
          <div className="pb-3">
            <div className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border border-line px-4 py-3 ${c.estado === 'CANCELADA' ? 'bg-canvas/70' : 'bg-paper'}`}>
              <div className="min-w-0">
                <p className={`font-semibold ${c.estado === 'CANCELADA' ? 'text-ink-soft line-through' : ''}`}>{c.paciente}</p>
                <p className="text-sm text-ink-soft">{c.motivo}</p>
                {mostrarMedico && <p className="mt-1 text-xs text-ink-faint">{c.medico} · {c.especialidad}</p>}
              </div>
              <div className="flex items-center gap-2">
                <EstadoBadge estado={c.estado} />
                {acciones?.(c)}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

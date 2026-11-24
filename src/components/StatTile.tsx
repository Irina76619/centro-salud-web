import type { LucideIcon } from 'lucide-react';

/** Tarjeta de métrica: título + icono, número grande y una línea de detalle. "acento" resalta lo que requiere atención. */
export function StatTile({ titulo, valor, detalle, icono: Icono, acento = false }: {
  titulo: string; valor: number | string; detalle: string; icono: LucideIcon; acento?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-line bg-paper p-5 shadow-card ${acento ? 'border-b-[3px] border-b-pending' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-ink-soft">{titulo}</p>
        <Icono className={`size-5 shrink-0 ${acento ? 'text-pending' : 'text-brand'}`} aria-hidden />
      </div>
      <p className="mt-2 text-4xl font-extrabold leading-none tabular-nums">{valor}</p>
      <p className={`mt-2 text-sm ${acento ? 'font-semibold text-pending' : 'text-ink-soft'}`}>{detalle}</p>
    </div>
  );
}
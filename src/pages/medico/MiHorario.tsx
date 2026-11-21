import type { Horario } from '../../api/types';
import { useLista } from '../../api/hooks';
import { mensajeDeError } from '../../api/client';
import { Cargando, ErrorCaja, PageHeader, Panel } from '../../components/ui';
import { DIAS_SEMANA, hora } from '../../lib/fechas';

export default function MiHorario() {
  const q = useLista<Horario>('/api/medico/horario');

  return (
    <>
      <PageHeader titulo="Mi horario" subtitulo="Los días y horas en que recibes pacientes. Las citas solo se agendan dentro de estos bloques." />
      <Panel>
        {q.isPending ? <Cargando /> : q.isError ? (
          <div className="p-4"><ErrorCaja mensaje={mensajeDeError(q.error)} onReintentar={() => q.refetch()} /></div>
        ) : (
          <ul className="divide-y divide-line">
            {DIAS_SEMANA.map((dia) => {
              const bloques = q.data.filter((h) => h.diaSemana === dia).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
              return (
                <li key={dia} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-4">
                  <span className={`w-28 font-semibold ${bloques.length === 0 ? 'text-ink-faint' : ''}`}>{dia}</span>
                  {bloques.length === 0 ? (
                    <span className="text-sm text-ink-faint">No atiendes</span>
                  ) : (
                    <span className="flex flex-wrap gap-2">
                      {bloques.map((b) => (
                        <span key={b.id} className="rounded-full bg-brand-tint px-3 py-1 text-sm font-semibold tabular-nums text-brand-dark">
                          {hora(b.horaInicio)} a {hora(b.horaFin)}
                        </span>
                      ))}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}

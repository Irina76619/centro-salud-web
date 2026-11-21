import type { Cita } from '../api/types';
import { fechaHora } from '../lib/fechas';
import { EstadoBadge, Tabla, td, th, Vacio } from './ui';

/** Tabla de solo lectura de citas (reportes y detalle de paciente). */
export function TablaCitas({ citas }: { citas: Cita[] }) {
  if (citas.length === 0) return <Vacio titulo="Sin citas" texto="No hay citas para mostrar." />;
  return (
    <Tabla>
      <thead className="border-b border-line bg-canvas/60">
        <tr>
          <th className={th}>Fecha y hora</th><th className={th}>Paciente</th><th className={th}>Médico</th>
          <th className={th}>Especialidad</th><th className={th}>Motivo</th><th className={th}>Estado</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {citas.map((c) => (
          <tr key={c.id}>
            <td className={`${td} whitespace-nowrap`}>{fechaHora(c.fechaHora)}</td>
            <td className={td}>{c.paciente}</td>
            <td className={td}>{c.medico}</td>
            <td className={td}>{c.especialidad}</td>
            <td className={td}>{c.motivo}</td>
            <td className={td}><EstadoBadge estado={c.estado} /></td>
          </tr>
        ))}
      </tbody>
    </Tabla>
  );
}

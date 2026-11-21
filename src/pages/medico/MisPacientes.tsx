import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search } from 'lucide-react';
import type { Paciente } from '../../api/types';
import { useLista } from '../../api/hooks';
import { mensajeDeError } from '../../api/client';
import { Cargando, ErrorCaja, PageHeader, Panel, Tabla, Vacio, inputClass, td, th } from '../../components/ui';

export default function MisPacientes() {
  const q = useLista<Paciente>('/api/medico/pacientes');
  const [texto, setTexto] = useState('');
  const t = texto.trim().toLowerCase();
  const filas = (q.data ?? []).filter((p) => !t || `${p.nombre} ${p.apellidos} ${p.dni}`.toLowerCase().includes(t));

  return (
    <>
      <PageHeader titulo="Mis pacientes" subtitulo="Pacientes que has atendido o tienes agendados. Solo ves a los tuyos." />
      <Panel>
        <div className="border-b border-line p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
            <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar por nombre o DNI…" aria-label="Buscar" className={`${inputClass} pl-9`} />
          </div>
        </div>
        {q.isPending ? <Cargando /> : q.isError ? (
          <div className="p-4"><ErrorCaja mensaje={mensajeDeError(q.error)} onReintentar={() => q.refetch()} /></div>
        ) : filas.length === 0 ? (
          <Vacio titulo="No hay pacientes" texto={t ? 'Prueba con otro término.' : 'Aún no tienes pacientes con citas asignadas.'} />
        ) : (
          <Tabla>
            <thead className="border-b border-line bg-canvas/60">
              <tr><th className={th}>Paciente</th><th className={th}>DNI</th><th className={th}>Edad</th><th className={th}>Teléfono</th><th className={`${th} text-right`}>Historial</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filas.map((p) => (
                <tr key={p.id} className="hover:bg-canvas/50">
                  <td className={`${td} font-semibold`}>{p.nombre} {p.apellidos}</td>
                  <td className={td}>{p.dni}</td>
                  <td className={td}>{p.edad} años</td>
                  <td className={td}>{p.telefono ?? '—'}</td>
                  <td className={`${td} text-right`}>
                    <Link to={`/medico/pacientes/${p.id}`} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-ink-soft hover:bg-brand-tint hover:text-brand-dark">
                      <FileText className="size-4" aria-hidden /> Ver historial
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Panel>
    </>
  );
}

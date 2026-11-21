import type { Horario, Medico } from '../../api/types';
import { useLista } from '../../api/hooks';
import { CrudPage } from '../../components/CrudPage';
import { DIAS_SEMANA, hora } from '../../lib/fechas';

export default function Horarios() {
  const medicos = useLista<Medico>('/api/admin/medicos');

  return (
    <CrudPage<Horario>
      titulo="Horarios de atención"
      subtitulo="Días y horas en que cada médico recibe pacientes. Las citas solo pueden agendarse dentro de estos bloques."
      textoNuevo="Nuevo horario"
      tituloCrear="Registrar horario"
      tituloEditar="Editar horario"
      ruta="/api/admin/horarios"
      busqueda={(h) => `${h.medico} ${h.diaSemana}`}
      columnas={[
        { titulo: 'Médico', celda: (h) => <span className="font-semibold">{h.medico}</span> },
        { titulo: 'Día', celda: (h) => h.diaSemana },
        { titulo: 'Atiende de', celda: (h) => `${hora(h.horaInicio)} a ${hora(h.horaFin)}` },
      ]}
      campos={[
        {
          nombre: 'medicoId', etiqueta: 'Médico', tipo: 'select', numerico: true, completo: true,
          opciones: (medicos.data ?? []).map((m) => ({ valor: m.id, texto: `${m.nombre} ${m.apellidos} · ${m.especialidad}` })),
        },
        { nombre: 'diaSemana', etiqueta: 'Día', tipo: 'select', completo: true, opciones: DIAS_SEMANA.map((d) => ({ valor: d, texto: d })) },
        { nombre: 'horaInicio', etiqueta: 'Desde', tipo: 'time' },
        { nombre: 'horaFin', etiqueta: 'Hasta', tipo: 'time' },
      ]}
      textoEliminar={(h) => <>Se eliminará el bloque de <strong>{h.medico}</strong> del {h.diaSemana.toLowerCase()} ({hora(h.horaInicio)} a {hora(h.horaFin)}).</>}
      vacio={{ titulo: 'Aún no hay horarios', texto: 'Define cuándo atiende cada médico para poder agendar citas.' }}
    />
  );
}

import type { Especialidad, Medico } from '../../api/types';
import { useLista } from '../../api/hooks';
import { CrudPage } from '../../components/CrudPage';

export default function Medicos() {
  const especialidades = useLista<Especialidad>('/api/admin/especialidades');

  return (
    <CrudPage<Medico>
      titulo="Médicos"
      subtitulo="Personal médico y su especialidad."
      textoNuevo="Nuevo médico"
      tituloCrear="Registrar médico"
      tituloEditar="Editar médico"
      ruta="/api/admin/medicos"
      busqueda={(m) => `${m.codigoMedico} ${m.dni} ${m.nombre} ${m.apellidos} ${m.especialidad}`}
      columnas={[
        { titulo: 'Código', celda: (m) => m.codigoMedico },
        { titulo: 'Médico', celda: (m) => <span className="font-semibold">{m.nombre} {m.apellidos}</span> },
        { titulo: 'Especialidad', celda: (m) => m.especialidad },
        { titulo: 'DNI', celda: (m) => m.dni },
        { titulo: 'Edad', celda: (m) => `${m.edad} años` },
      ]}
      campos={[
        { nombre: 'codigoMedico', etiqueta: 'Código de médico', placeholder: 'MED004', ayuda: 'Con este código ingresa al sistema.' },
        { nombre: 'clave', etiqueta: 'Clave', tipo: 'password', ayuda: 'Entre 4 y 50 caracteres.', ayudaEdicion: 'Déjala vacía para conservar la actual.' },
        { nombre: 'nombre', etiqueta: 'Nombres' },
        { nombre: 'apellidos', etiqueta: 'Apellidos' },
        { nombre: 'dni', etiqueta: 'DNI', placeholder: '8 dígitos' },
        { nombre: 'edad', etiqueta: 'Edad', tipo: 'number' },
        {
          nombre: 'especialidadId', etiqueta: 'Especialidad', tipo: 'select', numerico: true, completo: true,
          opciones: (especialidades.data ?? []).map((e) => ({ valor: e.id, texto: e.nombre })),
        },
      ]}
      textoEliminar={(m) => <>Se eliminará a <strong>{m.nombre} {m.apellidos}</strong> junto con sus horarios. Si tiene citas registradas, no se podrá eliminar.</>}
      vacio={{ titulo: 'Aún no hay médicos', texto: 'Registra a los médicos para asignarles horarios y citas.' }}
    />
  );
}

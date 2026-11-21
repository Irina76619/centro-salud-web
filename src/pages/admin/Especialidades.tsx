import type { Especialidad } from '../../api/types';
import { CrudPage } from '../../components/CrudPage';

export default function Especialidades() {
  return (
    <CrudPage<Especialidad>
      titulo="Especialidades"
      subtitulo="Áreas de atención que ofrece el centro."
      textoNuevo="Nueva especialidad"
      tituloCrear="Registrar especialidad"
      tituloEditar="Editar especialidad"
      ruta="/api/admin/especialidades"
      busqueda={(e) => e.nombre}
      columnas={[{ titulo: 'Nombre', celda: (e) => <span className="font-semibold">{e.nombre}</span> }]}
      campos={[{ nombre: 'nombre', etiqueta: 'Nombre', completo: true, placeholder: 'Ej. Pediatría' }]}
      textoEliminar={(e) => <>Se eliminará la especialidad <strong>{e.nombre}</strong>. Si hay médicos con esta especialidad, no se podrá eliminar.</>}
      vacio={{ titulo: 'Aún no hay especialidades', texto: 'Crea la primera para poder registrar médicos.' }}
    />
  );
}

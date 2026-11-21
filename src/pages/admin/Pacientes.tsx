import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import { api, mensajeDeError } from '../../api/client';
import type { Cita, Paciente } from '../../api/types';
import { CrudPage } from '../../components/CrudPage';
import { TablaCitas } from '../../components/TablaCitas';
import { Button, Cargando, ErrorCaja, Modal } from '../../components/ui';

export default function Pacientes() {
  const [verCitas, setVerCitas] = useState<Paciente | null>(null);
  const citas = useQuery({
    queryKey: ['citas-de-paciente', verCitas?.id],
    queryFn: () => api<Cita[]>(`/api/admin/pacientes/${verCitas!.id}/citas`),
    enabled: verCitas !== null,
  });

  return (
    <>
      <CrudPage<Paciente>
        titulo="Pacientes"
        subtitulo="Registro de pacientes del centro."
        textoNuevo="Nuevo paciente"
        tituloCrear="Registrar paciente"
        tituloEditar="Editar paciente"
        ruta="/api/admin/pacientes"
        busqueda={(p) => `${p.dni} ${p.nombre} ${p.apellidos}`}
        columnas={[
          { titulo: 'DNI', celda: (p) => p.dni },
          { titulo: 'Paciente', celda: (p) => <span className="font-semibold">{p.nombre} {p.apellidos}</span> },
          { titulo: 'Edad', celda: (p) => `${p.edad} años` },
          { titulo: 'Teléfono', celda: (p) => p.telefono ?? '—' },
        ]}
        campos={[
          { nombre: 'dni', etiqueta: 'DNI', placeholder: '8 dígitos' },
          { nombre: 'edad', etiqueta: 'Edad', tipo: 'number' },
          { nombre: 'nombre', etiqueta: 'Nombres' },
          { nombre: 'apellidos', etiqueta: 'Apellidos' },
          { nombre: 'telefono', etiqueta: 'Teléfono (opcional)', completo: true, placeholder: 'Solo números' },
        ]}
        acciones={(p) => (
          <Button variante="ghost" pequeno onClick={() => setVerCitas(p)}>
            <CalendarDays className="size-4" aria-hidden /> Citas
          </Button>
        )}
        textoEliminar={(p) => <>Se eliminará a <strong>{p.nombre} {p.apellidos}</strong>. Si tiene citas registradas, no se podrá eliminar.</>}
        vacio={{ titulo: 'Aún no hay pacientes', texto: 'Registra al primer paciente para poder agendarle citas.' }}
      />

      <Modal abierto={verCitas !== null} onCerrar={() => setVerCitas(null)} ancho="max-w-4xl"
        titulo={verCitas ? `Citas de ${verCitas.nombre} ${verCitas.apellidos}` : ''}>
        {citas.isPending ? <Cargando /> : citas.isError ? <ErrorCaja mensaje={mensajeDeError(citas.error)} /> : <TablaCitas citas={citas.data} />}
      </Modal>
    </>
  );
}

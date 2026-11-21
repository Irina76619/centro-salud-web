// Tipos que reflejan los DTOs de respuesta del backend (Respuestas.java)

export type Rol = 'ADMIN' | 'MEDICO';
export type EstadoCita = 'PENDIENTE' | 'ATENDIDA' | 'CANCELADA';

export interface LoginRes { token: string; rol: Rol; id: number; nombre: string; detalle: string }
export interface Especialidad { id: number; nombre: string }
export interface Paciente { id: number; dni: string; nombre: string; apellidos: string; edad: number; telefono: string | null }
export interface Medico {
  id: number; codigoMedico: string; dni: string; nombre: string; apellidos: string;
  edad: number; especialidadId: number; especialidad: string;
}
export interface Horario { id: number; diaSemana: string; horaInicio: string; horaFin: string; medicoId: number; medico: string }
export interface Cita {
  id: number; fechaHora: string; motivo: string; estado: EstadoCita;
  pacienteId: number; paciente: string; pacienteDni: string;
  medicoId: number; medico: string; especialidad: string;
}
export interface Receta { id: number; medicamento: string; indicaciones: string; fecha: string; citaId: number }
export interface HistorialDetalle {
  id: number; fecha: string; diagnostico: string; tratamiento: string;
  pacienteId: number; paciente: string; citaId: number | null; medico: string | null; recetas: Receta[];
}
export interface GrupoCitas { grupo: string; total: number; citas: Cita[] }
export interface ReporteCitas { titulo: string; total: number; citas: Cita[] }
export interface Conteo { etiqueta: string; total: number }
export interface Dashboard {
  pacientes: number; medicos: number; especialidades: number;
  citasHoy: number; pendientes: number; atendidas: number; canceladas: number;
}

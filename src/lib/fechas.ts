// Utilidades de fecha/hora en español. Las fechas "YYYY-MM-DD" se interpretan como locales
// (new Date('2026-10-05') las trataría como UTC y mostraría el día anterior en Perú).

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const NOMBRES_MES = MESES.map((m) => m[0].toUpperCase() + m.slice(1));
export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function parteFecha(iso: string): [number, number, number] {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return [y, m, d];
}

/** "5 oct 2026" a partir de "2026-10-05" o "2026-10-05T09:00:00" */
export function fecha(iso: string): string {
  const [y, m, d] = parteFecha(iso);
  return `${d} ${MESES[m - 1].slice(0, 3)} ${y}`;
}

/** "09:00" a partir de "09:00:00" o "2026-10-05T09:00:00" */
export function hora(iso: string): string {
  return (iso.includes('T') ? iso.split('T')[1] : iso).slice(0, 5);
}

export function fechaHora(iso: string): string {
  return `${fecha(iso)}, ${hora(iso)}`;
}

/** Fecha de hoy como "YYYY-MM-DD" en hora local. */
export function hoyISO(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

/** "martes, 17 de noviembre" */
export function hoyLargo(): string {
  const n = new Date();
  const dia = new Intl.DateTimeFormat('es-PE', { weekday: 'long' }).format(n);
  return `${dia}, ${n.getDate()} de ${MESES[n.getMonth()]}`;
}

export function exportarCsv(nombre: string, filas: (string | number)[][]) {
  const csv = filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

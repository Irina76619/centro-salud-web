// Cliente HTTP único: agrega el token, convierte errores del backend en ApiError.

const BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8080').replace(/\/$/, '');
export const SESION_KEY = 'cs_sesion';

export class ApiError extends Error {
  status: number;
  errores?: Record<string, string>;
  constructor(status: number, mensaje: string, errores?: Record<string, string>) {
    super(mensaje);
    this.status = status;
    this.errores = errores;
  }
}

function tokenActual(): string | null {
  try {
    return JSON.parse(localStorage.getItem(SESION_KEY) ?? 'null')?.token ?? null;
  } catch {
    return null;
  }
}

interface Opciones { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown }

export async function api<T>(ruta: string, { method = 'GET', body }: Opciones = {}): Promise<T> {
  const token = tokenActual();
  let res: Response;
  try {
    res = await fetch(BASE + ruta, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.');
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // Token vencido o inválido (excepto en el propio login): avisar para cerrar sesión
    if (res.status === 401 && ruta !== '/api/auth/login') window.dispatchEvent(new Event('cs:no-autorizado'));
    throw new ApiError(res.status, data?.mensaje ?? 'Ocurrió un error inesperado', data?.errores ?? undefined);
  }
  return data as T;
}

/** Une el mensaje y el detalle por campo en un texto legible. */
export function mensajeDeError(e: unknown): string {
  if (e instanceof ApiError) {
    const detalle = e.errores ? Object.values(e.errores).join('. ') : '';
    return detalle ? `${e.message}: ${detalle}` : e.message;
  }
  return 'Ocurrió un error inesperado';
}

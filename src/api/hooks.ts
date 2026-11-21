import { useQuery } from '@tanstack/react-query';
import { api } from './client';

/** Lista de cualquier recurso; la clave de caché es la propia ruta (así se comparte entre pantallas). */
export function useLista<T>(ruta: string) {
  return useQuery({ queryKey: [ruta], queryFn: () => api<T[]>(ruta) });
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, SESION_KEY } from '../api/client';
import type { LoginRes, Rol } from '../api/types';

interface AuthCtx {
  sesion: LoginRes | null;
  login: (tipo: Rol, usuario: string, clave: string) => Promise<LoginRes>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

function leerSesion(): LoginRes | null {
  try {
    return JSON.parse(localStorage.getItem(SESION_KEY) ?? 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<LoginRes | null>(leerSesion);
  const queryClient = useQueryClient();

  const logout = useCallback(() => {
    localStorage.removeItem(SESION_KEY);
    setSesion(null);
    queryClient.clear();
  }, [queryClient]);

  const login = useCallback(async (tipo: Rol, usuario: string, clave: string) => {
    const res = await api<LoginRes>('/api/auth/login', { method: 'POST', body: { tipo, usuario, clave } });
    localStorage.setItem(SESION_KEY, JSON.stringify(res));
    setSesion(res);
    return res;
  }, []);

  // El cliente HTTP avisa cuando el backend responde 401 (token vencido)
  useEffect(() => {
    window.addEventListener('cs:no-autorizado', logout);
    return () => window.removeEventListener('cs:no-autorizado', logout);
  }, [logout]);

  const valor = useMemo(() => ({ sesion, login, logout }), [sesion, login, logout]);
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

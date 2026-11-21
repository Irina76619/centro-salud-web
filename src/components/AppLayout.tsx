import { useState } from 'react';
import { NavLink, Navigate, Outlet } from 'react-router-dom';
import {
  CalendarClock, CalendarDays, ClipboardList, LayoutDashboard, LogOut, Menu, Stethoscope,
  UserRound, Users, X, BarChart3, Tags, type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import type { Rol } from '../api/types';

interface Item { a: string; texto: string; icono: LucideIcon; fin?: boolean }

const MENU: Record<Rol, Item[]> = {
  ADMIN: [
    { a: '/admin', texto: 'Resumen', icono: LayoutDashboard, fin: true },
    { a: '/admin/citas', texto: 'Citas', icono: CalendarDays },
    { a: '/admin/pacientes', texto: 'Pacientes', icono: Users },
    { a: '/admin/medicos', texto: 'Médicos', icono: Stethoscope },
    { a: '/admin/horarios', texto: 'Horarios', icono: CalendarClock },
    { a: '/admin/especialidades', texto: 'Especialidades', icono: Tags },
    { a: '/admin/reportes', texto: 'Reportes', icono: BarChart3 },
  ],
  MEDICO: [
    { a: '/medico', texto: 'Agenda de hoy', icono: CalendarDays, fin: true },
    { a: '/medico/citas', texto: 'Mis citas', icono: ClipboardList },
    { a: '/medico/pacientes', texto: 'Mis pacientes', icono: Users },
    { a: '/medico/horario', texto: 'Mi horario', icono: CalendarClock },
  ],
};

export function Marca({ claro = true }: { claro?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="8" fill={claro ? '#1d4753' : '#12303a'} />
        <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#5fd0c5" />
      </svg>
      <span className={`text-[15px] font-extrabold tracking-tight ${claro ? 'text-white' : 'text-ink'}`}>Centro de Salud</span>
    </div>
  );
}

/** Estructura común: barra lateral según el rol + contenido. Protege la ruta por rol. */
export function AppLayout({ rol }: { rol: Rol }) {
  const { sesion, logout } = useAuth();
  const [abierto, setAbierto] = useState(false);

  if (!sesion) return <Navigate to="/login" replace />;
  if (sesion.rol !== rol) return <Navigate to={sesion.rol === 'ADMIN' ? '/admin' : '/medico'} replace />;

  const barra = (
    <nav aria-label="Principal" className="flex h-full flex-col bg-ink px-3 py-5 text-white">
      <div className="px-2 pb-6"><Marca /></div>
      <ul className="flex flex-1 flex-col gap-1">
        {MENU[rol].map(({ a, texto, icono: Icono, fin }) => (
          <li key={a}>
            <NavLink
              to={a}
              end={fin}
              onClick={() => setAbierto(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-white/12 text-white' : 'text-white/65 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <Icono className="size-[18px]" aria-hidden /> {texto}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t border-white/12 pt-4">
        <div className="flex items-center gap-3 px-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/12"><UserRound className="size-4" aria-hidden /></span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{sesion.nombre}</p>
            <p className="text-xs text-white/60">{rol === 'ADMIN' ? 'Administrativo' : 'Médico'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/65 transition-colors hover:bg-white/8 hover:text-white"
        >
          <LogOut className="size-[18px]" aria-hidden /> Cerrar sesión
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      {/* Escritorio */}
      <aside className="sticky top-0 hidden h-screen lg:block">{barra}</aside>

      {/* Móvil */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
        <Marca />
        <button onClick={() => setAbierto(true)} aria-label="Abrir menú" className="rounded-lg p-2 text-white hover:bg-white/10">
          <Menu className="size-5" />
        </button>
      </div>
      {abierto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setAbierto(false)} />
          <aside className="absolute inset-y-0 left-0 w-[260px]">
            {barra}
            <button onClick={() => setAbierto(false)} aria-label="Cerrar menú" className="absolute right-3 top-4 rounded-lg p-2 text-white/80 hover:bg-white/10">
              <X className="size-5" />
            </button>
          </aside>
        </div>
      )}

      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

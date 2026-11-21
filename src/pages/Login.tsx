import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Stethoscope, UserCog } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { mensajeDeError } from '../api/client';
import type { Rol } from '../api/types';
import { Button, Field, inputClass } from '../components/ui';
import { Marca } from '../components/AppLayout';

const DEMO: Record<Rol, { usuario: string; clave: string }> = {
  ADMIN: { usuario: 'admin', clave: 'admin123' },
  MEDICO: { usuario: 'MED001', clave: '1234' },
};

// Muestra de agenda para la columna izquierda (misma idea visual que la agenda real)
const MUESTRA = [
  { h: '09:00', n: 'Ana Quispe Huamán', m: 'Seguimiento de gripe', c: 'bg-ok' },
  { h: '10:30', n: 'Luis Mendoza Rojas', m: 'Chequeo general', c: 'bg-pending' },
  { h: '11:15', n: 'Pedro Vargas León', m: 'Control de presión', c: 'bg-pending' },
];

export default function Login() {
  const { sesion, login } = useAuth();
  const navegar = useNavigate();
  const [tipo, setTipo] = useState<Rol>('ADMIN');
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  if (sesion) return <Navigate to={sesion.rol === 'ADMIN' ? '/admin' : '/medico'} replace />;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const res = await login(tipo, usuario, clave);
      navegar(res.rol === 'ADMIN' ? '/admin' : '/medico', { replace: true });
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }

  const cambiarTipo = (t: Rol) => { setTipo(t); setError(null); setUsuario(''); setClave(''); };
  const usarDemo = () => { setUsuario(DEMO[tipo].usuario); setClave(DEMO[tipo].clave); setError(null); };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="fondo-cruces hidden flex-col justify-between p-12 text-white lg:flex">
        <Marca />
        <div>
          <h1 className="max-w-md text-4xl font-extrabold leading-[1.1] tracking-tight">
            La agenda, el historial y las recetas, en un solo lugar.
          </h1>
          <p className="mt-4 max-w-sm text-white/65">
            Reemplaza las hojas de Excel: cada cita queda registrada, cada médico ve solo a sus pacientes.
          </p>
          <ol className="mt-10 max-w-sm" aria-hidden>
            {MUESTRA.map((x, i) => (
              <li key={x.h} className="grid grid-cols-[3.25rem_1.25rem_1fr] gap-x-3">
                <span className="pt-[10px] text-right font-bold tabular-nums text-white/90">{x.h}</span>
                <span className="relative flex justify-center">
                  <span className={`z-10 mt-[13px] size-2.5 rounded-full ring-4 ring-ink ${x.c}`} />
                  {i < MUESTRA.length - 1 && <span className="absolute bottom-0 top-[26px] w-px bg-white/20" />}
                </span>
                <span className="pb-4">
                  <span className="block rounded-lg bg-white/8 px-3 py-2">
                    <span className="block text-sm font-semibold">{x.n}</span>
                    <span className="block text-xs text-white/60">{x.m}</span>
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <p className="text-xs text-white/40">Proyecto de portafolio · Java, Spring Boot y React</p>
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Marca claro={false} /></div>
          <h2 className="text-2xl font-extrabold tracking-tight">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-ink-soft">Elige cómo vas a ingresar.</p>

          <div role="radiogroup" aria-label="Tipo de acceso" className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-line/60 p-1">
            {([['ADMIN', 'Administrativo', UserCog], ['MEDICO', 'Médico', Stethoscope]] as const).map(([valor, texto, Icono]) => (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={tipo === valor}
                onClick={() => cambiarTipo(valor)}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                  tipo === valor ? 'bg-paper text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
                }`}
              >
                <Icono className="size-4" aria-hidden /> {texto}
              </button>
            ))}
          </div>

          <form onSubmit={enviar} className="mt-6 space-y-4" noValidate>
            <Field label={tipo === 'ADMIN' ? 'Usuario' : 'Código de médico'}>
              <input
                className={inputClass}
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoComplete="username"
                placeholder={tipo === 'ADMIN' ? 'admin' : 'MED001'}
                required
              />
            </Field>
            <Field label="Clave">
              <input
                className={inputClass}
                type="password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>

            {error && (
              <p role="alert" className="rounded-lg bg-cancel-tint px-3 py-2.5 text-sm font-medium text-cancel">{error}</p>
            )}

            <Button type="submit" cargando={cargando} className="w-full" disabled={!usuario || !clave}>Entrar</Button>
          </form>

          <div className="mt-6 rounded-xl border border-dashed border-line px-4 py-3 text-sm">
            <p className="text-ink-soft">
              ¿Es una demostración? Usa la cuenta de prueba de {tipo === 'ADMIN' ? 'administración' : 'médico'}.
            </p>
            <button type="button" onClick={usarDemo} className="mt-1 font-semibold text-brand underline underline-offset-2 hover:text-brand-dark">
              Rellenar {DEMO[tipo].usuario} / {DEMO[tipo].clave}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

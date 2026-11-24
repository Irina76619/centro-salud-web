import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { KeyRound, Stethoscope, UserCog } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { mensajeDeError } from '../api/client';
import type { Rol } from '../api/types';
import { Button, Field, inputClass } from '../components/ui';
import { Marca } from '../components/AppLayout';

const DEMO: Record<Rol, { usuario: string; clave: string }> = {
  ADMIN: { usuario: 'admin', clave: 'admin123' },
  MEDICO: { usuario: 'MED001', clave: '1234' },
};

// Muestra decorativa de la agenda (mismo lenguaje visual que la agenda real: color por estado)
const MUESTRA = [
  { h: '09:00', n: 'Ana Quispe Huamán', m: 'Seguimiento de gripe', estado: 'Atendida', punto: 'bg-mint', borde: 'border-l-mint', pastilla: 'bg-mint/20 text-mint' },
  { h: '10:30', n: 'Luis Mendoza Rojas', m: 'Chequeo general', estado: 'Pendiente', punto: 'bg-[#f1b24a]', borde: 'border-l-[#f1b24a]', pastilla: 'bg-[#f1b24a]/20 text-[#f6c978]' },
  { h: '11:15', n: 'Pedro Vargas León', m: 'Control de presión', estado: 'Pendiente', punto: 'bg-[#f1b24a]', borde: 'border-l-[#f1b24a]', pastilla: 'bg-[#f1b24a]/20 text-[#f6c978]' },
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
      <aside className="fondo-login hidden flex-col justify-between p-12 text-white lg:flex">
        <Marca />
        <div>
          <h1 className="max-w-lg font-serif text-5xl font-medium leading-[1.1] tracking-tight">
            La agenda, el historial y las recetas, en un solo lugar.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/75">
            Deja atrás las hojas de cálculo: cada cita queda registrada y cada médico ve solo a sus pacientes.
          </p>
          <ol className="mt-10 max-w-md" aria-hidden>
            {MUESTRA.map((x, i) => (
              <li key={x.h} className="grid grid-cols-[3.25rem_1.25rem_1fr] gap-x-3">
                <span className="pt-[14px] text-right font-bold tabular-nums text-white/90">{x.h}</span>
                <span className="relative flex justify-center">
                  <span className={`z-10 mt-[17px] size-2.5 rounded-full ${x.punto}`} />
                  {i < MUESTRA.length - 1 && <span className="absolute bottom-0 top-[30px] w-px border-l border-dashed border-white/30" />}
                </span>
                <span className="pb-3">
                  <span className={`flex items-center justify-between gap-3 rounded-xl border border-l-4 border-white/12 bg-white/[0.06] px-4 py-3 backdrop-blur-sm ${x.borde}`}>
                    <span>
                      <span className="block text-sm font-semibold">{x.n}</span>
                      <span className="block text-xs text-white/70">{x.m}</span>
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${x.pastilla}`}>{x.estado}</span>
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <p className="text-xs text-white/60">Proyecto de portafolio · Java, Spring Boot y React</p>
      </aside>

      <main className="flex items-center justify-center bg-canvas px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Marca claro={false} /></div>

          <div className="rounded-2xl border border-line bg-paper p-8 shadow-pop">
            <h2 className="text-center font-serif text-3xl font-semibold tracking-tight">Iniciar sesión</h2>
            <p className="mt-1 text-center text-sm text-ink-soft">Elige cómo vas a ingresar.</p>

            <div role="radiogroup" aria-label="Tipo de acceso" className="mx-auto mt-6 grid grid-cols-2 gap-1 rounded-full bg-canvas p-1 ring-1 ring-line">
              {([['ADMIN', 'Administrativo', UserCog], ['MEDICO', 'Médico', Stethoscope]] as const).map(([valor, texto, Icono]) => (
                <button
                  key={valor}
                  type="button"
                  role="radio"
                  aria-checked={tipo === valor}
                  onClick={() => cambiarTipo(valor)}
                  className={`flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-colors ${
                    tipo === valor ? 'bg-forest text-white shadow-sm' : 'text-ink-soft hover:text-ink'
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
                  placeholder={tipo === 'ADMIN' ? 'Ej. admin' : 'Ej. MED001'}
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

              <Button type="submit" cargando={cargando} className="w-full py-3" disabled={!usuario || !clave}>Entrar</Button>
            </form>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-xl bg-brand-tint px-4 py-3.5 text-sm text-forest">
            <KeyRound className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            <div>
              <p><strong>Acceso de demostración.</strong> Prueba con la cuenta de {tipo === 'ADMIN' ? 'administración' : 'médico'}: {DEMO[tipo].usuario} / {DEMO[tipo].clave}.</p>
              <button type="button" onClick={usarDemo} className="mt-1 font-semibold text-brand-dark underline underline-offset-2 hover:text-brand">
                Rellenar datos
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
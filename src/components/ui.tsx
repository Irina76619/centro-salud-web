import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2, X } from 'lucide-react';
import type { EstadoCita } from '../api/types';

// ---------- Botón ----------
type Variante = 'primary' | 'secondary' | 'danger' | 'ghost';
const VARIANTES: Record<Variante, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'bg-paper text-ink border border-line hover:bg-canvas',
  danger: 'bg-cancel text-white hover:bg-[#7e2a33]',
  ghost: 'text-ink-soft hover:bg-brand-tint hover:text-brand-dark',
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  cargando?: boolean;
  pequeno?: boolean;
}

export function Button({ variante = 'primary', cargando, pequeno, className = '', children, disabled, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        pequeno ? 'px-2.5 py-1.5 text-[13px]' : 'px-4 py-2.5 text-sm'
      } ${VARIANTES[variante]} ${className}`}
    >
      {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

// ---------- Campos de formulario ----------
export const inputClass =
  'w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 aria-[invalid=true]:border-cancel';

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-cancel">{error}</span>}
    </label>
  );
}

// ---------- Modal (usa <dialog>: foco atrapado y Esc gratis) ----------
export function Modal({ abierto, onCerrar, titulo, children, ancho = 'max-w-lg' }: {
  abierto: boolean; onCerrar: () => void; titulo: string; children: ReactNode; ancho?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onClick={(e) => { if (e.target === ref.current) onCerrar(); }}
      className={`m-auto w-[calc(100%-2rem)] ${ancho} rounded-2xl border border-line bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/45`}
    >
      {abierto && (
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 className="text-lg font-bold leading-snug">{titulo}</h2>
            <button onClick={onCerrar} aria-label="Cerrar" className="-mr-2 -mt-1 rounded-lg p-2 text-ink-soft hover:bg-canvas">
              <X className="size-5" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function Confirmar({ abierto, titulo, texto, textoBoton = 'Eliminar', textoCerrar = 'Cancelar', cargando, onConfirmar, onCerrar }: {
  abierto: boolean; titulo: string; texto: ReactNode; textoBoton?: string; textoCerrar?: string; cargando?: boolean;
  onConfirmar: () => void; onCerrar: () => void;
}) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo} ancho="max-w-md">
      <p className="text-sm leading-relaxed text-ink-soft">{texto}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variante="secondary" onClick={onCerrar}>{textoCerrar}</Button>
        <Button variante="danger" cargando={cargando} onClick={onConfirmar}>{textoBoton}</Button>
      </div>
    </Modal>
  );
}

// ---------- Estado de cita ----------
const ESTILO_ESTADO: Record<EstadoCita, string> = {
  PENDIENTE: 'bg-pending-tint text-pending',
  ATENDIDA: 'bg-ok-tint text-ok',
  CANCELADA: 'bg-cancel-tint text-cancel',
};
const TEXTO_ESTADO: Record<EstadoCita, string> = { PENDIENTE: 'Pendiente', ATENDIDA: 'Atendida', CANCELADA: 'Cancelada' };
export const COLOR_PUNTO: Record<EstadoCita, string> = { PENDIENTE: 'bg-pending', ATENDIDA: 'bg-ok', CANCELADA: 'bg-cancel' };

export function EstadoBadge({ estado }: { estado: EstadoCita }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTILO_ESTADO[estado]}`}>
      {TEXTO_ESTADO[estado]}
    </span>
  );
}

// ---------- Estructura de página ----------
export function PageHeader({ titulo, subtitulo, acciones }: { titulo: string; subtitulo?: string; acciones?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-ink-soft">{subtitulo}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </header>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-line bg-paper ${className}`}>{children}</section>;
}

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-ink-soft">
      <Loader2 className="size-4 animate-spin" aria-hidden /> {texto}
    </div>
  );
}

export function Vacio({ titulo, texto, accion }: { titulo: string; texto?: string; accion?: ReactNode }) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="font-semibold">{titulo}</p>
      {texto && <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">{texto}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}

export function ErrorCaja({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-cancel/30 bg-cancel-tint px-4 py-3 text-sm text-cancel">
      <p className="font-semibold">No se pudieron cargar los datos</p>
      <p className="mt-0.5">{mensaje}</p>
      {onReintentar && (
        <button onClick={onReintentar} className="mt-2 font-semibold underline underline-offset-2">Reintentar</button>
      )}
    </div>
  );
}

// ---------- Tabla ----------
export const th = 'whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-ink-soft';
export const td = 'px-4 py-3 align-middle text-sm';
export function Tabla({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">{children}</table>
    </div>
  );
}

import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { api, ApiError, mensajeDeError } from '../api/client';
import { Button, Confirmar, ErrorCaja, Field, Modal, PageHeader, Panel, Cargando, Tabla, Vacio, inputClass, td, th } from './ui';
import { useToast } from './Toast';

/** Definición de un campo del formulario. "nombre" coincide con la propiedad JSON de la fila y de la petición. */
export interface CampoDef {
  nombre: string;
  etiqueta: string;
  tipo?: 'text' | 'number' | 'password' | 'time' | 'datetime-local' | 'select';
  opciones?: { valor: string | number; texto: string }[];
  numerico?: boolean;       // los <select> con ids se envían como número
  ayuda?: string;
  ayudaEdicion?: string;    // texto de ayuda distinto cuando se edita
  placeholder?: string;
  completo?: boolean;       // ocupa las dos columnas
}

export interface Columna<T> { titulo: string; celda: (fila: T) => ReactNode; className?: string }

interface Props<T extends { id: number }> {
  titulo: string;
  subtitulo?: string;
  textoNuevo: string;                    // "Nuevo paciente"
  tituloCrear: string;                   // "Registrar paciente"
  tituloEditar: string;                  // "Editar paciente"
  ruta: string;                          // "/api/admin/pacientes"
  columnas: Columna<T>[];
  campos: CampoDef[];
  busqueda?: (fila: T) => string;
  filtro?: (fila: T) => boolean;
  barra?: ReactNode;                     // filtros extra junto al buscador
  acciones?: (fila: T) => ReactNode;     // botones extra por fila
  puedeEditar?: (fila: T) => boolean;
  puedeEliminar?: (fila: T) => boolean;
  textoEliminar: (fila: T) => ReactNode;
  vacio: { titulo: string; texto: string };
}

function valorInicial<T>(campo: CampoDef, fila: T | null): string {
  if (!fila || campo.tipo === 'password') return '';
  const v = (fila as Record<string, unknown>)[campo.nombre];
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (campo.tipo === 'time') return s.slice(0, 5);
  if (campo.tipo === 'datetime-local') return s.slice(0, 16);
  return s;
}

function armarPeticion(campos: CampoDef[], form: Record<string, string>) {
  const cuerpo: Record<string, unknown> = {};
  for (const c of campos) {
    const v = (form[c.nombre] ?? '').trim();
    if (v === '') cuerpo[c.nombre] = null;
    else if (c.tipo === 'number' || c.numerico) cuerpo[c.nombre] = Number(v);
    else cuerpo[c.nombre] = v;
  }
  return cuerpo;
}

/**
 * Pantalla CRUD reutilizable: lista + buscador + crear/editar (modal) + eliminar (con confirmación).
 * Los errores de validación del backend se muestran debajo de cada campo.
 */
export function CrudPage<T extends { id: number }>(p: Props<T>) {
  const qc = useQueryClient();
  const toast = useToast();
  const ubicacion = useLocation();
  const navegar = useNavigate();
  // Si se llega desde un botón "Nueva ..." (state.nuevo), el formulario se abre de inmediato
  const [editando, setEditando] = useState<T | 'nuevo' | null>(() => ((ubicacion.state as { nuevo?: boolean } | null)?.nuevo ? 'nuevo' : null));
  useEffect(() => {
    if ((ubicacion.state as { nuevo?: boolean } | null)?.nuevo) navegar(ubicacion.pathname, { replace: true, state: null });
  }, [ubicacion.state, ubicacion.pathname, navegar]);
  const [eliminando, setEliminando] = useState<T | null>(null);
  const [texto, setTexto] = useState('');

  const consulta = useQuery({ queryKey: [p.ruta], queryFn: () => api<T[]>(p.ruta) });

  const guardar = useMutation({
    mutationFn: (cuerpo: Record<string, unknown>) =>
      editando === 'nuevo' || editando === null
        ? api<T>(p.ruta, { method: 'POST', body: cuerpo })
        : api<T>(`${p.ruta}/${editando.id}`, { method: 'PUT', body: cuerpo }),
    onSuccess: () => {
      toast.ok(editando === 'nuevo' ? 'Registro creado' : 'Cambios guardados');
      setEditando(null);
      qc.invalidateQueries();
    },
  });

  const borrar = useMutation({
    mutationFn: (fila: T) => api<void>(`${p.ruta}/${fila.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.ok('Registro eliminado');
      setEliminando(null);
      qc.invalidateQueries();
    },
    onError: (e) => {
      toast.error(mensajeDeError(e));
      setEliminando(null);
    },
  });

  const filas = (consulta.data ?? [])
    .filter((f) => !p.filtro || p.filtro(f))
    .filter((f) => !texto.trim() || !p.busqueda || p.busqueda(f).toLowerCase().includes(texto.trim().toLowerCase()));

  const abrirForm = (valor: T | 'nuevo' | null) => {
    guardar.reset();
    setEditando(valor);
  };

  return (
    <>
      <PageHeader
        titulo={p.titulo}
        subtitulo={p.subtitulo}
        acciones={<Button onClick={() => abrirForm('nuevo')}><Plus className="size-4" aria-hidden /> {p.textoNuevo}</Button>}
      />

      <Panel>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          {p.busqueda && (
            <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Buscar…"
                aria-label="Buscar"
                className={`${inputClass} pl-9`}
              />
            </div>
          )}
          {p.barra}
          <span className="ml-auto text-xs text-ink-faint">{consulta.data ? `${filas.length} de ${consulta.data.length}` : ''}</span>
        </div>

        {consulta.isPending ? (
          <Cargando />
        ) : consulta.isError ? (
          <div className="p-4"><ErrorCaja mensaje={mensajeDeError(consulta.error)} onReintentar={() => consulta.refetch()} /></div>
        ) : filas.length === 0 ? (
          <Vacio
            titulo={consulta.data.length === 0 ? p.vacio.titulo : 'Sin resultados'}
            texto={consulta.data.length === 0 ? p.vacio.texto : 'Prueba con otro término o quita los filtros.'}
            accion={consulta.data.length === 0 ? <Button onClick={() => abrirForm('nuevo')}>{p.textoNuevo}</Button> : undefined}
          />
        ) : (
          <Tabla>
            <thead className="border-b border-line bg-canvas/60">
              <tr>
                {p.columnas.map((c) => <th key={c.titulo} className={th}>{c.titulo}</th>)}
                <th className={`${th} text-right`}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filas.map((f) => (
                <tr key={f.id} className="hover:bg-canvas/50">
                  {p.columnas.map((c) => <td key={c.titulo} className={`${td} ${c.className ?? ''}`}>{c.celda(f)}</td>)}
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <div className="flex justify-end gap-1">
                      {p.acciones?.(f)}
                      {(p.puedeEditar?.(f) ?? true) && (
                        <Button variante="ghost" pequeno onClick={() => abrirForm(f)} aria-label="Editar"><Pencil className="size-4" /></Button>
                      )}
                      {(p.puedeEliminar?.(f) ?? true) && (
                        <Button variante="ghost" pequeno onClick={() => setEliminando(f)} aria-label="Eliminar"><Trash2 className="size-4" /></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Panel>

      <Modal
        abierto={editando !== null}
        onCerrar={() => setEditando(null)}
        titulo={editando === 'nuevo' ? p.tituloCrear : p.tituloEditar}
      >
        {editando !== null && (
          <Formulario
            campos={p.campos}
            fila={editando === 'nuevo' ? null : editando}
            error={guardar.error}
            cargando={guardar.isPending}
            onEnviar={(cuerpo) => guardar.mutate(cuerpo)}
            onCancelar={() => setEditando(null)}
          />
        )}
      </Modal>

      <Confirmar
        abierto={eliminando !== null}
        titulo="¿Eliminar este registro?"
        texto={eliminando ? p.textoEliminar(eliminando) : ''}
        cargando={borrar.isPending}
        onConfirmar={() => eliminando && borrar.mutate(eliminando)}
        onCerrar={() => setEliminando(null)}
      />
    </>
  );
}

function Formulario<T>({ campos, fila, error, cargando, onEnviar, onCancelar }: {
  campos: CampoDef[]; fila: T | null; error: Error | null; cargando: boolean;
  onEnviar: (cuerpo: Record<string, unknown>) => void; onCancelar: () => void;
}) {
  const [form, setForm] = useState<Record<string, string>>(() =>
    Object.fromEntries(campos.map((c) => [c.nombre, valorInicial(c, fila)])),
  );
  const errores = error instanceof ApiError ? error.errores ?? {} : {};
  const bannerGeneral = error && !(error instanceof ApiError && error.errores) ? mensajeDeError(error) : null;

  return (
    <form
      noValidate
      onSubmit={(e) => { e.preventDefault(); onEnviar(armarPeticion(campos, form)); }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {campos.map((c) => {
          const ayuda = fila && c.ayudaEdicion ? c.ayudaEdicion : c.ayuda;
          const comun = {
            value: form[c.nombre] ?? '',
            'aria-invalid': errores[c.nombre] ? true : undefined,
            className: inputClass,
          } as const;
          const cambiar = (v: string) => setForm((f) => ({ ...f, [c.nombre]: v }));
          return (
            <div key={c.nombre} className={c.completo ? 'sm:col-span-2' : ''}>
              <Field label={c.etiqueta} error={errores[c.nombre]} hint={ayuda}>
                {c.tipo === 'select' ? (
                  <select {...comun} onChange={(e) => cambiar(e.target.value)}>
                    <option value="">Selecciona…</option>
                    {c.opciones?.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
                  </select>
                ) : (
                  <input
                    {...comun}
                    type={c.tipo ?? 'text'}
                    placeholder={c.placeholder}
                    autoComplete={c.tipo === 'password' ? 'new-password' : 'off'}
                    onChange={(e) => cambiar(e.target.value)}
                  />
                )}
              </Field>
            </div>
          );
        })}
      </div>

      {bannerGeneral && (
        <p role="alert" className="mt-4 rounded-lg bg-cancel-tint px-3 py-2.5 text-sm font-medium text-cancel">{bannerGeneral}</p>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variante="secondary" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" cargando={cargando}>{fila ? 'Guardar cambios' : 'Crear'}</Button>
      </div>
    </form>
  );
}
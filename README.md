# Centro de Salud — Frontend (React)

Interfaz web del sistema de gestión de un centro de salud. Consume la API REST del backend
(`centro-salud-api`, Spring Boot) y muestra un panel distinto según el rol.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router · TanStack Query · Recharts

## Ejecutar en local (VS Code)

Requisitos: **Node 20.19 o superior** y el backend corriendo en `http://localhost:8080`.

```bash
npm install
npm run dev        # http://localhost:5173
```

Si el backend está en otra URL, copia `.env.example` a `.env` y cambia `VITE_API_URL`.

| Rol | Acceso | Usuario | Clave |
|---|---|---|---|
| Administrativo | pestaña "Administrativo" | `admin` | `admin123` |
| Médico | pestaña "Médico" | `MED001` | `1234` |

La pantalla de login tiene un botón que rellena la cuenta de prueba (útil para la demostración).

## Qué hace cada panel

**Administrativo:** resumen del día con agenda y gráfico anual · CRUD de pacientes, médicos, especialidades,
horarios y citas (con búsqueda y filtros) · ver las citas de un paciente · cancelar y reprogramar citas ·
reportes (por médico, especialidad, día, mes, historial de un paciente, recetas y tratamientos) con exportación a CSV.

**Médico:** agenda de hoy en línea de tiempo · atender una cita (diagnóstico, tratamiento y recetas) ·
sus citas con filtros · solo sus pacientes · historial clínico con edición de sus propios registros y recetas · su horario.

## Estructura

```
src/
├─ api/          cliente HTTP (token + errores), tipos de los DTOs, hook useLista
├─ auth/         AuthContext: sesión, login y logout
├─ components/   ui.tsx (botones, modal, campos), CrudPage (CRUD genérico), AgendaTimeline, HistorialLista…
├─ pages/        login, admin/* y medico/*
└─ lib/          utilidades de fecha y exportación CSV
```

`CrudPage` es una pantalla CRUD reutilizable: recibe columnas y campos y se encarga de listar, buscar,
crear, editar y eliminar, mostrando los errores de validación del backend debajo de cada campo.

## Despliegue en Vercel

1. Sube el proyecto a GitHub e impórtalo en Vercel (Framework: **Vite**; build `npm run build`; salida `dist`).
2. En *Settings → Environment Variables* agrega `VITE_API_URL` con la URL pública del backend (sin `/` final).
3. En el backend agrega tu dominio de Vercel a `CORS_ORIGINS` (admite `https://*.vercel.app`).

`vercel.json` ya incluye la regla para que las rutas del navegador (`/admin/citas`, etc.) funcionen al recargar.

## Nota de seguridad

El token JWT se guarda en `localStorage` (simple y suficiente para un proyecto de portafolio). En producción real
conviene una cookie `HttpOnly` emitida por el backend. Los permisos reales los valida siempre el servidor:
ocultar un botón en el frontend no es una medida de seguridad.

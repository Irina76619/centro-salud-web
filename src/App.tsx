import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { AppLayout } from './components/AppLayout';
import Login from './pages/Login';
import Pacientes from './pages/admin/Pacientes';
import Medicos from './pages/admin/Medicos';
import Especialidades from './pages/admin/Especialidades';
import Horarios from './pages/admin/Horarios';
import Citas from './pages/admin/Citas';
import { Cargando } from './components/ui';
import Inicio from './pages/medico/Inicio';
import MisCitas from './pages/medico/MisCitas';
import MisPacientes from './pages/medico/MisPacientes';
import HistorialPaciente from './pages/medico/HistorialPaciente';
import MiHorario from './pages/medico/MiHorario';

// Las pantallas con gráficos (recharts) se cargan bajo demanda para que el inicio sea más rápido
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Reportes = lazy(() => import('./pages/admin/Reportes'));

function Raiz() {
  const { sesion } = useAuth();
  if (!sesion) return <Navigate to="/login" replace />;
  return <Navigate to={sesion.rol === 'ADMIN' ? '/admin' : '/medico'} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<Cargando />}>
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/admin" element={<AppLayout rol="ADMIN" />}>
        <Route index element={<Dashboard />} />
        <Route path="citas" element={<Citas />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="medicos" element={<Medicos />} />
        <Route path="horarios" element={<Horarios />} />
        <Route path="especialidades" element={<Especialidades />} />
        <Route path="reportes" element={<Reportes />} />
      </Route>

      <Route path="/medico" element={<AppLayout rol="MEDICO" />}>
        <Route index element={<Inicio />} />
        <Route path="citas" element={<MisCitas />} />
        <Route path="pacientes" element={<MisPacientes />} />
        <Route path="pacientes/:id" element={<HistorialPaciente />} />
        <Route path="horario" element={<MiHorario />} />
      </Route>

      <Route path="*" element={<Raiz />} />
    </Routes>
    </Suspense>
  );
}

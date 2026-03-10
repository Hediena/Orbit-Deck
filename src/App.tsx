import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import MissionControl from './pages/MissionControl';
import OperationalDirectory from './pages/OperationalDirectory';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ProjectDashboard from './pages/ProjectDashboard';
import Inbox from './pages/Inbox';
import { useOrbitStore } from './store/useStore';

// Placeholder component for unimplemented routes
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
      <span className="font-mono text-xs">WIP</span>
    </div>
    <h2 className="text-lg font-medium text-zinc-300">Módulo: {title}</h2>
    <p className="text-sm">Infraestructura preparada. Implementación en siguientes fases.</p>
  </div>
);

export default function App() {
  const fetchState = useOrbitStore(state => state.fetchState);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<MissionControl />} />
          <Route path="inbox" element={<Inbox />} />
          
          <Route path="projects">
            <Route index element={<Projects />} />
            <Route path=":id" element={<ProjectDetail />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ProjectDashboard />} />
              <Route path=":tabId" element={<Placeholder title="Submódulo de Proyecto" />} />
            </Route>
          </Route>

          <Route path="directory" element={<OperationalDirectory />} />
          <Route path="team" element={<Placeholder title="Equipo y Agentes" />} />
          <Route path="flows" element={<Placeholder title="Flujos y Automatizaciones" />} />
          <Route path="knowledge" element={<Placeholder title="Conocimiento y Documentación" />} />
          <Route path="versions" element={<Placeholder title="Versiones y Entrega" />} />
          <Route path="risks" element={<Placeholder title="Riesgos y Auditoría" />} />
          <Route path="assets" element={<Placeholder title="Archivos y Assets" />} />
          <Route path="settings" element={<Placeholder title="Settings e Integraciones" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import { useParams, NavLink, Outlet } from 'react-router-dom';
import { useOrbitStore } from '../store/useStore';
import { clsx } from 'clsx';
import { 
  LayoutDashboard, Target, Lightbulb, Box, Code2, 
  Megaphone, Briefcase, Book, HardDrive, GitMerge, 
  ShieldAlert, Package, Link as LinkIcon 
} from 'lucide-react';

const PROJECT_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'brief', label: 'Brief y Alcance', icon: Target },
  { id: 'strategy', label: 'Estrategia e Idea', icon: Lightbulb },
  { id: 'product', label: 'Producto', icon: Box },
  { id: 'dev', label: 'Desarrollo', icon: Code2 },
  { id: 'marketing', label: 'Marketing y Comms', icon: Megaphone },
  { id: 'ops', label: 'Operación y Admin', icon: Briefcase },
  { id: 'docs', label: 'Conocimiento y Docs', icon: Book },
  { id: 'assets', label: 'Archivos y Assets', icon: HardDrive },
  { id: 'flows', label: 'Tareas y Flujos', icon: GitMerge },
  { id: 'risks', label: 'Decisiones y Riesgos', icon: ShieldAlert },
  { id: 'releases', label: 'Versiones y Entregas', icon: Package },
  { id: 'resources', label: 'Recursos Externos', icon: LinkIcon },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const project = useOrbitStore(state => state.projects.find(p => p.id === id));

  if (!project) {
    return <div className="text-zinc-400">Proyecto no encontrado.</div>;
  }

  return (
    <div className="flex flex-col h-full -m-8">
      {/* Project Header */}
      <div className="h-20 border-b border-zinc-800/50 bg-zinc-950/50 flex items-center px-8 flex-shrink-0">
        <div>
          <h2 className="text-xl font-medium text-zinc-100">{project.name}</h2>
          <div className="flex items-center mt-1 space-x-4 text-xs font-mono text-zinc-500">
            <span>ID: {project.id}</span>
            <span>STATUS: {project.status}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Project Inner Sidebar */}
        <aside className="w-56 border-r border-zinc-800/50 bg-zinc-900/20 overflow-y-auto py-4">
          <nav className="space-y-0.5 px-2">
            {PROJECT_TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.id}
                  to={`/projects/${id}/${tab.id}`}
                  className={({ isActive }) => clsx(
                    "flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors",
                    isActive 
                      ? "bg-zinc-800 text-emerald-400" 
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 mr-2.5" />
                  {tab.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Project Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

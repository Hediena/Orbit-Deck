import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Activity, Inbox, FolderKanban, BookOpen, Users, 
  GitMerge, FileText, Package, ShieldAlert, HardDrive, Settings,
  Terminal
} from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { path: '/', label: 'Mission Control', icon: Activity },
  { path: '/inbox', label: 'Inbox y Captura', icon: Inbox },
  { path: '/projects', label: 'Proyectos', icon: FolderKanban },
  { path: '/directory', label: 'Directorio Operativo', icon: BookOpen },
  { path: '/team', label: 'Equipo y Agentes', icon: Users },
  { path: '/flows', label: 'Flujos y Auto', icon: GitMerge },
  { path: '/knowledge', label: 'Conocimiento', icon: FileText },
  { path: '/versions', label: 'Versiones', icon: Package },
  { path: '/risks', label: 'Riesgos y Auditoría', icon: ShieldAlert },
  { path: '/assets', label: 'Archivos y Assets', icon: HardDrive },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/50">
          <Terminal className="w-5 h-5 text-emerald-500 mr-3" />
          <span className="font-mono font-bold text-zinc-100 tracking-tight">ORBIT_DECK</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                  isActive 
                    ? "bg-zinc-800/80 text-emerald-400" 
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                )}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800/50">
          <div className="flex items-center text-xs font-mono text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            SYSTEM ONLINE
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-950">
        <header className="h-16 flex-shrink-0 border-b border-zinc-800/50 flex items-center px-8">
          <h1 className="text-lg font-medium text-zinc-100">
            {NAV_ITEMS.find(i => location.pathname === i.path || (i.path !== '/' && location.pathname.startsWith(i.path)))?.label || 'Orbit Deck'}
          </h1>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

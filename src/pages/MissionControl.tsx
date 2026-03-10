import { useOrbitStore } from '../store/useStore';
import { format } from 'date-fns';
import { Activity, AlertTriangle, ExternalLink, GitCommit, Clock, TerminalSquare, ListTodo, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';

export default function MissionControl() {
  const { flows, alerts, decisions, resources, masterRegistry, projects } = useOrbitStore();
  const launchers = resources.filter(r => r.type === 'TOOL' || r.type === 'REPO');
  
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const blockedProjects = projects.filter(p => p.status === 'blocked').length;
  const runningFlows = flows.filter(f => f.status === 'running').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header / Hoy */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-light text-zinc-100 tracking-tight">Mission Control</h2>
          <p className="text-zinc-500 font-mono text-sm mt-2">{format(new Date(), 'EEEE, dd MMM yyyy - HH:mm')}</p>
        </div>
        
        {/* Panel "Hoy" */}
        <div className="flex gap-4 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex-1 md:max-w-xl">
          <div className="flex-1 border-r border-zinc-800 pr-4">
            <span className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Foco de Hoy</span>
            <p className="text-sm text-zinc-300 leading-snug">
              Desbloquear <span className="text-rose-400 font-medium">{blockedProjects} proyectos</span> y supervisar <span className="text-emerald-400 font-medium">{runningFlows} flujos</span> en ejecución.
            </p>
          </div>
          <div className="flex flex-col justify-center px-2">
            <div className="flex items-center text-xs font-mono text-zinc-400 mb-1">
              <Activity className="w-3 h-3 text-emerald-500 mr-2" /> {activeProjects} PRJ ACTIVE
            </div>
            <div className="flex items-center text-xs font-mono text-zinc-400">
              <ListTodo className="w-3 h-3 text-amber-500 mr-2" /> {flows.length} FLOWS TOTAL
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Alerts & Flows */}
        <div className="space-y-6">
          <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4 flex items-center">
              <ShieldAlert className="w-3 h-3 mr-2" /> Alertas y Bloqueos
            </h3>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">No active alerts.</p>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className={clsx(
                    "flex items-start p-3 border rounded-lg",
                    alert.severity === 'CRITICAL' ? "bg-rose-950/20 border-rose-900/50" : "bg-amber-950/20 border-amber-900/50"
                  )}>
                    <AlertTriangle className={clsx(
                      "w-4 h-4 mt-0.5 mr-3 flex-shrink-0",
                      alert.severity === 'CRITICAL' ? "text-rose-500" : "text-amber-500"
                    )} />
                    <div>
                      <span className={clsx(
                        "text-sm block",
                        alert.severity === 'CRITICAL' ? "text-rose-200" : "text-amber-200"
                      )}>{alert.message}</span>
                      <span className="text-[10px] font-mono opacity-60 mt-1 block">{alert.type}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4 flex items-center">
              <Activity className="w-3 h-3 mr-2" /> Flujos Activos
            </h3>
            <div className="space-y-3">
              {flows.map(flow => (
                <div key={flow.id} className="flex flex-col p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-zinc-300">{flow.name}</span>
                    <span className={clsx(
                      "font-mono text-[10px] px-1.5 py-0.5 rounded border",
                      flow.status === 'running' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      flow.status === 'waiting_external' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-zinc-800 text-zinc-400 border-zinc-700"
                    )}>
                      {flow.status}
                    </span>
                  </div>
                  <div className="flex items-center text-[10px] font-mono text-zinc-500">
                    <span className="mr-3">Asignado: {flow.assignee}</span>
                    <span>Actualizado: {format(new Date(flow.lastRun), 'HH:mm')}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Column 2: Decisions & Launchers */}
        <div className="space-y-6">
          <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4 flex items-center">
              <GitCommit className="w-3 h-3 mr-2" /> Últimas Decisiones
            </h3>
            <div className="space-y-4">
              {decisions.map(dec => (
                <div key={dec.id} className="relative pl-4 border-l border-zinc-800 pb-4 last:pb-0 last:border-transparent">
                  <div className={clsx(
                    "absolute w-2 h-2 rounded-full -left-[4.5px] top-1.5 ring-4 ring-zinc-950",
                    dec.status === 'approved' ? "bg-emerald-500" :
                    dec.status === 'validated' ? "bg-indigo-500" : "bg-zinc-500"
                  )} />
                  <h4 className="text-sm font-medium text-zinc-200">{dec.title}</h4>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{dec.context}</p>
                  <div className="flex items-center mt-2 space-x-3">
                    <span className="font-mono text-[10px] text-zinc-600">{format(new Date(dec.date), 'MMM dd')}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                      {dec.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4 flex items-center">
              <ExternalLink className="w-3 h-3 mr-2" /> Lanzadores Rápidos
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {launchers.map(launcher => (
                <a 
                  key={launcher.id}
                  href={launcher.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-lg hover:bg-zinc-800 hover:border-zinc-700 transition-all group"
                >
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-emerald-400 transition-colors">{launcher.name}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-[10px] text-zinc-600">{launcher.role}</span>
                    <div className={clsx(
                      "w-1.5 h-1.5 rounded-full",
                      launcher.status === 'active' ? "bg-emerald-500" :
                      launcher.status === 'linked' ? "bg-indigo-500" : "bg-zinc-600"
                    )} />
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Column 3: Registro Maestro */}
        <div className="space-y-6">
          <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 h-full flex flex-col">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4 flex items-center">
              <TerminalSquare className="w-3 h-3 mr-2" /> Registro Maestro
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {masterRegistry.map(log => (
                <div key={log.id} className="p-3 bg-zinc-950/80 border border-zinc-800/50 rounded-lg font-mono text-xs">
                  <div className="flex justify-between text-[10px] text-zinc-600 mb-1.5">
                    <span>{format(new Date(log.timestamp), 'HH:mm:ss')}</span>
                    <span>{log.actor}</span>
                  </div>
                  <div className="text-zinc-300 mb-0.5">{log.entity}</div>
                  <div className="text-emerald-400/80">{log.action}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800/50 text-center">
              <button className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors">
                VER LOG COMPLETO →
              </button>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useOrbitStore, ProjectState } from '../store/useStore';
import { useParams } from 'react-router-dom';
import { Activity, AlertTriangle, GitCommit, GitMerge, Link as LinkIcon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

export default function ProjectDashboard() {
  const { id } = useParams();
  const { projects, flows, decisions, resources, alerts, updateProjectStatus } = useOrbitStore();

  const project = projects.find(p => p.id === id);
  const projectFlows = flows.filter(f => f.projectId === id);
  const projectDecisions = decisions.filter(d => d.projectId === id);
  const projectResources = resources.filter(r => r.projectId === id);
  const projectAlerts = alerts.filter(a => a.projectId === id);

  if (!project) return null;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateProjectStatus(project.id, e.target.value as ProjectState);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6">
        <div>
          <h3 className="text-lg font-medium text-zinc-200 mb-1">Estado General</h3>
          <p className="text-sm text-zinc-500">Última actualización: {format(new Date(project.lastUpdated), 'dd MMM yyyy HH:mm')}</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Progreso</span>
            <div className="flex items-center gap-3">
              <span className="text-xl font-light text-zinc-200">{project.progress}%</span>
              <div className="w-32 h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                <div 
                  className={clsx("h-full rounded-full", project.status === 'blocked' ? "bg-rose-500" : "bg-emerald-500")}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Estado</span>
            <select 
              value={project.status}
              onChange={handleStatusChange}
              className={clsx(
                "text-xs font-mono px-2 py-1 rounded border uppercase appearance-none cursor-pointer focus:outline-none",
                project.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                project.status === 'blocked' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                "bg-zinc-800 text-zinc-400 border-zinc-700"
              )}
            >
              <option value="draft">DRAFT</option>
              <option value="active">ACTIVE</option>
              <option value="blocked">BLOCKED</option>
              <option value="review">REVIEW</option>
              <option value="stable">STABLE</option>
              <option value="archived">ARCHIVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alertas Relevantes */}
      {projectAlerts.length > 0 && (
        <div className="space-y-2">
          {projectAlerts.map(alert => (
            <div key={alert.id} className={clsx(
              "flex items-start p-3 border rounded-lg",
              alert.severity === 'CRITICAL' ? "bg-rose-950/20 border-rose-900/50" : "bg-amber-950/20 border-amber-900/50"
            )}>
              <ShieldAlert className={clsx(
                "w-4 h-4 mt-0.5 mr-3 flex-shrink-0",
                alert.severity === 'CRITICAL' ? "text-rose-500" : "text-amber-500"
              )} />
              <div>
                <span className={clsx("text-sm block font-medium", alert.severity === 'CRITICAL' ? "text-rose-200" : "text-amber-200")}>
                  {alert.message}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Siguiente Acción Sugerida */}
      <div className="bg-indigo-950/20 border border-indigo-900/50 rounded-xl p-5 flex items-start gap-4">
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          <Activity className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-indigo-200 mb-1">Siguiente Acción Sugerida</h4>
          <p className="text-sm text-indigo-300/80">
            {project.status === 'blocked' 
              ? 'Revisar alertas críticas y desbloquear dependencias externas.'
              : project.status === 'draft'
              ? 'Definir flujos iniciales y asignar recursos clave.'
              : 'Revisar flujos en estado "waiting_external" para continuar el progreso.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flujos */}
        <section className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-5">
          <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4 flex items-center">
            <GitMerge className="w-3 h-3 mr-2" /> Flujos Relacionados
          </h4>
          <div className="space-y-3">
            {projectFlows.length === 0 ? <p className="text-xs text-zinc-600 italic">No hay flujos activos.</p> : projectFlows.map(flow => (
              <div key={flow.id} className="flex items-center justify-between p-2.5 bg-zinc-950/50 border border-zinc-800/50 rounded-lg">
                <span className="text-sm text-zinc-300">{flow.name}</span>
                <span className="font-mono text-[10px] text-zinc-500 uppercase">{flow.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Decisiones */}
        <section className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-5">
          <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4 flex items-center">
            <GitCommit className="w-3 h-3 mr-2" /> Decisiones Recientes
          </h4>
          <div className="space-y-3">
            {projectDecisions.length === 0 ? <p className="text-xs text-zinc-600 italic">No hay decisiones registradas.</p> : projectDecisions.map(dec => (
              <div key={dec.id} className="p-2.5 bg-zinc-950/50 border border-zinc-800/50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm text-zinc-300 font-medium">{dec.title}</span>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase">{dec.status}</span>
                </div>
                <p className="text-xs text-zinc-500 truncate">{dec.context}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recursos */}
        <section className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-5 md:col-span-2">
          <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4 flex items-center">
            <LinkIcon className="w-3 h-3 mr-2" /> Recursos Vinculados
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projectResources.length === 0 ? <p className="text-xs text-zinc-600 italic">No hay recursos vinculados.</p> : projectResources.map(res => (
              <div key={res.id} className="p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-sm text-zinc-300 block">{res.name}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{res.type}</span>
                </div>
                <div className={clsx(
                  "w-2 h-2 rounded-full",
                  res.status === 'active' ? "bg-emerald-500" : res.status === 'broken' ? "bg-rose-500" : "bg-zinc-500"
                )} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

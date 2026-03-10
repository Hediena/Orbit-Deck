import React, { useState } from 'react';
import { useOrbitStore, Resource } from '../store/useStore';
import { Search, ExternalLink, Database, Link as LinkIcon, Activity, Cpu, Plus, X } from 'lucide-react';
import { clsx } from 'clsx';

const LevelBadge = ({ level }: { level: Resource['integrationStatus'] }) => {
  const styles = {
    not_connected: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    configured: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    testing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    live: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const icons = {
    not_connected: LinkIcon,
    configured: Database,
    testing: Activity,
    live: Cpu,
    error: Activity,
  };

  const Icon = icons[level];

  return (
    <span className={clsx("flex items-center px-2 py-1 rounded text-[10px] font-mono border uppercase", styles[level])}>
      <Icon className="w-3 h-3 mr-1.5" />
      {level.replace('_', ' ')}
    </span>
  );
};

export default function OperationalDirectory() {
  const { resources, addResource, projects } = useOrbitStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<Resource['type']>('TOOL');
  const [role, setRole] = useState('');
  const [url, setUrl] = useState('');
  const [projectId, setProjectId] = useState('');

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;
    
    addResource({
      name,
      type,
      role,
      url: url.trim() || undefined,
      projectId: projectId || undefined,
      status: 'linked',
      integrationStatus: 'not_connected'
    });
    
    setIsModalOpen(false);
    setName('');
    setRole('');
    setUrl('');
    setProjectId('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-zinc-100">Directorio Operativo</h2>
          <p className="text-sm text-zinc-500 mt-1">Herramientas, agentes, personas y repositorios indexados.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar entidad..." 
              className="bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 w-64 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Recurso
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map(entity => (
          <div key={entity.id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700 transition-colors flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-medium text-zinc-200 flex items-center">
                  {entity.name}
                  {entity.url && (
                    <a href={entity.url} target="_blank" rel="noreferrer" className="ml-2 text-zinc-600 hover:text-emerald-400">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">{entity.role}</p>
              </div>
              <LevelBadge level={entity.integrationStatus} />
            </div>
            
            <div className="mt-auto pt-4 border-t border-zinc-800/50 grid grid-cols-2 gap-2">
              <div>
                <span className="block text-[10px] font-mono text-zinc-600 uppercase">Tipo</span>
                <span className="text-xs text-zinc-300">{entity.type}</span>
              </div>
              <div className="col-span-2 mt-2">
                <span className="block text-[10px] font-mono text-zinc-600 uppercase mb-1">Estado del Recurso</span>
                <div className="flex items-center">
                  <div className={clsx(
                    "w-1.5 h-1.5 rounded-full mr-2",
                    entity.status === 'active' ? 'bg-emerald-500' : 
                    entity.status === 'linked' ? 'bg-indigo-500' :
                    entity.status === 'broken' ? 'bg-rose-500' : 'bg-zinc-600'
                  )} />
                  <span className="text-xs font-mono text-zinc-400 uppercase">{entity.status}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nuevo Recurso */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-zinc-100">Nuevo Recurso</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateResource}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Nombre</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Figma"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Tipo</label>
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value as Resource['type'])}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="TOOL">Tool</option>
                      <option value="AGENT">Agent</option>
                      <option value="DOC">Document</option>
                      <option value="REPO">Repository</option>
                      <option value="LINK">Link</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Proyecto (Opcional)</label>
                    <select 
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="">Ninguno</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Rol / Propósito</label>
                  <input 
                    type="text" 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Ej. Diseño UI/UX"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">URL (Opcional)</label>
                  <input 
                    type="url" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={!name.trim() || !role.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Añadir Recurso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

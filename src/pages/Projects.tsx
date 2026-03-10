import React, { useState } from 'react';
import { useOrbitStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, ArrowRight, X } from 'lucide-react';
import { clsx } from 'clsx';

export default function Projects() {
  const { projects, addProject } = useOrbitStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    addProject({
      name: newProjectName,
      status: 'draft',
      progress: 0,
    });
    
    setNewProjectName('');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-zinc-100">Proyectos</h2>
          <p className="text-sm text-zinc-500 mt-1">Gestión estructural y estado de iniciativas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proyecto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(project => (
          <Link 
            key={project.id} 
            to={`/projects/${project.id}`}
            className="block bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 hover:bg-zinc-800/40 hover:border-zinc-700 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center mr-4">
                  <FolderKanban className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-zinc-200">{project.name}</h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="font-mono text-[10px] text-zinc-500">{project.id}</span>
                    <span className={clsx(
                      "font-mono text-[10px] px-1.5 py-0.5 rounded border uppercase",
                      project.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      project.status === 'blocked' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                      "bg-zinc-800 text-zinc-400 border-zinc-700"
                    )}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors transform group-hover:translate-x-1" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Progreso</span>
                <span className="font-mono text-zinc-300">{project.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                <div 
                  className={clsx(
                    "h-full rounded-full",
                    project.status === 'blocked' ? "bg-rose-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Modal Nuevo Proyecto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-zinc-100">Nuevo Proyecto</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Nombre del Proyecto</label>
                  <input 
                    type="text" 
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Ej. Rediseño de Checkout"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                    autoFocus
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
                  disabled={!newProjectName.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

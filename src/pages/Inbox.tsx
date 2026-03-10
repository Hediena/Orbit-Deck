import React, { useState } from 'react';
import { useOrbitStore, InboxItemType, InboxItemStatus } from '../store/useStore';
import { Inbox as InboxIcon, Plus, Filter, ArrowRight, X, CheckCircle2, Archive, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

export default function Inbox() {
  const { inboxItems, addInboxItem, updateInboxItemStatus, convertInboxItem, projects } = useOrbitStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemType, setNewItemType] = useState<InboxItemType>('idea');
  
  const [filterStatus, setFilterStatus] = useState<InboxItemStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<InboxItemType | 'all'>('all');

  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [convertTarget, setConvertTarget] = useState<'project' | 'resource' | 'decision'>('project');
  const [convertProjectId, setConvertProjectId] = useState<string>('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    
    await addInboxItem({
      title: newItemTitle,
      description: newItemDescription,
      type: newItemType,
      source: 'User Input',
    });
    
    setNewItemTitle('');
    setNewItemDescription('');
    setNewItemType('idea');
    setIsAdding(false);
  };

  const handleConvert = async (id: string) => {
    if (!convertTarget) return;
    
    const targetData: any = {};
    if (convertTarget === 'resource' || convertTarget === 'decision') {
      targetData.projectId = convertProjectId || undefined;
    }
    
    await convertInboxItem(id, convertTarget, targetData);
    setConvertingId(null);
  };

  const filteredItems = inboxItems.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterType !== 'all' && item.type !== filterType) return false;
    return true;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'idea': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'task': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'incident': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'decision_input': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <div className="w-2 h-2 rounded-full bg-emerald-500" />;
      case 'triaged': return <Clock className="w-3 h-3 text-amber-500" />;
      case 'converted': return <CheckCircle2 className="w-3 h-3 text-blue-500" />;
      case 'archived': return <Archive className="w-3 h-3 text-zinc-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <InboxIcon className="text-emerald-500" />
            Inbox y Captura
          </h2>
          <p className="text-zinc-400 mt-1">Bandeja de entrada centralizada para ideas, tareas y recursos.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-medium rounded-lg transition-colors"
        >
          <Plus size={18} />
          Capturar Elemento
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Filter size={16} />
          Filtros:
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500/50"
        >
          <option value="all">Todos los estados</option>
          <option value="new">Nuevos</option>
          <option value="triaged">Triados</option>
          <option value="converted">Convertidos</option>
          <option value="archived">Archivados</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500/50"
        >
          <option value="all">Todos los tipos</option>
          <option value="idea">Idea</option>
          <option value="task">Tarea</option>
          <option value="decision_input">Input de Decisión</option>
          <option value="resource_candidate">Candidato a Recurso</option>
          <option value="incident">Incidente</option>
          <option value="note">Nota</option>
          <option value="external_link">Enlace Externo</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/20 border border-zinc-800/50 rounded-xl border-dashed">
            <InboxIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">No hay elementos en el Inbox que coincidan con los filtros.</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between group hover:border-zinc-700 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  {getStatusIcon(item.status)}
                  <h4 className="text-base font-medium text-zinc-200 truncate">{item.title}</h4>
                  <span className={clsx("text-[10px] font-mono uppercase px-2 py-0.5 rounded border", getTypeColor(item.type))}>
                    {item.type}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-zinc-500 truncate mb-2">{item.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-zinc-600 font-mono">
                  <span>{format(new Date(item.createdAt), 'dd MMM HH:mm')}</span>
                  <span>Src: {item.source}</span>
                  {item.convertedEntityType && (
                    <span className="text-blue-400 flex items-center gap-1">
                      <ArrowRight size={12} />
                      {item.convertedEntityType}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.status !== 'converted' && item.status !== 'archived' && (
                  <>
                    <button
                      onClick={() => setConvertingId(item.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                    >
                      Convertir
                    </button>
                    <button
                      onClick={() => updateInboxItemStatus(item.id, 'archived')}
                      className="px-3 py-1.5 text-xs font-medium bg-zinc-800 text-zinc-400 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      Archivar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-white">Capturar Elemento</h3>
              <button onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Título</label>
                <input
                  type="text"
                  value={newItemTitle}
                  onChange={e => setNewItemTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Ej. Idea para nuevo módulo"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Descripción (opcional)</label>
                <textarea
                  value={newItemDescription}
                  onChange={e => setNewItemDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 h-24 resize-none"
                  placeholder="Detalles adicionales..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Tipo</label>
                <select
                  value={newItemType}
                  onChange={e => setNewItemType(e.target.value as InboxItemType)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="idea">Idea</option>
                  <option value="task">Tarea</option>
                  <option value="decision_input">Input de Decisión</option>
                  <option value="resource_candidate">Candidato a Recurso</option>
                  <option value="incident">Incidente</option>
                  <option value="note">Nota</option>
                  <option value="external_link">Enlace Externo</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-sm font-medium rounded-lg transition-colors"
                >
                  Guardar en Inbox
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {convertingId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-white">Convertir Elemento</h3>
              <button onClick={() => setConvertingId(null)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Convertir a</label>
                <select
                  value={convertTarget}
                  onChange={e => setConvertTarget(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="project">Proyecto</option>
                  <option value="resource">Recurso</option>
                  <option value="decision">Decisión</option>
                </select>
              </div>

              {(convertTarget === 'resource' || convertTarget === 'decision') && (
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Vincular a Proyecto (Opcional)</label>
                  <select
                    value={convertProjectId}
                    onChange={e => setConvertProjectId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Ninguno</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setConvertingId(null)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleConvert(convertingId)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <ArrowRight size={16} />
                  Confirmar Conversión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

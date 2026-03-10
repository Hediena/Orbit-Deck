import { Router } from 'express';
import db from './db.js';

const router = Router();

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// Helper to add log
function addLog(entity: string, action: string, actor: string, projectId?: string) {
  const stmt = db.prepare('INSERT INTO master_registry (id, timestamp, entity, action, actor, projectId) VALUES (?, ?, ?, ?, ?, ?)');
  const id = generateId('log');
  stmt.run(id, new Date().toISOString(), entity, action, actor, projectId || null);
  return { id, timestamp: new Date().toISOString(), entity, action, actor, projectId };
}

// Helper to add alert
function addAlert(message: string, severity: string, type: string, projectId?: string) {
  const stmt = db.prepare('INSERT INTO alerts (id, message, severity, type, projectId) VALUES (?, ?, ?, ?, ?)');
  const id = generateId('alr');
  stmt.run(id, message, severity, type, projectId || null);
  return { id, message, severity, type, projectId };
}

// Get all state (bootstrap)
router.get('/state', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY lastUpdated DESC').all();
  const flows = db.prepare('SELECT * FROM flows ORDER BY lastRun DESC').all();
  const decisions = db.prepare('SELECT * FROM decisions ORDER BY date DESC').all();
  const resources = db.prepare('SELECT * FROM resources').all();
  const alerts = db.prepare('SELECT * FROM alerts').all();
  const masterRegistry = db.prepare('SELECT * FROM master_registry ORDER BY timestamp DESC').all();
  const inboxItems = db.prepare('SELECT * FROM inbox_items ORDER BY createdAt DESC').all();

  res.json({
    projects,
    flows,
    decisions,
    resources,
    alerts,
    masterRegistry,
    inboxItems
  });
});

// Create Inbox Item
router.post('/inbox', (req, res) => {
  const { title, description, type, source, projectId } = req.body;
  
  if (!title || !type || !source) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = generateId('inb');
  const now = new Date().toISOString();
  const status = 'new';
  
  const stmt = db.prepare('INSERT INTO inbox_items (id, title, description, type, status, source, projectId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, title, description || null, type, status, source, projectId || null, now, now);
  
  const log = addLog(`Inbox: ${title}`, 'Elemento capturado', source, projectId);
  
  res.json({ 
    inboxItem: { id, title, description, type, status, source, projectId, createdAt: now, updatedAt: now, convertedEntityType: null, convertedEntityId: null }, 
    log 
  });
});

// Update Inbox Item
router.patch('/inbox/:id', (req, res) => {
  const { id } = req.params;
  const { status, actor = 'User' } = req.body;
  const now = new Date().toISOString();

  const item = db.prepare('SELECT * FROM inbox_items WHERE id = ?').get(id) as any;
  if (!item) return res.status(404).json({ error: 'Inbox item not found' });

  db.prepare('UPDATE inbox_items SET status = ?, updatedAt = ? WHERE id = ?').run(status, now, id);
  
  const log = addLog(`Inbox: ${item.title}`, `Estado cambiado a ${status.toUpperCase()}`, actor, item.projectId);
  
  res.json({ inboxItem: { ...item, status, updatedAt: now }, log });
});

// Convert Inbox Item
router.post('/inbox/:id/convert', (req, res) => {
  const { id } = req.params;
  const { targetType, targetData, actor = 'User' } = req.body;
  const now = new Date().toISOString();

  const item = db.prepare('SELECT * FROM inbox_items WHERE id = ?').get(id) as any;
  if (!item) return res.status(404).json({ error: 'Inbox item not found' });
  if (item.status === 'converted') return res.status(400).json({ error: 'Item already converted' });

  let newEntityId = '';
  let newEntity = null;
  const logs = [];

  db.transaction(() => {
    if (targetType === 'project') {
      newEntityId = generateId('prj');
      const stmt = db.prepare('INSERT INTO projects (id, name, status, progress, lastUpdated) VALUES (?, ?, ?, ?, ?)');
      stmt.run(newEntityId, targetData.name || item.title, 'draft', 0, now);
      newEntity = { id: newEntityId, name: targetData.name || item.title, status: 'draft', progress: 0, lastUpdated: now };
      logs.push(addLog(`Project: ${newEntity.name}`, 'Proyecto creado desde Inbox', actor, newEntityId));
    } else if (targetType === 'resource') {
      newEntityId = generateId('res');
      const stmt = db.prepare('INSERT INTO resources (id, name, type, role, status, integrationStatus, url, projectId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      stmt.run(newEntityId, targetData.name || item.title, targetData.type || 'LINK', targetData.role || 'Reference', 'active', 'not_connected', targetData.url || null, item.projectId || null);
      newEntity = { id: newEntityId, name: targetData.name || item.title, type: targetData.type || 'LINK', role: targetData.role || 'Reference', status: 'active', integrationStatus: 'not_connected', url: targetData.url, projectId: item.projectId };
      logs.push(addLog(`Resource: ${newEntity.name}`, 'Recurso creado desde Inbox', actor, item.projectId));
    } else if (targetType === 'decision') {
      newEntityId = generateId('dec');
      const stmt = db.prepare('INSERT INTO decisions (id, title, context, status, date, projectId) VALUES (?, ?, ?, ?, ?, ?)');
      stmt.run(newEntityId, targetData.title || item.title, targetData.context || item.description || '', 'proposed', now, item.projectId || null);
      newEntity = { id: newEntityId, title: targetData.title || item.title, context: targetData.context || item.description || '', status: 'proposed', date: now, projectId: item.projectId };
      logs.push(addLog(`Decision: ${newEntity.title}`, 'Decisión propuesta desde Inbox', actor, item.projectId));
    } else {
      throw new Error('Invalid target type');
    }

    db.prepare('UPDATE inbox_items SET status = ?, updatedAt = ?, convertedEntityType = ?, convertedEntityId = ? WHERE id = ?')
      .run('converted', now, targetType, newEntityId, id);
      
    logs.push(addLog(`Inbox: ${item.title}`, `Convertido a ${targetType.toUpperCase()}`, actor, item.projectId));
  })();

  res.json({ 
    inboxItem: { ...item, status: 'converted', updatedAt: now, convertedEntityType: targetType, convertedEntityId: newEntityId },
    newEntity,
    targetType,
    logs 
  });
});

// Create Project
router.post('/projects', (req, res) => {
  const { name, status, progress } = req.body;
  const id = generateId('prj');
  const lastUpdated = new Date().toISOString();
  
  const stmt = db.prepare('INSERT INTO projects (id, name, status, progress, lastUpdated) VALUES (?, ?, ?, ?, ?)');
  stmt.run(id, name, status, progress, lastUpdated);
  
  const log = addLog(`Project: ${name}`, 'Proyecto creado', 'User', id);
  
  res.json({ project: { id, name, status, progress, lastUpdated }, log });
});

// Create Resource
router.post('/resources', (req, res) => {
  const { name, type, role, status, integrationStatus, url, projectId } = req.body;
  const id = generateId('res');
  
  const stmt = db.prepare('INSERT INTO resources (id, name, type, role, status, integrationStatus, url, projectId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, name, type, role, status, integrationStatus, url || null, projectId || null);
  
  const log = addLog(`Resource: ${name}`, 'Recurso añadido', 'User', projectId);
  
  res.json({ resource: { id, name, type, role, status, integrationStatus, url, projectId }, log });
});

// Update Project Status
router.patch('/projects/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, actor = 'User' } = req.body;
  const lastUpdated = new Date().toISOString();

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  if (!project) return res.status(404).json({ error: 'Project not found' });

  db.prepare('UPDATE projects SET status = ?, lastUpdated = ? WHERE id = ?').run(status, lastUpdated, id);
  
  const log = addLog(`Project: ${project.name}`, `Estado cambiado a ${status.toUpperCase()}`, actor, id);
  
  let alert = null;
  if (status === 'blocked') {
    alert = addAlert(`Proyecto ${project.name} ha sido bloqueado.`, 'CRITICAL', 'BLOCKER', id);
  }

  res.json({ project: { ...project, status, lastUpdated }, log, alert });
});

// Update Flow Status
router.patch('/flows/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, actor = 'User' } = req.body;
  const lastRun = new Date().toISOString();

  const flow = db.prepare('SELECT * FROM flows WHERE id = ?').get(id) as any;
  if (!flow) return res.status(404).json({ error: 'Flow not found' });

  db.prepare('UPDATE flows SET status = ?, lastRun = ? WHERE id = ?').run(status, lastRun, id);
  
  const log = addLog(`Flow: ${flow.name}`, `Estado cambiado a ${status.toUpperCase()}`, actor, flow.projectId);
  
  let alert = null;
  if (status === 'failed') {
    alert = addAlert(`Flujo ${flow.name} ha fallado.`, 'CRITICAL', 'FLOW', flow.projectId);
  }

  res.json({ flow: { ...flow, status, lastRun }, log, alert });
});

// Update Resource Status
router.patch('/resources/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, integrationStatus, actor = 'User' } = req.body;

  const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(id) as any;
  if (!resource) return res.status(404).json({ error: 'Resource not found' });

  const newStatus = status || resource.status;
  const newIntegrationStatus = integrationStatus || resource.integrationStatus;

  db.prepare('UPDATE resources SET status = ?, integrationStatus = ? WHERE id = ?').run(newStatus, newIntegrationStatus, id);
  
  const log = addLog(`Resource: ${resource.name}`, `Estado actualizado a ${newStatus.toUpperCase()}`, actor, resource.projectId);
  
  let alert = null;
  if (newStatus === 'broken' || newIntegrationStatus === 'error') {
    alert = addAlert(`Recurso ${resource.name} reporta error o rotura.`, 'WARNING', 'SYSTEM', resource.projectId);
  }

  res.json({ resource: { ...resource, status: newStatus, integrationStatus: newIntegrationStatus }, log, alert });
});

// Create Decision
router.post('/decisions', (req, res) => {
  const { title, context, status, projectId, actor = 'User' } = req.body;
  const id = generateId('dec');
  const date = new Date().toISOString();
  
  const stmt = db.prepare('INSERT INTO decisions (id, title, context, status, date, projectId) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run(id, title, context, status, date, projectId || null);
  
  const logs = [];
  logs.push(addLog(`Decision: ${title}`, `Decisión registrada como ${status.toUpperCase()}`, actor, projectId));
  
  if (status === 'approved') {
    logs.push(addLog(`Decision: ${title}`, 'Decisión APROBADA', actor, projectId));
  }
  
  res.json({ decision: { id, title, context, status, date, projectId }, logs });
});

export default router;

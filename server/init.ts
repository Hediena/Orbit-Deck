import db from './db.js';

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      lastUpdated TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS flows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      assignee TEXT,
      lastRun TEXT NOT NULL,
      projectId TEXT
    );

    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      context TEXT NOT NULL,
      status TEXT NOT NULL,
      date TEXT NOT NULL,
      projectId TEXT
    );

    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      integrationStatus TEXT NOT NULL,
      url TEXT,
      projectId TEXT
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      message TEXT NOT NULL,
      severity TEXT NOT NULL,
      type TEXT NOT NULL,
      projectId TEXT
    );

    CREATE TABLE IF NOT EXISTS master_registry (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      entity TEXT NOT NULL,
      action TEXT NOT NULL,
      actor TEXT NOT NULL,
      projectId TEXT
    );

    CREATE TABLE IF NOT EXISTS inbox_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      source TEXT NOT NULL,
      projectId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      convertedEntityType TEXT,
      convertedEntityId TEXT
    );
  `);

  // Seed data if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
  if (count.count === 0) {
    const now = new Date().toISOString();
    
    const insertProject = db.prepare('INSERT INTO projects (id, name, status, progress, lastUpdated) VALUES (?, ?, ?, ?, ?)');
    insertProject.run('prj-001', 'Orbit Plus Core', 'active', 45, now);
    insertProject.run('prj-002', 'Client Portal Alpha', 'draft', 0, now);
    insertProject.run('prj-003', 'Data Pipeline v2', 'blocked', 80, now);

    const insertFlow = db.prepare('INSERT INTO flows (id, name, status, assignee, lastRun, projectId) VALUES (?, ?, ?, ?, ?, ?)');
    insertFlow.run('flw-001', 'Sync GitHub Commits', 'running', 'System', now, 'prj-001');
    insertFlow.run('flw-002', 'Revisión de Arquitectura', 'waiting_external', 'Lead', now, 'prj-001');

    const insertDecision = db.prepare('INSERT INTO decisions (id, title, context, status, date, projectId) VALUES (?, ?, ?, ?, ?, ?)');
    insertDecision.run('dec-001', 'Usar SQLite para persistencia v1', 'Evitar dependencias externas complejas.', 'approved', now, 'prj-001');

    const insertResource = db.prepare('INSERT INTO resources (id, name, type, role, status, integrationStatus, url, projectId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    insertResource.run('res-001', 'GitHub', 'REPO', 'Source Control', 'active', 'configured', 'https://github.com', 'prj-001');
    insertResource.run('res-002', 'ChatGPT', 'TOOL', 'Reasoning Engine', 'linked', 'configured', 'https://chat.openai.com', null);

    const insertAlert = db.prepare('INSERT INTO alerts (id, message, severity, type, projectId) VALUES (?, ?, ?, ?, ?)');
    insertAlert.run('alr-001', 'API Rate Limit warning on GitHub Integration', 'WARNING', 'SYSTEM', 'prj-001');
    insertAlert.run('alr-002', 'Data Pipeline v2 bloqueado por falta de credenciales', 'CRITICAL', 'BLOCKER', 'prj-003');

    const insertLog = db.prepare('INSERT INTO master_registry (id, timestamp, entity, action, actor, projectId) VALUES (?, ?, ?, ?, ?, ?)');
    insertLog.run('log-001', now, 'Decision: Migrar a PostgreSQL', 'Estado cambiado a PROPOSED', 'Admin', 'prj-003');
    
    const insertInbox = db.prepare('INSERT INTO inbox_items (id, title, description, type, status, source, projectId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    insertInbox.run('inb-001', 'Idea: Migrar a PostgreSQL', 'Necesitamos mejor concurrencia para la fase 3.', 'idea', 'new', 'User', null, now, now);
  }
}

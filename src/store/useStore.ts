import { create } from 'zustand';

export type ProjectState = 'draft' | 'active' | 'blocked' | 'review' | 'stable' | 'archived';
export type FlowState = 'new' | 'triaged' | 'assigned' | 'running' | 'waiting_external' | 'review' | 'approved' | 'failed' | 'closed';
export type DecisionState = 'proposed' | 'validated' | 'approved' | 'superseded';
export type ResourceState = 'linked' | 'active' | 'stale' | 'broken' | 'restricted';
export type IntegrationState = 'not_connected' | 'configured' | 'testing' | 'live' | 'error';
export type InboxItemType = 'idea' | 'task' | 'decision_input' | 'resource_candidate' | 'incident' | 'note' | 'external_link';
export type InboxItemStatus = 'new' | 'triaged' | 'converted' | 'archived';

export interface Project {
  id: string;
  name: string;
  status: ProjectState;
  progress: number;
  lastUpdated: string;
}

export interface Flow {
  id: string;
  name: string;
  status: FlowState;
  assignee?: string;
  lastRun: string;
  projectId?: string;
}

export interface Decision {
  id: string;
  title: string;
  context: string;
  status: DecisionState;
  date: string;
  projectId?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'TOOL' | 'AGENT' | 'DOC' | 'REPO' | 'LINK';
  role: string;
  status: ResourceState;
  integrationStatus: IntegrationState;
  url?: string;
  projectId?: string;
}

export interface Alert {
  id: string;
  message: string;
  severity: 'WARNING' | 'CRITICAL' | 'INFO';
  type: 'BLOCKER' | 'SYSTEM' | 'FLOW';
  projectId?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  entity: string;
  action: string;
  actor: string;
  projectId?: string;
}

export interface InboxItem {
  id: string;
  title: string;
  description?: string;
  type: InboxItemType;
  status: InboxItemStatus;
  source: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  convertedEntityType?: string;
  convertedEntityId?: string;
}

interface OrbitState {
  projects: Project[];
  flows: Flow[];
  decisions: Decision[];
  resources: Resource[];
  alerts: Alert[];
  masterRegistry: LogEntry[];
  inboxItems: InboxItem[];
  
  // Actions
  fetchState: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'lastUpdated'>) => Promise<void>;
  addResource: (resource: Omit<Resource, 'id'>) => Promise<void>;
  updateProjectStatus: (id: string, status: ProjectState, actor?: string) => Promise<void>;
  updateFlowStatus: (id: string, status: FlowState, actor?: string) => Promise<void>;
  updateResourceStatus: (id: string, status: ResourceState, integrationStatus?: IntegrationState, actor?: string) => Promise<void>;
  addDecision: (decision: Omit<Decision, 'id' | 'date'>, actor?: string) => Promise<void>;
  addInboxItem: (item: Omit<InboxItem, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'convertedEntityType' | 'convertedEntityId'>) => Promise<void>;
  updateInboxItemStatus: (id: string, status: InboxItemStatus, actor?: string) => Promise<void>;
  convertInboxItem: (id: string, targetType: 'project' | 'resource' | 'decision', targetData: any, actor?: string) => Promise<void>;
}

export const useOrbitStore = create<OrbitState>((set, get) => ({
  projects: [],
  flows: [],
  decisions: [],
  resources: [],
  alerts: [],
  masterRegistry: [],
  inboxItems: [],

  fetchState: async () => {
    try {
      const response = await fetch('/api/state');
      if (!response.ok) throw new Error('Failed to fetch state');
      const data = await response.json();
      set({
        projects: data.projects,
        flows: data.flows,
        decisions: data.decisions,
        resources: data.resources,
        alerts: data.alerts,
        masterRegistry: data.masterRegistry,
        inboxItems: data.inboxItems || []
      });
    } catch (error) {
      console.error('Error fetching state:', error);
    }
  },

  addProject: async (project) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      if (!response.ok) throw new Error('Failed to create project');
      const data = await response.json();
      set((state) => ({
        projects: [data.project, ...state.projects],
        masterRegistry: [data.log, ...state.masterRegistry]
      }));
    } catch (error) {
      console.error('Error creating project:', error);
    }
  },

  addResource: async (resource) => {
    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resource)
      });
      if (!response.ok) throw new Error('Failed to create resource');
      const data = await response.json();
      set((state) => ({
        resources: [data.resource, ...state.resources],
        masterRegistry: [data.log, ...state.masterRegistry]
      }));
    } catch (error) {
      console.error('Error creating resource:', error);
    }
  },

  updateProjectStatus: async (id, status, actor = 'User') => {
    try {
      const response = await fetch(`/api/projects/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actor })
      });
      if (!response.ok) throw new Error('Failed to update project status');
      const data = await response.json();
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? data.project : p),
        masterRegistry: [data.log, ...state.masterRegistry],
        alerts: data.alert ? [data.alert, ...state.alerts] : state.alerts
      }));
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  },

  updateFlowStatus: async (id, status, actor = 'User') => {
    try {
      const response = await fetch(`/api/flows/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actor })
      });
      if (!response.ok) throw new Error('Failed to update flow status');
      const data = await response.json();
      set((state) => ({
        flows: state.flows.map(f => f.id === id ? data.flow : f),
        masterRegistry: [data.log, ...state.masterRegistry],
        alerts: data.alert ? [data.alert, ...state.alerts] : state.alerts
      }));
    } catch (error) {
      console.error('Error updating flow status:', error);
    }
  },

  updateResourceStatus: async (id, status, integrationStatus, actor = 'User') => {
    try {
      const response = await fetch(`/api/resources/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, integrationStatus, actor })
      });
      if (!response.ok) throw new Error('Failed to update resource status');
      const data = await response.json();
      set((state) => ({
        resources: state.resources.map(r => r.id === id ? data.resource : r),
        masterRegistry: [data.log, ...state.masterRegistry],
        alerts: data.alert ? [data.alert, ...state.alerts] : state.alerts
      }));
    } catch (error) {
      console.error('Error updating resource status:', error);
    }
  },

  addDecision: async (decision, actor = 'User') => {
    try {
      const response = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...decision, actor })
      });
      if (!response.ok) throw new Error('Failed to create decision');
      const data = await response.json();
      set((state) => ({
        decisions: [data.decision, ...state.decisions],
        masterRegistry: [...data.logs.reverse(), ...state.masterRegistry]
      }));
    } catch (error) {
      console.error('Error creating decision:', error);
    }
  },

  addInboxItem: async (item) => {
    try {
      const response = await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!response.ok) throw new Error('Failed to create inbox item');
      const data = await response.json();
      set((state) => ({
        inboxItems: [data.inboxItem, ...state.inboxItems],
        masterRegistry: [data.log, ...state.masterRegistry]
      }));
    } catch (error) {
      console.error('Error creating inbox item:', error);
    }
  },

  updateInboxItemStatus: async (id, status, actor = 'User') => {
    try {
      const response = await fetch(`/api/inbox/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actor })
      });
      if (!response.ok) throw new Error('Failed to update inbox item status');
      const data = await response.json();
      set((state) => ({
        inboxItems: state.inboxItems.map(i => i.id === id ? data.inboxItem : i),
        masterRegistry: [data.log, ...state.masterRegistry]
      }));
    } catch (error) {
      console.error('Error updating inbox item status:', error);
    }
  },

  convertInboxItem: async (id, targetType, targetData, actor = 'User') => {
    try {
      const response = await fetch(`/api/inbox/${id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetData, actor })
      });
      if (!response.ok) throw new Error('Failed to convert inbox item');
      const data = await response.json();
      
      set((state) => {
        const newState: Partial<OrbitState> = {
          inboxItems: state.inboxItems.map(i => i.id === id ? data.inboxItem : i),
          masterRegistry: [...data.logs.reverse(), ...state.masterRegistry]
        };
        
        if (data.targetType === 'project') {
          newState.projects = [data.newEntity, ...state.projects];
        } else if (data.targetType === 'resource') {
          newState.resources = [data.newEntity, ...state.resources];
        } else if (data.targetType === 'decision') {
          newState.decisions = [data.newEntity, ...state.decisions];
        }
        
        return newState;
      });
    } catch (error) {
      console.error('Error converting inbox item:', error);
    }
  }
}));

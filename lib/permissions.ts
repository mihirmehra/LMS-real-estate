'use client';

import { User, Role, Permission } from '@/types/auth';

// Define permissions for each role
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    { resource: 'leads', actions: ['create', 'read', 'update', 'delete', 'assign'] },
    { resource: 'agents', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'analytics', actions: ['read', 'export'] },
    { resource: 'reports', actions: ['read', 'export', 'create'] },
    { resource: 'settings', actions: ['read', 'update'] },
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'calendar', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'communications', actions: ['create', 'read', 'update', 'delete'] },
  ],
  agent: [
    { resource: 'leads', actions: ['create', 'read', 'update'] }, // No assign permission
    { resource: 'analytics', actions: ['read'] }, // Only own data
    { resource: 'reports', actions: ['read'] }, // Only own data
    { resource: 'calendar', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'communications', actions: ['create', 'read', 'update'] },
  ],
};

export class PermissionService {
  private static instance: PermissionService;

  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  // Check if user has permission for a specific action on a resource
  hasPermission(user: User | null, resource: string, action: string): boolean {
    if (!user) return false;

    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    const resourcePermission = rolePermissions.find(p => p.resource === resource);
    
    return resourcePermission?.actions.includes(action) || false;
  }

  // Check if user can access a specific lead (agents can only access their assigned leads or leads they created)
  canAccessLead(user: User | null, leadAssignedAgent?: string, leadCreatedBy?: string): boolean {
    if (!user) return false;
    
    // Admins can access all leads
    if (user.role === 'admin') return true;
    
    // Agents can ONLY see:
    // 1. Leads assigned to them
    // 2. Leads they created themselves
    if (user.role === 'agent') {
      return leadAssignedAgent === user.id || leadCreatedBy === user.id;
    }
    
    return false;
  }

  // Check if user can edit a specific lead
  canEditLead(user: User | null, leadAssignedAgent?: string, leadCreatedBy?: string): boolean {
    if (!user) return false;
    
    // Admins can edit all leads
    if (user.role === 'admin') return true;
    
    // Agents can only edit:
    // 1. Leads assigned to them
    // 2. Leads they created themselves
    if (user.role === 'agent') {
      return leadAssignedAgent === user.id || leadCreatedBy === user.id;
    }
    
    return false;
  }

  // Get all permissions for a user role
  getRolePermissions(role: 'admin' | 'agent'): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  // Check if user can perform admin actions
  isAdmin(user: User | null): boolean {
    return user?.role === 'admin';
  }

  // Check if user can manage other users
  canManageUsers(user: User | null): boolean {
    return this.hasPermission(user, 'users', 'create') || 
           this.hasPermission(user, 'users', 'update') || 
           this.hasPermission(user, 'users', 'delete');
  }

  // Check if user can assign leads (only admins)
  canAssignLeads(user: User | null): boolean {
    return this.hasPermission(user, 'leads', 'assign');
  }

  // Check if user can export data
  canExportData(user: User | null): boolean {
    return this.hasPermission(user, 'analytics', 'export') || 
           this.hasPermission(user, 'reports', 'export');
  }

  // Filter leads based on user permissions - STRICT PRIVACY
  filterLeadsForUser(leads: any[], user: User | null): any[] {
    if (!user) return [];
    
    // Admins can see all leads
    if (user.role === 'admin') return leads;
    
    // Agents can ONLY see:
    // 1. Leads assigned to them
    // 2. Leads they created themselves
    // NO unassigned leads visible to agents for privacy
    if (user.role === 'agent') {
      return leads.filter(lead => 
        lead.assignedAgent === user.id || lead.createdBy === user.id
      );
    }
    
    return [];
  }

  // Filter analytics data for agents - only their own data
  filterAnalyticsForUser(data: any, user: User | null): any {
    if (!user) return null;
    
    // Admins see all data
    if (user.role === 'admin') return data;
    
    // Agents see only their own data
    if (user.role === 'agent') {
      // Filter any analytics to only include the current agent's data
      if (Array.isArray(data)) {
        return data.filter((item: any) => 
          item.agentId === user.id || 
          item.assignedAgent === user.id ||
          item.createdBy === user.id
        );
      }
      
      // For object data, filter properties
      if (typeof data === 'object' && data !== null) {
        const filteredData = { ...data };
        
        // Filter agent-specific arrays
        if (filteredData.agentPerformance) {
          filteredData.agentPerformance = filteredData.agentPerformance.filter(
            (agent: any) => agent.agentId === user.id
          );
        }
        
        if (filteredData.leadsByAgent) {
          filteredData.leadsByAgent = { [user.id]: filteredData.leadsByAgent[user.id] || 0 };
        }
        
        return filteredData;
      }
    }
    
    return data;
  }

  // Check if agent can see other agent's data (always false for privacy)
  canSeeOtherAgentData(user: User | null): boolean {
    if (!user) return false;
    
    // Only admins can see other agents' data
    return user.role === 'admin';
  }

  // Filter agent list for dropdowns - show all agents for admins, only self for agents
  filterAgentsForUser(agents: any[], user: User | null): any[] {
    if (!user) return [];
    
    // Admins can see all agents
    if (user.role === 'admin') return agents;
    
    // Agents can only see themselves in assignment dropdowns
    if (user.role === 'agent') {
      return agents.filter(agent => agent.id === user.id || agent.userId === user.id);
    }
    
    return [];
  }

  // Get navigation items based on user permissions
  getNavigationItems(user: User | null): Array<{
    name: string;
    href: string;
    icon: any;
    visible: boolean;
  }> {
    if (!user) return [];

    return [
      {
        name: 'Dashboard',
        href: '/',
        icon: 'Home',
        visible: true,
      },
      {
        name: 'Leads',
        href: '/',
        icon: 'Users',
        visible: this.hasPermission(user, 'leads', 'read'),
      },
      {
        name: 'Analytics',
        href: '/analytics',
        icon: 'BarChart3',
        visible: this.hasPermission(user, 'analytics', 'read'),
      },
      {
        name: 'Calendar',
        href: '/calendar',
        icon: 'Calendar',
        visible: this.hasPermission(user, 'calendar', 'read'),
      },
      {
        name: 'Communications',
        href: '/communications',
        icon: 'MessageCircle',
        visible: this.hasPermission(user, 'communications', 'read'),
      },
      {
        name: 'Reports',
        href: '/reports',
        icon: 'FileText',
        visible: this.hasPermission(user, 'reports', 'read'),
      },
      {
        name: 'User Management',
        href: '/admin/users',
        icon: 'Settings',
        visible: this.canManageUsers(user),
      },
      {
        name: 'Lead Assignment',
        href: '/admin/leads',
        icon: 'Target',
        visible: this.canAssignLeads(user),
      },
    ];
  }
}

export default PermissionService;
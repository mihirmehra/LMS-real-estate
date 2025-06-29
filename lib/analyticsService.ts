'use client';

import { Lead, Agent } from '@/types/lead';
import { User } from '@/types/auth';
import { 
  LeadSourceAnalytics, 
  AgentPerformance, 
  LeadStatusFunnel, 
  ConversionMetrics,
  ActivityReport,
  DashboardMetrics,
  ReportFilters,
  MonthlyPerformance,
  ActivityTrendData
} from '@/types/analytics';

export class AnalyticsService {
  private static instance: AnalyticsService;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Filter leads based on user role for privacy
  private filterLeadsForUser(leads: Lead[], user: User | null): Lead[] {
    if (!user) return [];
    
    // Admins see all leads
    if (user.role === 'admin') return leads;
    
    // Agents only see their own leads
    if (user.role === 'agent') {
      return leads.filter(lead => 
        lead.assignedAgent === user.id || lead.createdBy === user.id
      );
    }
    
    return [];
  }

  // Lead Source Analysis - filtered by user
  generateLeadSourceAnalytics(leads: Lead[], filters?: ReportFilters, user?: User | null): LeadSourceAnalytics[] {
    const userFilteredLeads = this.filterLeadsForUser(leads, user);
    const filteredLeads = this.applyFilters(userFilteredLeads, filters);
    const sourceMap = new Map<string, Lead[]>();

    // Group leads by source
    filteredLeads.forEach(lead => {
      if (!sourceMap.has(lead.source)) {
        sourceMap.set(lead.source, []);
      }
      sourceMap.get(lead.source)!.push(lead);
    });

    return Array.from(sourceMap.entries()).map(([source, sourceLeads]) => {
      const totalLeads = sourceLeads.length;
      const qualifiedLeads = sourceLeads.filter(lead => 
        ['Qualified', 'Site Visit Scheduled', 'Site Visited', 'Negotiation', 'Converted'].includes(lead.status)
      ).length;
      const convertedLeads = sourceLeads.filter(lead => lead.status === 'Converted').length;
      
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
      
      const averageTimeToConvert = this.calculateAverageTimeToConvert(
        sourceLeads.filter(lead => lead.status === 'Converted')
      );

      return {
        source,
        totalLeads,
        qualifiedLeads,
        convertedLeads,
        conversionRate: Math.round(conversionRate * 100) / 100,
        qualificationRate: Math.round(qualificationRate * 100) / 100,
        averageTimeToConvert,
      };
    }).sort((a, b) => b.totalLeads - a.totalLeads);
  }

  // Agent Performance Analysis - filtered by user
  generateAgentPerformance(leads: Lead[], agents: Agent[], filters?: ReportFilters, user?: User | null): AgentPerformance[] {
    const userFilteredLeads = this.filterLeadsForUser(leads, user);
    const filteredLeads = this.applyFilters(userFilteredLeads, filters);
    
    // Filter agents based on user role
    let relevantAgents = agents.filter(agent => agent.active);
    
    // Agents can only see their own performance
    if (user?.role === 'agent') {
      relevantAgents = agents.filter(agent => 
        agent.id === user.id || agent.userId === user.id
      );
    }
    
    return relevantAgents.map(agent => {
      const agentLeads = filteredLeads.filter(lead => 
        lead.assignedAgent === agent.id || 
        (user?.role === 'agent' && lead.createdBy === user.id)
      );
      
      const totalLeads = agentLeads.length;
      const activeLeads = agentLeads.filter(lead => 
        !['Converted', 'Lost'].includes(lead.status)
      ).length;
      const convertedLeads = agentLeads.filter(lead => lead.status === 'Converted').length;
      const lostLeads = agentLeads.filter(lead => lead.status === 'Lost').length;
      
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      const averageTimeToClose = this.calculateAverageTimeToConvert(
        agentLeads.filter(lead => lead.status === 'Converted')
      );

      // Calculate activity counts
      const totalActivities = agentLeads.reduce((sum, lead) => sum + lead.activities.length, 0);
      const callsCount = agentLeads.reduce((sum, lead) => 
        sum + lead.activities.filter(activity => activity.type === 'Call').length, 0
      );
      const emailsCount = agentLeads.reduce((sum, lead) => 
        sum + lead.activities.filter(activity => activity.type === 'Email').length, 0
      );
      const meetingsCount = agentLeads.reduce((sum, lead) => 
        sum + lead.activities.filter(activity => activity.type === 'Meeting').length, 0
      );
      const notesCount = agentLeads.reduce((sum, lead) => 
        sum + lead.activities.filter(activity => activity.type === 'Note').length, 0
      );

      // Generate monthly performance
      const monthlyPerformance = this.generateMonthlyPerformance(agentLeads);

      return {
        agentId: agent.id,
        agentName: agent.name,
        totalLeads,
        activeLeads,
        convertedLeads,
        lostLeads,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageTimeToClose,
        totalActivities,
        callsCount,
        emailsCount,
        meetingsCount,
        notesCount,
        monthlyPerformance,
      };
    }).sort((a, b) => b.conversionRate - a.conversionRate);
  }

  // Lead Status Funnel Analysis - filtered by user
  generateLeadStatusFunnel(leads: Lead[], filters?: ReportFilters, user?: User | null): LeadStatusFunnel[] {
    const userFilteredLeads = this.filterLeadsForUser(leads, user);
    const filteredLeads = this.applyFilters(userFilteredLeads, filters);
    const statusOrder = [
      'New', 'Contacted', 'Qualified', 'Nurturing', 'Site Visit Scheduled', 
      'Site Visited', 'Negotiation', 'Converted', 'Lost', 'Hold'
    ];

    const statusCounts = statusOrder.map(status => {
      const statusLeads = filteredLeads.filter(lead => lead.status === status);
      const count = statusLeads.length;
      const percentage = filteredLeads.length > 0 ? (count / filteredLeads.length) * 100 : 0;
      
      // Calculate average time in status (simplified - would need status change history in real app)
      const averageTimeInStatus = this.calculateAverageTimeInStatus(statusLeads);
      
      // Calculate conversion and drop-off rates (simplified)
      const conversionRate = this.calculateStatusConversionRate(filteredLeads, status, statusOrder);
      const dropOffRate = status === 'Lost' ? 100 : this.calculateDropOffRate(filteredLeads, status);

      return {
        status,
        count,
        percentage: Math.round(percentage * 100) / 100,
        averageTimeInStatus,
        conversionRate,
        dropOffRate,
      };
    });

    return statusCounts.filter(status => status.count > 0);
  }

  // Conversion Metrics - filtered by user
  generateConversionMetrics(leads: Lead[], filters?: ReportFilters, user?: User | null): ConversionMetrics {
    const userFilteredLeads = this.filterLeadsForUser(leads, user);
    const filteredLeads = this.applyFilters(userFilteredLeads, filters);
    const totalLeads = filteredLeads.length;
    const convertedLeads = filteredLeads.filter(lead => lead.status === 'Converted').length;
    const overallConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const averageTimeToConvert = this.calculateAverageTimeToConvert(
      filteredLeads.filter(lead => lead.status === 'Converted')
    );

    // Conversion by source
    const conversionBySource: Record<string, number> = {};
    const sourceGroups = this.groupBy(filteredLeads, 'source');
    Object.entries(sourceGroups).forEach(([source, sourceLeads]) => {
      const converted = sourceLeads.filter(lead => lead.status === 'Converted').length;
      conversionBySource[source] = sourceLeads.length > 0 ? (converted / sourceLeads.length) * 100 : 0;
    });

    // Conversion by agent - only show current agent for agents
    const conversionByAgent: Record<string, number> = {};
    const agentGroups = this.groupBy(filteredLeads.filter(lead => lead.assignedAgent), 'assignedAgent');
    Object.entries(agentGroups).forEach(([agentId, agentLeads]) => {
      // For agents, only show their own data
      if (user?.role === 'agent' && agentId !== user.id) return;
      
      const converted = agentLeads.filter(lead => lead.status === 'Converted').length;
      conversionByAgent[agentId] = agentLeads.length > 0 ? (converted / agentLeads.length) * 100 : 0;
    });

    // Conversion by property type
    const conversionByPropertyType: Record<string, number> = {};
    const propertyGroups = this.groupBy(filteredLeads, 'propertyType');
    Object.entries(propertyGroups).forEach(([propertyType, propertyLeads]) => {
      const converted = propertyLeads.filter(lead => lead.status === 'Converted').length;
      conversionByPropertyType[propertyType] = propertyLeads.length > 0 ? (converted / propertyLeads.length) * 100 : 0;
    });

    // Monthly conversions
    const monthlyConversions = this.generateMonthlyConversions(filteredLeads);

    return {
      totalLeads,
      convertedLeads,
      overallConversionRate: Math.round(overallConversionRate * 100) / 100,
      averageTimeToConvert,
      conversionBySource,
      conversionByAgent,
      conversionByPropertyType,
      monthlyConversions,
    };
  }

  // Activity Report - filtered by user
  generateActivityReport(leads: Lead[], agentId?: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly', user?: User | null): ActivityReport {
    const userFilteredLeads = this.filterLeadsForUser(leads, user);
    
    // For agents, only show their own activities
    let filteredLeads = userFilteredLeads;
    if (agentId && user?.role === 'agent' && agentId !== user.id) {
      // Agents cannot see other agents' activities
      filteredLeads = userFilteredLeads.filter(lead => 
        lead.assignedAgent === user.id || lead.createdBy === user.id
      );
    } else if (agentId) {
      filteredLeads = userFilteredLeads.filter(lead => lead.assignedAgent === agentId);
    }
    
    const now = new Date();
    const startDate = this.getStartDateForPeriod(now, period);
    const endDate = now;

    // Filter activities by date range
    const activities = filteredLeads.flatMap(lead => 
      lead.activities.filter(activity => 
        new Date(activity.date) >= startDate && new Date(activity.date) <= endDate
      )
    );

    const totalActivities = activities.length;
    const callsCount = activities.filter(activity => activity.type === 'Call').length;
    const emailsCount = activities.filter(activity => activity.type === 'Email').length;
    const meetingsCount = activities.filter(activity => activity.type === 'Meeting').length;
    const notesCount = activities.filter(activity => activity.type === 'Note').length;
    const whatsappCount = 0; // Would be calculated from communication activities
    const calendarEventsCount = 0; // Would be calculated from communication activities

    const averageActivitiesPerLead = filteredLeads.length > 0 ? totalActivities / filteredLeads.length : 0;

    // Generate activity trend data
    const activityTrend = this.generateActivityTrend(activities, startDate, endDate, period);

    return {
      agentId,
      period,
      startDate,
      endDate,
      totalActivities,
      callsCount,
      emailsCount,
      meetingsCount,
      notesCount,
      whatsappCount,
      calendarEventsCount,
      averageActivitiesPerLead: Math.round(averageActivitiesPerLead * 100) / 100,
      activityTrend,
    };
  }

  // Dashboard Metrics - filtered by user
  generateDashboardMetrics(leads: Lead[], user?: User | null): DashboardMetrics {
    const userFilteredLeads = this.filterLeadsForUser(leads, user);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const totalLeads = userFilteredLeads.length;
    const newLeadsToday = userFilteredLeads.filter(lead => 
      new Date(lead.createdAt) >= today
    ).length;
    const newLeadsThisWeek = userFilteredLeads.filter(lead => 
      new Date(lead.createdAt) >= weekAgo
    ).length;
    const newLeadsThisMonth = userFilteredLeads.filter(lead => 
      new Date(lead.createdAt) >= monthAgo
    ).length;

    const qualifiedLeads = userFilteredLeads.filter(lead => 
      ['Qualified', 'Site Visit Scheduled', 'Site Visited', 'Negotiation'].includes(lead.status)
    ).length;
    const convertedLeads = userFilteredLeads.filter(lead => lead.status === 'Converted').length;
    const lostLeads = userFilteredLeads.filter(lead => lead.status === 'Lost').length;
    const activeLeads = userFilteredLeads.filter(lead => 
      !['Converted', 'Lost'].includes(lead.status)
    ).length;

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const averageTimeToConvert = this.calculateAverageTimeToConvert(
      userFilteredLeads.filter(lead => lead.status === 'Converted')
    );

    // Find top performing agent and lead source (only for current user's data)
    const sourceAnalytics = this.generateLeadSourceAnalytics(userFilteredLeads, undefined, user);
    const topLeadSource = sourceAnalytics.length > 0 ? sourceAnalytics[0].source : 'N/A';

    const recentActivities = userFilteredLeads.reduce((sum, lead) => 
      sum + lead.activities.filter(activity => 
        new Date(activity.date) >= weekAgo
      ).length, 0
    );

    return {
      totalLeads,
      newLeadsToday,
      newLeadsThisWeek,
      newLeadsThisMonth,
      qualifiedLeads,
      convertedLeads,
      lostLeads,
      activeLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageTimeToConvert,
      topPerformingAgent: user?.role === 'agent' ? user.name : 'N/A',
      topLeadSource,
      recentActivities,
    };
  }

  // Helper methods (unchanged)
  private applyFilters(leads: Lead[], filters?: ReportFilters): Lead[] {
    if (!filters) return leads;

    return leads.filter(lead => {
      if (filters.dateRange) {
        const leadDate = new Date(lead.createdAt);
        if (leadDate < filters.dateRange.startDate || leadDate > filters.dateRange.endDate) {
          return false;
        }
      }

      if (filters.agentIds && filters.agentIds.length > 0) {
        if (!lead.assignedAgent || !filters.agentIds.includes(lead.assignedAgent)) {
          return false;
        }
      }

      if (filters.sources && filters.sources.length > 0) {
        if (!filters.sources.includes(lead.source)) {
          return false;
        }
      }

      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        if (!filters.propertyTypes.includes(lead.propertyType)) {
          return false;
        }
      }

      if (filters.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(lead.status)) {
          return false;
        }
      }

      return true;
    });
  }

  private calculateAverageTimeToConvert(convertedLeads: Lead[]): number {
    if (convertedLeads.length === 0) return 0;

    const totalDays = convertedLeads.reduce((sum, lead) => {
      const createdDate = new Date(lead.createdAt);
      const updatedDate = new Date(lead.updatedAt);
      const daysDiff = Math.floor((updatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + daysDiff;
    }, 0);

    return Math.round(totalDays / convertedLeads.length);
  }

  private calculateAverageTimeInStatus(statusLeads: Lead[]): number {
    if (statusLeads.length === 0) return 0;
    
    // Simplified calculation - in real app would need status change history
    const totalDays = statusLeads.reduce((sum, lead) => {
      const createdDate = new Date(lead.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + daysDiff;
    }, 0);

    return Math.round(totalDays / statusLeads.length);
  }

  private calculateStatusConversionRate(leads: Lead[], status: string, statusOrder: string[]): number {
    const statusIndex = statusOrder.indexOf(status);
    if (statusIndex === -1 || statusIndex === statusOrder.length - 1) return 0;

    const currentStatusLeads = leads.filter(lead => lead.status === status).length;
    if (currentStatusLeads === 0) return 0;

    // Simplified - would need proper status transition tracking
    return Math.random() * 100; // Placeholder
  }

  private calculateDropOffRate(leads: Lead[], status: string): number {
    // Simplified calculation - would need proper status transition tracking
    return Math.random() * 20; // Placeholder
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private generateMonthlyPerformance(leads: Lead[]): MonthlyPerformance[] {
    const monthlyData = new Map<string, { assigned: number; converted: number }>();

    leads.forEach(lead => {
      const date = new Date(lead.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { assigned: 0, converted: 0 });
      }
      
      const data = monthlyData.get(monthKey)!;
      data.assigned++;
      if (lead.status === 'Converted') {
        data.converted++;
      }
    });

    return Array.from(monthlyData.entries()).map(([monthKey, data]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
      
      return {
        month: monthName,
        year,
        leadsAssigned: data.assigned,
        leadsConverted: data.converted,
        conversionRate: data.assigned > 0 ? (data.converted / data.assigned) * 100 : 0,
      };
    }).sort((a, b) => a.year - b.year || a.month.localeCompare(b.month));
  }

  private generateMonthlyConversions(leads: Lead[]) {
    const monthlyData = new Map<string, { total: number; converted: number }>();

    leads.forEach(lead => {
      const date = new Date(lead.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { total: 0, converted: 0 });
      }
      
      const data = monthlyData.get(monthKey)!;
      data.total++;
      if (lead.status === 'Converted') {
        data.converted++;
      }
    });

    return Array.from(monthlyData.entries()).map(([monthKey, data]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
      
      return {
        month: monthName,
        year,
        totalLeads: data.total,
        convertedLeads: data.converted,
        conversionRate: data.total > 0 ? (data.converted / data.total) * 100 : 0,
      };
    });
  }

  private getStartDateForPeriod(endDate: Date, period: 'daily' | 'weekly' | 'monthly'): Date {
    const start = new Date(endDate);
    
    switch (period) {
      case 'daily':
        start.setDate(start.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
    }
    
    return start;
  }

  private generateActivityTrend(activities: any[], startDate: Date, endDate: Date, period: string): ActivityTrendData[] {
    // Simplified implementation - would generate proper trend data based on period
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const trendData: ActivityTrendData[] = [];

    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayActivities = activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate.toDateString() === date.toDateString();
      });

      trendData.push({
        date: date.toISOString().split('T')[0],
        calls: dayActivities.filter(a => a.type === 'Call').length,
        emails: dayActivities.filter(a => a.type === 'Email').length,
        meetings: dayActivities.filter(a => a.type === 'Meeting').length,
        notes: dayActivities.filter(a => a.type === 'Note').length,
        whatsapp: 0,
        total: dayActivities.length,
      });
    }

    return trendData;
  }
}
export interface LeadSourceAnalytics {
  source: string;
  totalLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  conversionRate: number;
  qualificationRate: number;
  averageTimeToConvert: number; // in days
  revenue?: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  averageTimeToClose: number; // in days
  totalActivities: number;
  callsCount: number;
  emailsCount: number;
  meetingsCount: number;
  notesCount: number;
  revenue?: number;
  monthlyPerformance: MonthlyPerformance[];
}

export interface MonthlyPerformance {
  month: string;
  year: number;
  leadsAssigned: number;
  leadsConverted: number;
  conversionRate: number;
  revenue?: number;
}

export interface LeadStatusFunnel {
  status: string;
  count: number;
  percentage: number;
  averageTimeInStatus: number; // in days
  conversionRate: number; // rate of moving to next status
  dropOffRate: number; // rate of leads lost at this stage
}

export interface ConversionMetrics {
  totalLeads: number;
  convertedLeads: number;
  overallConversionRate: number;
  averageTimeToConvert: number;
  conversionBySource: Record<string, number>;
  conversionByAgent: Record<string, number>;
  conversionByPropertyType: Record<string, number>;
  monthlyConversions: MonthlyConversion[];
}

export interface MonthlyConversion {
  month: string;
  year: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
}

export interface ActivityReport {
  agentId?: string;
  agentName?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  totalActivities: number;
  callsCount: number;
  emailsCount: number;
  meetingsCount: number;
  notesCount: number;
  whatsappCount: number;
  calendarEventsCount: number;
  averageActivitiesPerLead: number;
  mostActiveDay?: string;
  activityTrend: ActivityTrendData[];
}

export interface ActivityTrendData {
  date: string;
  calls: number;
  emails: number;
  meetings: number;
  notes: number;
  whatsapp: number;
  total: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  averageRevenuePerLead: number;
  revenueBySource: Record<string, number>;
  revenueByAgent: Record<string, number>;
  revenueByPropertyType: Record<string, number>;
  monthlyRevenue: MonthlyRevenue[];
  projectedRevenue: number;
}

export interface MonthlyRevenue {
  month: string;
  year: number;
  revenue: number;
  leadsConverted: number;
  averageRevenuePerConversion: number;
}

export interface DashboardMetrics {
  totalLeads: number;
  newLeadsToday: number;
  newLeadsThisWeek: number;
  newLeadsThisMonth: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  activeLeads: number;
  conversionRate: number;
  averageTimeToConvert: number;
  topPerformingAgent: string;
  topLeadSource: string;
  recentActivities: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ReportFilters {
  dateRange?: DateRange;
  agentIds?: string[];
  sources?: string[];
  propertyTypes?: string[];
  statuses?: string[];
}
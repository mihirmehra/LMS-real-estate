'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LeadSourceChart } from './LeadSourceChart';
import { AgentPerformanceChart } from './AgentPerformanceChart';
import { ConversionFunnelChart } from './ConversionFunnelChart';
import { ActivityReportChart } from './ActivityReportChart';
import { Lead, Agent } from '@/types/lead';
import { ReportFilters } from '@/types/analytics';
import { AnalyticsService } from '@/lib/analyticsService';
import { useLeads } from '@/hooks/useLeads';
import { useAgents } from '@/hooks/useAgents';
import { useAuth } from '@/hooks/useAuth';
import { PermissionService } from '@/lib/permissions';
import { 
  BarChart3, TrendingUp, Users, Target, Activity, 
  Calendar, Download, Filter, RefreshCw, Loader2 
} from 'lucide-react';

export function AnalyticsDashboard() {
  const { leads, loading: leadsLoading } = useLeads();
  const { agents, loading: agentsLoading } = useAgents();
  const { user } = useAuth();
  const [filters, setFilters] = useState<ReportFilters>({});
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  const loading = leadsLoading || agentsLoading;
  const analyticsService = AnalyticsService.getInstance();
  const permissionService = PermissionService.getInstance();

  // Generate analytics data with user filtering
  const dashboardMetrics = useMemo(() => 
    analyticsService.generateDashboardMetrics(leads, user), [leads, user]
  );

  const leadSourceAnalytics = useMemo(() => 
    analyticsService.generateLeadSourceAnalytics(leads, filters, user), [leads, filters, user]
  );

  const agentPerformance = useMemo(() => 
    analyticsService.generateAgentPerformance(leads, agents, filters, user), [leads, agents, filters, user]
  );

  const conversionMetrics = useMemo(() => 
    analyticsService.generateConversionMetrics(leads, filters, user), [leads, filters, user]
  );

  const leadStatusFunnel = useMemo(() => 
    analyticsService.generateLeadStatusFunnel(leads, filters, user), [leads, filters, user]
  );

  const activityReport = useMemo(() => 
    analyticsService.generateActivityReport(leads, user?.role === 'agent' ? user.id : undefined, 'monthly', user), [leads, user]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleExportReport = (reportType: string) => {
    if (!permissionService.hasPermission(user, 'analytics', 'export')) {
      alert('You do not have permission to export reports');
      return;
    }
    // In a real app, this would generate and download a report
    console.log(`Exporting ${reportType} report...`);
  };

  // Get page title based on user role
  const getPageTitle = () => {
    if (user?.role === 'agent') {
      return 'My Analytics & Reports';
    }
    return 'Analytics & Reports';
  };

  const getPageDescription = () => {
    if (user?.role === 'agent') {
      return 'Your personal lead management performance insights';
    }
    return 'Comprehensive insights into your lead management performance';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-gray-600 mt-1">{getPageDescription()}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {permissionService.hasPermission(user, 'analytics', 'export') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportReport('dashboard')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {user?.role === 'agent' ? 'My Total Leads' : 'Total Leads'}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{dashboardMetrics.newLeadsThisMonth}</span> this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {user?.role === 'agent' ? 'My Conversion Rate' : 'Conversion Rate'}
            </CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {dashboardMetrics.convertedLeads} converted leads
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Time to Convert
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.averageTimeToConvert}d</div>
            <p className="text-xs text-muted-foreground">
              Average conversion time
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {user?.role === 'agent' ? 'My Active Leads' : 'Active Leads'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.activeLeads}</div>
            <p className="text-xs text-muted-foreground">
              Currently in pipeline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="sources" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
          {user?.role === 'admin' && <TabsTrigger value="agents">Agent Performance</TabsTrigger>}
          {user?.role === 'agent' && <TabsTrigger value="performance">My Performance</TabsTrigger>}
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Lead Sources Analysis */}
        <TabsContent value="sources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>{user?.role === 'agent' ? 'My Lead Sources Performance' : 'Lead Sources Performance'}</span>
                </CardTitle>
                <CardDescription>
                  Analysis of lead generation by source
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeadSourceChart data={leadSourceAnalytics} />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Source Breakdown</CardTitle>
                <CardDescription>
                  Detailed metrics by lead source
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leadSourceAnalytics.length > 0 ? leadSourceAnalytics.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{source.source}</div>
                        <div className="text-sm text-gray-600">
                          {source.totalLeads} leads • {source.convertedLeads} converted
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={source.conversionRate > 15 ? "default" : "secondary"}>
                          {source.conversionRate}% conversion
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          Avg. {source.averageTimeToConvert}d to convert
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      No lead source data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Agent Performance - Only for Admins */}
        {user?.role === 'admin' && (
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span>Agent Performance Comparison</span>
                  </CardTitle>
                  <CardDescription>
                    Conversion rates and lead management by agent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AgentPerformanceChart data={agentPerformance} />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Agent Leaderboard</CardTitle>
                  <CardDescription>
                    Top performing agents this period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agentPerformance.length > 0 ? agentPerformance.slice(0, 5).map((agent, index) => (
                      <div key={agent.agentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{agent.agentName}</div>
                            <div className="text-sm text-gray-600">
                              {agent.totalLeads} leads • {agent.convertedLeads} converted
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={agent.conversionRate > 20 ? "default" : "secondary"}>
                            {agent.conversionRate}%
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            {agent.totalActivities} activities
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        No agent performance data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* My Performance - Only for Agents */}
        {user?.role === 'agent' && (
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span>My Performance Overview</span>
                  </CardTitle>
                  <CardDescription>
                    Your personal lead management statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {agentPerformance.length > 0 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{agentPerformance[0].totalLeads}</div>
                          <div className="text-sm text-gray-600">Total Leads</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{agentPerformance[0].convertedLeads}</div>
                          <div className="text-sm text-gray-600">Converted</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{agentPerformance[0].conversionRate}%</div>
                          <div className="text-sm text-gray-600">Conversion Rate</div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 rounded-lg">
                          <div className="text-2xl font-bold text-amber-600">{agentPerformance[0].totalActivities}</div>
                          <div className="text-sm text-gray-600">Total Activities</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Activity Breakdown</CardTitle>
                  <CardDescription>
                    Your communication activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {agentPerformance.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Calls Made</span>
                        <span className="font-bold">{agentPerformance[0].callsCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Emails Sent</span>
                        <span className="font-bold">{agentPerformance[0].emailsCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Meetings</span>
                        <span className="font-bold">{agentPerformance[0].meetingsCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Notes Added</span>
                        <span className="font-bold">{agentPerformance[0].notesCount}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Conversion Funnel */}
        <TabsContent value="funnel" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span>{user?.role === 'agent' ? 'My Lead Status Conversion Funnel' : 'Lead Status Conversion Funnel'}</span>
                </CardTitle>
                <CardDescription>
                  Visual representation of leads moving through different stages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConversionFunnelChart data={leadStatusFunnel} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadStatusFunnel.map((stage, index) => (
              <Card key={stage.status} className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{stage.status}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Leads</span>
                      <span className="font-bold text-lg">{stage.count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Percentage</span>
                      <Badge variant="outline">{stage.percentage}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg. Time</span>
                      <span className="text-sm">{stage.averageTimeInStatus}d</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Conversion</span>
                      <Badge variant={stage.conversionRate > 50 ? "default" : "secondary"}>
                        {stage.conversionRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activities Report */}
        <TabsContent value="activities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-amber-600" />
                  <span>{user?.role === 'agent' ? 'My Activity Overview' : 'Activity Overview'}</span>
                </CardTitle>
                <CardDescription>
                  {user?.role === 'agent' ? 'Your activity summary for the selected period' : 'Team activity summary for the selected period'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityReportChart data={activityReport} />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Activity Breakdown</CardTitle>
                <CardDescription>
                  Detailed activity metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{activityReport.callsCount}</div>
                      <div className="text-sm text-gray-600">Calls Made</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{activityReport.emailsCount}</div>
                      <div className="text-sm text-gray-600">Emails Sent</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{activityReport.meetingsCount}</div>
                      <div className="text-sm text-gray-600">Meetings</div>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">{activityReport.notesCount}</div>
                      <div className="text-sm text-gray-600">Notes Added</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Total Activities</span>
                      <span className="font-bold">{activityReport.totalActivities}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg. per Lead</span>
                      <span className="font-bold">{activityReport.averageActivitiesPerLead}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>{user?.role === 'agent' ? 'My Conversion Trends' : 'Conversion Trends'}</span>
              </CardTitle>
              <CardDescription>
                Monthly conversion performance and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionMetrics.monthlyConversions.length > 0 ? conversionMetrics.monthlyConversions.slice(-6).map((month, index) => (
                  <div key={`${month.month}-${month.year}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{month.month} {month.year}</div>
                      <div className="text-sm text-gray-600">
                        {month.totalLeads} leads • {month.convertedLeads} converted
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={month.conversionRate > conversionMetrics.overallConversionRate ? "default" : "secondary"}>
                        {month.conversionRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    No conversion trend data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
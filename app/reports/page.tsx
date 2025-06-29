'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useLeads } from '@/hooks/useLeads';
import { useAgents } from '@/hooks/useAgents';
import { useAuth } from '@/hooks/useAuth';
import { AnalyticsService } from '@/lib/analyticsService';
import { PermissionService } from '@/lib/permissions';
import { 
  FileText, Download, Calendar, Users, TrendingUp, BarChart3, 
  Target, Activity, Loader2, Filter, Database
} from 'lucide-react';

export default function ReportsPage() {
  const { user } = useAuth();
  const { leads, loading: leadsLoading } = useLeads();
  const { agents, loading: agentsLoading } = useAgents();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<string>('overview');

  const loading = leadsLoading || agentsLoading;
  const analyticsService = AnalyticsService.getInstance();
  const permissionService = PermissionService.getInstance();

  // Filter leads based on user permissions
  const userFilteredLeads = permissionService.filterLeadsForUser(leads, user);

  if (loading) {
    return (
      <ProtectedRoute requiredPermission={{ resource: 'reports', action: 'read' }}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading reports from database...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const dashboardMetrics = analyticsService.generateDashboardMetrics(userFilteredLeads, user);
  const leadSourceAnalytics = analyticsService.generateLeadSourceAnalytics(userFilteredLeads, undefined, user);
  const agentPerformance = analyticsService.generateAgentPerformance(userFilteredLeads, agents, undefined, user);
  const conversionMetrics = analyticsService.generateConversionMetrics(userFilteredLeads, undefined, user);

  const handleExportReport = (reportType: string) => {
    if (!permissionService.hasPermission(user, 'reports', 'export')) {
      alert('You do not have permission to export reports');
      return;
    }

    // Create a simple CSV export for demonstration
    let csvContent = '';
    let filename = '';

    switch (reportType) {
      case 'leads':
        csvContent = 'Name,Email,Phone,Status,Source,Created Date\n';
        userFilteredLeads.forEach(lead => {
          csvContent += `"${lead.name}","${lead.primaryEmail}","${lead.primaryPhone}","${lead.status}","${lead.source}","${lead.createdAt.toLocaleDateString()}"\n`;
        });
        filename = `${user?.role === 'agent' ? 'my_' : ''}leads_report.csv`;
        break;
      case 'agents':
        if (user?.role === 'admin') {
          csvContent = 'Agent Name,Total Leads,Converted Leads,Conversion Rate,Total Activities\n';
          agentPerformance.forEach(agent => {
            csvContent += `"${agent.agentName}",${agent.totalLeads},${agent.convertedLeads},${agent.conversionRate}%,${agent.totalActivities}\n`;
          });
          filename = 'agent_performance_report.csv';
        } else {
          // For agents, export their own performance
          csvContent = 'Metric,Value\n';
          if (agentPerformance.length > 0) {
            const myPerformance = agentPerformance[0];
            csvContent += `"Total Leads",${myPerformance.totalLeads}\n`;
            csvContent += `"Converted Leads",${myPerformance.convertedLeads}\n`;
            csvContent += `"Conversion Rate",${myPerformance.conversionRate}%\n`;
            csvContent += `"Total Activities",${myPerformance.totalActivities}\n`;
          }
          filename = 'my_performance_report.csv';
        }
        break;
      case 'sources':
        csvContent = 'Source,Total Leads,Converted Leads,Conversion Rate,Avg Time to Convert\n';
        leadSourceAnalytics.forEach(source => {
          csvContent += `"${source.source}",${source.totalLeads},${source.convertedLeads},${source.conversionRate}%,${source.averageTimeToConvert} days\n`;
        });
        filename = `${user?.role === 'agent' ? 'my_' : ''}lead_sources_report.csv`;
        break;
    }

    // Download the CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportTypes = [
    { value: 'overview', label: 'Overview Report', icon: BarChart3 },
    { value: 'leads', label: user?.role === 'agent' ? 'My Leads Report' : 'Leads Report', icon: Users },
    ...(user?.role === 'admin' ? [{ value: 'agents', label: 'Agent Performance', icon: Target }] : []),
    ...(user?.role === 'agent' ? [{ value: 'performance', label: 'My Performance', icon: Target }] : []),
    { value: 'sources', label: user?.role === 'agent' ? 'My Lead Sources' : 'Lead Sources', icon: TrendingUp },
    { value: 'activities', label: user?.role === 'agent' ? 'My Activities Report' : 'Activities Report', icon: Activity },
  ];

  // Filter agents for dropdown (agents should not see other agents)
  const availableAgents = user?.role === 'admin' ? agents : agents.filter(agent => agent.id === user?.id || agent.userId === user?.id);

  return (
    <ProtectedRoute requiredPermission={{ resource: 'reports', action: 'read' }}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user?.role === 'agent' ? 'My Reports' : 'Reports'}
                </h1>
                <p className="text-gray-600">
                  {user?.role === 'agent' 
                    ? 'Generate and export your personal reports from database'
                    : 'Generate and export detailed reports from database'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-md mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-blue-600" />
                <span>Report Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Report Type</label>
                  <Select value={selectedReport} onValueChange={setSelectedReport}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Time Period</label>
                  <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {user?.role === 'admin' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Agent</label>
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Agents</SelectItem>
                        {availableAgents.map(agent => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-end">
                  {permissionService.hasPermission(user, 'reports', 'export') && (
                    <Button
                      onClick={() => handleExportReport(selectedReport)}
                      className="bg-green-600 hover:bg-green-700 w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Content */}
          {userFilteredLeads.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Report */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {reportTypes.find(t => t.value === selectedReport)?.icon && 
                        React.createElement(reportTypes.find(t => t.value === selectedReport)!.icon, {
                          className: "h-5 w-5 text-blue-600"
                        })
                      }
                      <span>{reportTypes.find(t => t.value === selectedReport)?.label}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedReport === 'overview' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{dashboardMetrics.totalLeads}</div>
                            <div className="text-sm text-gray-600">{user?.role === 'agent' ? 'My Total Leads' : 'Total Leads'}</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{dashboardMetrics.convertedLeads}</div>
                            <div className="text-sm text-gray-600">Converted</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{dashboardMetrics.conversionRate}%</div>
                            <div className="text-sm text-gray-600">Conversion Rate</div>
                          </div>
                          <div className="text-center p-4 bg-amber-50 rounded-lg">
                            <div className="text-2xl font-bold text-amber-600">{dashboardMetrics.activeLeads}</div>
                            <div className="text-sm text-gray-600">Active Leads</div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            {user?.role === 'agent' ? 'My Lead Sources Performance' : 'Lead Sources Performance'}
                          </h3>
                          <div className="space-y-3">
                            {leadSourceAnalytics.map(source => (
                              <div key={source.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <div className="font-medium">{source.source}</div>
                                  <div className="text-sm text-gray-600">{source.totalLeads} leads</div>
                                </div>
                                <Badge variant={source.conversionRate > 15 ? "default" : "secondary"}>
                                  {source.conversionRate}% conversion
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedReport === 'leads' && (
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Name</th>
                                <th className="text-left p-2">Status</th>
                                <th className="text-left p-2">Source</th>
                                <th className="text-left p-2">Created</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userFilteredLeads.slice(0, 10).map(lead => (
                                <tr key={lead.id} className="border-b">
                                  <td className="p-2">{lead.name}</td>
                                  <td className="p-2">
                                    <Badge variant="outline">{lead.status}</Badge>
                                  </td>
                                  <td className="p-2">{lead.source}</td>
                                  <td className="p-2">{lead.createdAt.toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {userFilteredLeads.length > 10 && (
                          <div className="text-center text-sm text-gray-500">
                            Showing 10 of {userFilteredLeads.length} leads. Export for full report.
                          </div>
                        )}
                      </div>
                    )}

                    {(selectedReport === 'agents' || selectedReport === 'performance') && (
                      <div className="space-y-4">
                        {agentPerformance.map(agent => (
                          <div key={agent.agentId} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold">{agent.agentName}</h3>
                              <Badge variant={agent.conversionRate > 20 ? "default" : "secondary"}>
                                {agent.conversionRate}% conversion
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="font-medium text-blue-600">{agent.totalLeads}</div>
                                <div className="text-gray-600">Total Leads</div>
                              </div>
                              <div>
                                <div className="font-medium text-green-600">{agent.convertedLeads}</div>
                                <div className="text-gray-600">Converted</div>
                              </div>
                              <div>
                                <div className="font-medium text-purple-600">{agent.activeLeads}</div>
                                <div className="text-gray-600">Active</div>
                              </div>
                              <div>
                                <div className="font-medium text-amber-600">{agent.totalActivities}</div>
                                <div className="text-gray-600">Activities</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedReport === 'sources' && (
                      <div className="space-y-4">
                        {leadSourceAnalytics.map(source => (
                          <div key={source.source} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold">{source.source}</h3>
                              <Badge variant={source.conversionRate > 15 ? "default" : "secondary"}>
                                {source.conversionRate}% conversion
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="font-medium text-blue-600">{source.totalLeads}</div>
                                <div className="text-gray-600">Total Leads</div>
                              </div>
                              <div>
                                <div className="font-medium text-green-600">{source.convertedLeads}</div>
                                <div className="text-gray-600">Converted</div>
                              </div>
                              <div>
                                <div className="font-medium text-purple-600">{source.qualifiedLeads}</div>
                                <div className="text-gray-600">Qualified</div>
                              </div>
                              <div>
                                <div className="font-medium text-amber-600">{source.averageTimeToConvert}d</div>
                                <div className="text-gray-600">Avg. Time</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedReport === 'activities' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {userFilteredLeads.reduce((sum, lead) => sum + lead.activities.filter(a => a.type === 'Call').length, 0)}
                            </div>
                            <div className="text-sm text-gray-600">Calls Made</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {userFilteredLeads.reduce((sum, lead) => sum + lead.activities.filter(a => a.type === 'Email').length, 0)}
                            </div>
                            <div className="text-sm text-gray-600">Emails Sent</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {userFilteredLeads.reduce((sum, lead) => sum + lead.activities.filter(a => a.type === 'Meeting').length, 0)}
                            </div>
                            <div className="text-sm text-gray-600">Meetings</div>
                          </div>
                          <div className="text-center p-4 bg-amber-50 rounded-lg">
                            <div className="text-2xl font-bold text-amber-600">
                              {userFilteredLeads.reduce((sum, lead) => sum + lead.activities.filter(a => a.type === 'Note').length, 0)}
                            </div>
                            <div className="text-sm text-gray-600">Notes</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{user?.role === 'agent' ? 'My Total Leads' : 'Total Leads'}</span>
                      <span className="font-bold">{dashboardMetrics.totalLeads}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-bold text-green-600">+{dashboardMetrics.newLeadsThisMonth}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <span className="font-bold">{dashboardMetrics.conversionRate}%</span>
                    </div>
                    {user?.role === 'admin' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Active Agents</span>
                        <span className="font-bold">{agents.filter(a => a.active).length}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Export Options */}
                {permissionService.hasPermission(user, 'reports', 'export') && (
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle>Export Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        onClick={() => handleExportReport('leads')}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export {user?.role === 'agent' ? 'My' : ''} Leads CSV
                      </Button>
                      {user?.role === 'admin' && (
                        <Button
                          onClick={() => handleExportReport('agents')}
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Agents CSV
                        </Button>
                      )}
                      {user?.role === 'agent' && (
                        <Button
                          onClick={() => handleExportReport('agents')}
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export My Performance CSV
                        </Button>
                      )}
                      <Button
                        onClick={() => handleExportReport('sources')}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export {user?.role === 'agent' ? 'My' : ''} Sources CSV
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="text-center py-12">
                <Database className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No data available for reports</h3>
                <p className="text-gray-600 mb-6">
                  {user?.role === 'agent' 
                    ? "You don't have any leads assigned to you yet. Contact your admin or start adding leads."
                    : "No leads found in the database. Add leads first to generate meaningful reports."
                  }
                </p>
                <Button
                  onClick={() => window.location.href = '/'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Go to Leads
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
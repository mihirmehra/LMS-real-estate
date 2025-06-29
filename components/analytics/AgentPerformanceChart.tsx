'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AgentPerformance } from '@/types/analytics';

interface AgentPerformanceChartProps {
  data: AgentPerformance[];
}

export function AgentPerformanceChart({ data }: AgentPerformanceChartProps) {
  const chartData = data.map(agent => ({
    name: agent.agentName.split(' ')[0], // First name only for chart
    totalLeads: agent.totalLeads,
    convertedLeads: agent.convertedLeads,
    conversionRate: agent.conversionRate,
    totalActivities: agent.totalActivities,
  }));

  return (
    <div className="space-y-6">
      {/* Conversion Rate Comparison */}
      <div className="h-64">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Conversion Rate by Agent</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value, name) => [
                `${value}%`,
                'Conversion Rate'
              ]}
            />
            <Bar dataKey="conversionRate" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Lead Volume vs Activities */}
      <div className="h-64">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Lead Volume vs Activities</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="totalLeads" fill="#3B82F6" name="Total Leads" />
            <Bar dataKey="totalActivities" fill="#F59E0B" name="Total Activities" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
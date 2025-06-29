'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ActivityReport } from '@/types/analytics';

interface ActivityReportChartProps {
  data: ActivityReport;
}

export function ActivityReportChart({ data }: ActivityReportChartProps) {
  const activityBreakdown = [
    { name: 'Calls', count: data.callsCount, color: '#3B82F6' },
    { name: 'Emails', count: data.emailsCount, color: '#10B981' },
    { name: 'Meetings', count: data.meetingsCount, color: '#8B5CF6' },
    { name: 'Notes', count: data.notesCount, color: '#F59E0B' },
    { name: 'WhatsApp', count: data.whatsappCount, color: '#06B6D4' },
  ].filter(item => item.count > 0);

  const trendData = data.activityTrend.slice(-14); // Last 14 days

  return (
    <div className="space-y-6">
      {/* Activity Breakdown */}
      <div className="h-48">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Activity Breakdown</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activityBreakdown} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={60} />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Activity Trend */}
      {trendData.length > 0 && (
        <div className="h-48">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Activity Trend (Last 14 Days)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [value, name === 'total' ? 'Total Activities' : name]}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LeadSourceAnalytics } from '@/types/analytics';

interface LeadSourceChartProps {
  data: LeadSourceAnalytics[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export function LeadSourceChart({ data }: LeadSourceChartProps) {
  const chartData = data.map(item => ({
    source: item.source,
    totalLeads: item.totalLeads,
    convertedLeads: item.convertedLeads,
    conversionRate: item.conversionRate,
  }));

  const pieData = data.map(item => ({
    name: item.source,
    value: item.totalLeads,
  }));

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="source" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value, name) => [
                value,
                name === 'totalLeads' ? 'Total Leads' : 
                name === 'convertedLeads' ? 'Converted Leads' : 
                'Conversion Rate'
              ]}
            />
            <Bar dataKey="totalLeads" fill="#3B82F6" name="totalLeads" />
            <Bar dataKey="convertedLeads" fill="#10B981" name="convertedLeads" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
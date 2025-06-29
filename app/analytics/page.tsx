'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <ProtectedRoute requiredPermission={{ resource: 'analytics', action: 'read' }}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <AnalyticsDashboard />
        </div>
      </div>
    </ProtectedRoute>
  );
}
'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LeadAssignment } from '@/components/admin/LeadAssignment';

export default function AdminLeadsPage() {
  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <LeadAssignment />
        </div>
      </div>
    </ProtectedRoute>
  );
}
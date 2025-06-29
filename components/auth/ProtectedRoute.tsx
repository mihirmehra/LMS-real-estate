'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PermissionService } from '@/lib/permissions';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: {
    resource: string;
    action: string;
  };
  adminOnly?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  adminOnly = false 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const permissionService = PermissionService.getInstance();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (adminOnly && !permissionService.isAdmin(user)) {
        router.push('/unauthorized');
        return;
      }

      if (requiredPermission && !permissionService.hasPermission(
        user, 
        requiredPermission.resource, 
        requiredPermission.action
      )) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router, adminOnly, requiredPermission, permissionService]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (adminOnly && !permissionService.isAdmin(user)) {
    return null;
  }

  if (requiredPermission && !permissionService.hasPermission(
    user, 
    requiredPermission.resource, 
    requiredPermission.action
  )) {
    return null;
  }

  return <>{children}</>;
}
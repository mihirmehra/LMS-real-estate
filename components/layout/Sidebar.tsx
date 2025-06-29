'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { PermissionService } from '@/lib/permissions';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Calendar, 
  MessageCircle, 
  Settings, 
  Home,
  ChevronLeft,
  ChevronRight,
  Plus,
  Target,
  Activity,
  TrendingUp,
  FileText,
  LogOut,
  User as UserIcon
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const permissionService = PermissionService.getInstance();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      current: pathname === '/',
      badge: null,
      visible: true,
    },
    {
      name: 'Leads',
      href: '/',
      icon: Users,
      current: pathname === '/leads' || pathname === '/',
      badge: '12',
      visible: permissionService.hasPermission(user, 'leads', 'read'),
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      current: pathname === '/analytics',
      badge: null,
      visible: permissionService.hasPermission(user, 'analytics', 'read'),
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      current: pathname === '/calendar',
      badge: '3',
      visible: permissionService.hasPermission(user, 'calendar', 'read'),
    },
    {
      name: 'Communications',
      href: '/communications',
      icon: MessageCircle,
      current: pathname === '/communications',
      badge: null,
      visible: permissionService.hasPermission(user, 'communications', 'read'),
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FileText,
      current: pathname === '/reports',
      badge: null,
      visible: permissionService.hasPermission(user, 'reports', 'read'),
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Settings,
      current: pathname === '/admin/users',
      badge: null,
      visible: permissionService.canManageUsers(user),
    },
    {
      name: 'Lead Assignment',
      href: '/admin/leads',
      icon: Target,
      current: pathname === '/admin/leads',
      badge: null,
      visible: permissionService.canAssignLeads(user),
    },
  ];

  const handleAddLead = () => {
    if (permissionService.hasPermission(user, 'leads', 'create')) {
      window.dispatchEvent(new CustomEvent('openAddLeadModal'));
    }
  };

  const handleScheduleMeeting = () => {
    if (permissionService.hasPermission(user, 'calendar', 'create')) {
      window.location.href = '/calendar';
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  if (!user) return null;

  return (
    <div className={cn(
      'flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">RealEstate CRM</h1>
              <p className="text-xs text-gray-500">Lead Management</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.filter(item => item.visible).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                item.current
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {permissionService.hasPermission(user, 'leads', 'create') && (
              <Button
                onClick={handleAddLead}
                className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            )}
            {permissionService.hasPermission(user, 'calendar', 'create') && (
              <Button
                onClick={handleScheduleMeeting}
                className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            )}
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8 cursor-pointer" onClick={handleProfileClick}>
              <AvatarFallback className="bg-gray-300 text-gray-700 text-sm">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" onClick={handleProfileClick}>
                <UserIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-8 w-8 cursor-pointer" onClick={handleProfileClick}>
              <AvatarFallback className="bg-gray-300 text-gray-700 text-sm">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarEventModal } from '@/components/communication/CalendarEventModal';
import { WhatsAppModal } from '@/components/communication/WhatsAppModal';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { PermissionService } from '@/lib/permissions';
import { MessageCircle, Calendar, Mail, Phone, Send, Users, Clock } from 'lucide-react';

export default function CommunicationsPage() {
  const { user } = useAuth();
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const permissionService = PermissionService.getInstance();

  const communicationStats = {
    totalMessages: 156,
    scheduledEvents: 23,
    emailsSent: 89,
    callsMade: 67,
  };

  const recentActivities = [
    {
      id: '1',
      type: 'whatsapp',
      message: 'Property details shared with John Williams',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      leadName: 'John Williams',
    },
    {
      id: '2',
      type: 'calendar',
      message: 'Site visit scheduled with Maria Garcia',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      leadName: 'Maria Garcia',
    },
    {
      id: '3',
      type: 'email',
      message: 'Follow-up email sent to Robert Kim',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      leadName: 'Robert Kim',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'calendar':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'email':
        return <Mail className="h-4 w-4 text-purple-600" />;
      case 'call':
        return <Phone className="h-4 w-4 text-orange-600" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    }).format(timestamp);
  };

  return (
    <ProtectedRoute requiredPermission={{ resource: 'communications', action: 'read' }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
            <p className="text-gray-600 mt-1">Manage all your lead communications in one place</p>
          </div>
          <div className="flex space-x-3">
            {permissionService.hasPermission(user, 'calendar', 'create') && (
              <Button
                onClick={() => setIsCalendarModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Event
              </Button>
            )}
            {permissionService.hasPermission(user, 'communications', 'create') && (
              <Button
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Send WhatsApp
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Messages
              </CardTitle>
              <Send className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communicationStats.totalMessages}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Scheduled Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communicationStats.scheduledEvents}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5</span> this week
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Emails Sent
              </CardTitle>
              <Mail className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communicationStats.emailsSent}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Calls Made
              </CardTitle>
              <Phone className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communicationStats.callsMade}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3</span> from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>Recent Communication Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.leadName}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <span>WhatsApp Communications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">WhatsApp Integration</h3>
                  <p className="text-gray-600 mb-6">
                    Send personalized messages to your leads directly through WhatsApp
                  </p>
                  {permissionService.hasPermission(user, 'communications', 'create') && (
                    <Button
                      onClick={() => setIsWhatsAppModalOpen(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send WhatsApp Message
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Calendar Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Google Calendar Integration</h3>
                  <p className="text-gray-600 mb-6">
                    Schedule meetings and site visits that sync with your Google Calendar
                  </p>
                  {permissionService.hasPermission(user, 'calendar', 'create') && (
                    <Button
                      onClick={() => setIsCalendarModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule New Event
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span>Message Templates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Communication Templates</h3>
                  <p className="text-gray-600 mb-6">
                    Create and manage reusable message templates for efficient communication
                  </p>
                  <Button variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Manage Templates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {permissionService.hasPermission(user, 'calendar', 'create') && (
          <CalendarEventModal
            open={isCalendarModalOpen}
            onOpenChange={setIsCalendarModalOpen}
          />
        )}

        {permissionService.hasPermission(user, 'communications', 'create') && (
          <WhatsAppModal
            open={isWhatsAppModalOpen}
            onOpenChange={setIsWhatsAppModalOpen}
            lead={{
              id: 'sample',
              name: 'Sample Lead',
              primaryPhone: '+1-555-0123',
              primaryEmail: 'sample@email.com',
              propertyType: 'Residential',
              budgetRange: '$300,000 - $500,000',
              preferredLocations: ['Downtown'],
              source: 'Website',
              status: 'New',
              notes: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              leadScore: 'Medium',
              activities: [],
              attachments: [],
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
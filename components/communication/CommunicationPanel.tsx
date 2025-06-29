'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarEventModal } from './CalendarEventModal';
import { WhatsAppModal } from './WhatsAppModal';
import { Lead } from '@/types/lead';
import { CalendarEvent, CommunicationActivity } from '@/types/communication';
import { Calendar, MessageCircle, Phone, Mail, Clock, CheckCircle2, Database } from 'lucide-react';

interface CommunicationPanelProps {
  lead: Lead;
  onActivityAdded?: (activity: CommunicationActivity) => void;
}

export function CommunicationPanel({ lead, onActivityAdded }: CommunicationPanelProps) {
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [communicationActivities, setCommunicationActivities] = useState<CommunicationActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch communication data from database
  useEffect(() => {
    fetchCommunicationData();
  }, [lead.id]);

  const fetchCommunicationData = async () => {
    try {
      setLoading(true);
      
      // Fetch calendar events
      const eventsResponse = await fetch(`/api/communications/calendar?userId=${lead.assignedAgent}&startDate=${new Date().toISOString()}`);
      if (eventsResponse.ok) {
        const events = await eventsResponse.json();
        const leadEvents = events.filter((event: CalendarEvent) => event.leadId === lead.id);
        setUpcomingEvents(leadEvents);
      }
      
      // Fetch communication activities
      const activitiesResponse = await fetch(`/api/communications/activities?leadId=${lead.id}`);
      if (activitiesResponse.ok) {
        const activities = await activitiesResponse.json();
        setCommunicationActivities(activities);
      }
    } catch (error) {
      console.error('Error fetching communication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = async (event: CalendarEvent) => {
    try {
      // Save to database
      const response = await fetch('/api/communications/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          leadId: lead.id,
          createdBy: lead.assignedAgent || 'current-user',
        }),
      });

      if (response.ok) {
        const savedEvent = await response.json();
        setUpcomingEvents(prev => [...prev, savedEvent]);
        
        // Create communication activity
        const activity: CommunicationActivity = {
          id: `activity-${Date.now()}`,
          leadId: lead.id,
          type: 'calendar',
          action: 'scheduled',
          content: `Event scheduled: ${event.title}`,
          eventId: savedEvent.id,
          timestamp: new Date(),
          agent: 'Current User',
        };
        
        // Save activity to database
        await fetch('/api/communications/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(activity),
        });
        
        onActivityAdded?.(activity);
      }
    } catch (error) {
      console.error('Error saving calendar event:', error);
    }
  };

  const handleWhatsAppSent = async (leadId: string, message: string) => {
    try {
      // Save WhatsApp message to database
      const messageResponse = await fetch('/api/communications/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          message,
          sentBy: 'current-user',
          status: 'sent',
        }),
      });

      if (messageResponse.ok) {
        // Create communication activity
        const activity: CommunicationActivity = {
          id: `activity-${Date.now()}`,
          leadId,
          type: 'whatsapp',
          action: 'sent',
          content: `WhatsApp message sent: ${message.substring(0, 50)}...`,
          timestamp: new Date(),
          agent: 'Current User',
        };
        
        // Save activity to database
        const activityResponse = await fetch('/api/communications/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(activity),
        });

        if (activityResponse.ok) {
          const savedActivity = await activityResponse.json();
          setCommunicationActivities(prev => [savedActivity, ...prev]);
          onActivityAdded?.(savedActivity);
        }
      }
    } catch (error) {
      console.error('Error saving WhatsApp message:', error);
    }
  };

  const quickActions = [
    {
      label: 'Schedule Meeting',
      icon: Calendar,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => setIsCalendarModalOpen(true),
    },
    {
      label: 'Send WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => setIsWhatsAppModalOpen(true),
    },
    {
      label: 'Call Lead',
      icon: Phone,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => window.open(`tel:${lead.primaryPhone}`),
    },
    {
      label: 'Send Email',
      icon: Mail,
      color: 'bg-amber-600 hover:bg-amber-700',
      action: () => window.open(`mailto:${lead.primaryEmail}`),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white font-medium h-12 flex items-center justify-center space-x-2`}
              >
                <action.icon className="h-4 w-4" />
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Upcoming Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-gray-500">
              <div className="animate-pulse">Loading events from database...</div>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-gray-600 flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(event.startDateTime).toLocaleDateString()} at{' '}
                        {new Date(event.startDateTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Scheduled
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No upcoming events</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCalendarModalOpen(true)}
                className="mt-2"
              >
                Schedule First Event
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communication History */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span>Recent Communications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-gray-500">
              <div className="animate-pulse">Loading communications from database...</div>
            </div>
          ) : communicationActivities.length > 0 ? (
            <div className="space-y-3">
              {communicationActivities.slice(0, 5).map(activity => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                    {activity.type === 'whatsapp' && <MessageCircle className="h-4 w-4 text-green-600" />}
                    {activity.type === 'calendar' && <Calendar className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'email' && <Mail className="h-4 w-4 text-purple-600" />}
                    {activity.type === 'call' && <Phone className="h-4 w-4 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.content}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                        {new Date(activity.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No communications in database</p>
              <p className="text-xs text-gray-400 mt-1">
                Start communicating to see activity here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CalendarEventModal
        open={isCalendarModalOpen}
        onOpenChange={setIsCalendarModalOpen}
        lead={lead}
        onEventCreated={handleEventCreated}
      />

      <WhatsAppModal
        open={isWhatsAppModalOpen}
        onOpenChange={setIsWhatsAppModalOpen}
        lead={lead}
        onMessageSent={handleWhatsAppSent}
      />
    </div>
  );
}
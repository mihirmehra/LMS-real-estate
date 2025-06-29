'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarEventModal } from '@/components/communication/CalendarEventModal';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { PermissionService } from '@/lib/permissions';
import { CalendarEvent } from '@/types/communication';
import { Calendar, Plus, Clock, Users, MapPin, ChevronLeft, ChevronRight, Database, Loader2 } from 'lucide-react';

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const permissionService = PermissionService.getInstance();

  // Fetch events from database
  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/communications/calendar?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        throw new Error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDateTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      'meeting': 'bg-blue-100 text-blue-800 border-blue-200',
      'site-visit': 'bg-green-100 text-green-800 border-green-200',
      'follow-up': 'bg-amber-100 text-amber-800 border-amber-200',
      'other': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleEventCreated = async (event: any) => {
    try {
      const response = await fetch('/api/communications/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          createdBy: user?.id || 'current-user',
        }),
      });

      if (response.ok) {
        const savedEvent = await response.json();
        setEvents(prev => [...prev, savedEvent]);
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEventUpdated = async (updatedEvent: CalendarEvent) => {
    try {
      const response = await fetch(`/api/communications/calendar/${updatedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });

      if (response.ok) {
        const savedEvent = await response.json();
        setEvents(prev => prev.map(e => e.id === updatedEvent.id ? savedEvent : e));
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const upcomingEvents = events
    .filter(event => new Date(event.startDateTime) > new Date())
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <ProtectedRoute requiredPermission={{ resource: 'calendar', action: 'read' }}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading calendar from database...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermission={{ resource: 'calendar', action: 'read' }}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
                <p className="text-gray-600">Manage your appointments and events from database</p>
              </div>
            </div>
            {permissionService.hasPermission(user, 'calendar', 'create') && (
              <Button
                onClick={() => {
                  setSelectedEvent(null);
                  setIsEventModalOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">{monthYear}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateMonth('prev')}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentDate(new Date())}
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateMonth('next')}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {weekDays.map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                      if (!day) {
                        return <div key={index} className="p-2 h-24"></div>;
                      }

                      const dayEvents = getEventsForDate(day);
                      const isToday = day.toDateString() === new Date().toDateString();
                      const isSelected = selectedDate?.toDateString() === day.toDateString();

                      return (
                        <div
                          key={day.toISOString()}
                          className={`p-2 h-24 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                            isToday ? 'bg-blue-50 border-blue-200' : ''
                          } ${isSelected ? 'bg-blue-100 border-blue-300' : ''}`}
                          onClick={() => setSelectedDate(day)}
                        >
                          <div className={`text-sm font-medium mb-1 ${
                            isToday ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded truncate ${getEventTypeColor('meeting')}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEvent(event);
                                  setIsEventModalOpen(true);
                                }}
                              >
                                {formatTime(event.startDateTime)} {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Events */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>Upcoming Events</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                      <div
                        key={event.id}
                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsEventModalOpen(true);
                        }}
                      >
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {new Date(event.startDateTime).toLocaleDateString()} at{' '}
                          {formatTime(event.startDateTime)}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className={getEventTypeColor('meeting')}>
                            Event
                          </Badge>
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Users className="h-3 w-3" />
                              <span>{event.attendees.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-6 text-gray-500">
                        <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No upcoming events in database</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {permissionService.hasPermission(user, 'calendar', 'create') && (
                    <>
                      <Button
                        onClick={() => {
                          setSelectedEvent(null);
                          setIsEventModalOpen(true);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          // Navigate to communications page
                          window.location.href = '/communications';
                        }}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Schedule Site Visit
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Event Modal */}
          {permissionService.hasPermission(user, 'calendar', 'create') && (
            <CalendarEventModal
              open={isEventModalOpen}
              onOpenChange={setIsEventModalOpen}
              event={selectedEvent || undefined}
              onEventCreated={handleEventCreated}
              onEventUpdated={handleEventUpdated}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
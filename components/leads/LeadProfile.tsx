'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CommunicationPanel } from '@/components/communication/CommunicationPanel';
import { Lead, Activity } from '@/types/lead';
import { CommunicationActivity } from '@/types/communication';
import { useAuth } from '@/hooks/useAuth';
import { PermissionService } from '@/lib/permissions';
import { 
  ArrowLeft, Phone, Mail, MapPin, DollarSign, Calendar, User, 
  Building, FileText, Plus, Clock, CheckCircle2, MessageCircle 
} from 'lucide-react';

interface LeadProfileProps {
  lead: Lead;
  onBack: () => void;
  onUpdateLead: (lead: Lead) => void;
}

export function LeadProfile({ lead, onBack, onUpdateLead }: LeadProfileProps) {
  const { user } = useAuth();
  const permissionService = PermissionService.getInstance();
  const [agents, setAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  
  const [newNote, setNewNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(lead.status);
  const [selectedAgent, setSelectedAgent] = useState(lead.assignedAgent || 'unassigned');
  const [communicationActivities, setCommunicationActivities] = useState<CommunicationActivity[]>([]);

  // Fetch agents (users with role 'agent') when component mounts
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const users = await response.json();
        // Filter to only include users with role 'agent'
        const agentUsers = users.filter((u: any) => u.role === 'agent' && u.isActive);
        setAgents(agentUsers);
      } else {
        console.error('Failed to fetch agents');
        setAgents([]);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  const assignedAgent = agents.find(agent => agent.id === lead.assignedAgent);

  // Check permissions
  const canEditLead = permissionService.canEditLead(user, lead.assignedAgent, lead.createdBy);
  const canAssignLeads = permissionService.canAssignLeads(user);

  const getStatusColor = (status: string) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-800 border-blue-200',
      'Contacted': 'bg-purple-100 text-purple-800 border-purple-200',
      'Qualified': 'bg-green-100 text-green-800 border-green-200',
      'Nurturing': 'bg-amber-100 text-amber-800 border-amber-200',
      'Site Visit Scheduled': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Site Visited': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Negotiation': 'bg-orange-100 text-orange-800 border-orange-200',
      'Converted': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Lost': 'bg-red-100 text-red-800 border-red-200',
      'Hold': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status as keyof typeof colors] || colors['New'];
  };

  const handleSaveChanges = () => {
    if (!canEditLead) {
      alert('You do not have permission to edit this lead');
      return;
    }

    const updatedLead = {
      ...lead,
      status: selectedStatus as Lead['status'],
      assignedAgent: selectedAgent === 'unassigned' ? undefined : selectedAgent,
      updatedAt: new Date(),
    };
    onUpdateLead(updatedLead);
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !canEditLead) return;
    
    const newActivity: Activity = {
      id: `${lead.id}-activity-${Date.now()}`,
      type: 'Note',
      description: newNote,
      date: new Date(),
      agent: user?.name || 'Current User',
    };

    const updatedLead = {
      ...lead,
      activities: [newActivity, ...lead.activities],
      updatedAt: new Date(),
    };

    onUpdateLead(updatedLead);
    setNewNote('');
  };

  const handleCommunicationActivity = (activity: CommunicationActivity) => {
    setCommunicationActivities(prev => [activity, ...prev]);
    
    // Also add to lead activities
    const leadActivity: Activity = {
      id: activity.id,
      type: activity.type === 'whatsapp' ? 'Note' : 'Note',
      description: activity.content || '',
      date: activity.timestamp,
      agent: activity.agent,
    };

    const updatedLead = {
      ...lead,
      activities: [leadActivity, ...lead.activities],
      updatedAt: new Date(),
    };

    onUpdateLead(updatedLead);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: string) => {
    // Convert dollar amounts to rupees for display
    if (amount.includes('$')) {
      return amount.replace(/\$/g, '₹').replace(/,/g, ',');
    }
    return amount;
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      'Call': Phone,
      'Email': Mail,
      'Meeting': Calendar,
      'Note': FileText,
      'Status Change': CheckCircle2,
      'Property Shown': Building,
      'whatsapp': MessageCircle,
      'calendar': Calendar,
    };
    const Icon = icons[type as keyof typeof icons] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const allActivities = [
    ...communicationActivities.map(ca => ({
      id: ca.id,
      type: ca.type,
      description: ca.content || '',
      date: ca.timestamp,
      agent: ca.agent,
    })),
    ...lead.activities
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Leads</span>
        </Button>
        {canEditLead && (
          <Button onClick={handleSaveChanges} className="bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
        )}
      </div>

      {/* Lead Header */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-medium">
                  {lead.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">{lead.name}</CardTitle>
                <CardDescription className="text-base mt-1">
                  Lead ID: {lead.id} • Created {formatDate(lead.createdAt)}
                </CardDescription>
                <div className="flex items-center space-x-2 mt-3">
                  <Badge className={`${getStatusColor(lead.status)} font-medium`}>
                    {lead.status}
                  </Badge>
                  <Badge variant="outline" className={`
                    ${lead.leadScore === 'High' ? 'text-red-600 bg-red-50' : 
                      lead.leadScore === 'Medium' ? 'text-amber-600 bg-amber-50' : 
                      'text-green-600 bg-green-50'} font-medium
                  `}>
                    {lead.leadScore} Priority
                  </Badge>
                  <Badge variant="outline" className="font-medium">
                    {lead.propertyType}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Lead Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Primary Phone</div>
                  <div className="text-base font-medium">{lead.primaryPhone}</div>
                </div>
                {lead.secondaryPhone && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Secondary Phone</div>
                    <div className="text-base font-medium">{lead.secondaryPhone}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-500">Primary Email</div>
                  <div className="text-base font-medium">{lead.primaryEmail}</div>
                </div>
                {lead.secondaryEmail && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Secondary Email</div>
                    <div className="text-base font-medium">{lead.secondaryEmail}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Property Preferences */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-blue-600" />
                <span>Property Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Budget Range</div>
                  <div className="text-base font-medium">{formatCurrency(lead.budgetRange)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Lead Source</div>
                  <div className="text-base font-medium">{lead.source}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm font-medium text-gray-500">Preferred Locations</div>
                  <div className="text-base font-medium">{lead.preferredLocations.join(', ')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment & Status - Only show if user can edit */}
          {canEditLead && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Assignment & Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Status</div>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['New', 'Contacted', 'Qualified', 'Nurturing', 'Site Visit Scheduled', 
                          'Site Visited', 'Negotiation', 'Converted', 'Lost', 'Hold'].map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {canAssignLeads && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-2">Assigned Agent</div>
                      <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select agent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {loadingAgents ? (
                            <SelectItem value="loading" disabled>Loading agents...</SelectItem>
                          ) : (
                            agents.map(agent => (
                              <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                {lead.lastContacted && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Last Contacted</div>
                    <div className="text-base font-medium">{formatDate(lead.lastContacted)}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Activities and Notes */}
          <Tabs defaultValue="activities" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activities">Activities & Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes & Comments</TabsTrigger>
            </TabsList>

            <TabsContent value="activities" className="space-y-4">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>
                    All interactions and changes for this lead
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {allActivities.length > 0 ? (
                    <div className="space-y-4">
                      {allActivities.map(activity => (
                        <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {activity.type}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                by {activity.agent}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mb-1">{activity.description}</p>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(activity.date)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No activities recorded yet</p>
                      <p className="text-sm mt-2">Start communicating to see activity here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              {canEditLead && (
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Add New Note</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Add a note about this lead..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={4}
                      />
                      <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Current Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {lead.notes ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-900">{lead.notes}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No notes available</p>
                      <p className="text-sm mt-2">Add notes to track important information</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Communication Panel */}
        <div className="lg:col-span-1">
          <CommunicationPanel 
            lead={lead} 
            onActivityAdded={handleCommunicationActivity}
          />
        </div>
      </div>
    </div>
  );
}
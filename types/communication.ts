export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDateTime: Date;
  endDateTime: Date;
  attendees?: string[];
  reminders?: number[]; // minutes before event
  leadId?: string;
  googleEventId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  category: 'follow-up' | 'property-share' | 'meeting' | 'thank-you' | 'custom';
  placeholders: string[]; // e.g., ['lead_name', 'property_address', 'agent_name']
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface CommunicationActivity {
  id: string;
  leadId: string;
  type: 'whatsapp' | 'calendar' | 'email' | 'call';
  action: 'sent' | 'scheduled' | 'completed' | 'cancelled';
  content?: string;
  eventId?: string;
  timestamp: Date;
  agent: string;
  metadata?: Record<string, any>;
}

export interface WhatsAppMessage {
  id: string;
  leadId: string;
  message: string;
  sentBy: string;
  sentAt: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  templateId?: string;
}

export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface UserCalendarAuth {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiryDate: Date;
  isConnected: boolean;
}
export interface Lead {
  id: string;
  name: string;
  primaryPhone: string;
  secondaryPhone?: string;
  primaryEmail: string;
  secondaryEmail?: string;
  propertyType: 'Residential' | 'Commercial' | 'Land';
  budgetRange: string;
  preferredLocations: string[];
  source: 'Website' | 'Referral' | 'Social Media' | 'Walk-in' | 'Advertisement' | 'Other';
  status: 'New' | 'Contacted' | 'Qualified' | 'Nurturing' | 'Site Visit Scheduled' | 'Site Visited' | 'Negotiation' | 'Converted' | 'Lost' | 'Hold';
  assignedAgent?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  lastContacted?: Date;
  leadScore: 'High' | 'Medium' | 'Low';
  activities: Activity[];
  attachments: string[];
  createdBy?: string; // Track who created the lead
}

export interface Activity {
  id: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Status Change' | 'Property Shown';
  description: string;
  date: Date;
  agent: string;
  metadata?: Record<string, any>;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  userId?: string; // Link to user record
}

export interface LeadFilters {
  status?: string[];
  assignedAgent?: string;
  source?: string[];
  propertyType?: string[];
  budgetRange?: string;
  leadScore?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}
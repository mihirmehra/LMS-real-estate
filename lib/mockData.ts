import { Lead, Agent, Activity } from '@/types/lead';

// Remove all mock data - use real database data only
export const mockAgents: Agent[] = [];
export const mockLeads: Lead[] = [];

export const budgetRanges = [
  'Under ₹20,00,000',
  '₹20,00,000 - ₹40,00,000',
  '₹40,00,000 - ₹60,00,000',
  '₹60,00,000 - ₹80,00,000',
  '₹80,00,000 - ₹1,00,00,000',
  '₹1,00,00,000 - ₹2,00,00,000',
  'Over ₹2,00,00,000',
];

export const locations = [
  'Mumbai Central',
  'Bandra',
  'Andheri',
  'Powai',
  'Thane',
  'Navi Mumbai',
  'Pune',
  'Gurgaon',
  'Noida',
  'Bangalore',
  'Hyderabad',
  'Chennai',
];
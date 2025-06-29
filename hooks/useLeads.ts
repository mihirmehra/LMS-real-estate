'use client';

import { useState, useEffect } from 'react';
import { Lead } from '@/types/lead';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/leads', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeads(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Failed to fetch leads');
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activities'>) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...leadData,
          activities: []
        }),
      });

      if (response.ok) {
        const newLead = await response.json();
        setLeads(prev => [newLead, ...prev]);
        return newLead;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create lead');
      }
    } catch (err) {
      console.error('Error creating lead:', err);
      throw err;
    }
  };

  const updateLead = async (id: string, updateData: Partial<Lead>) => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedLead = await response.json();
        setLeads(prev => prev.map(lead => lead.id === id ? updatedLead : lead));
        return updatedLead;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update lead');
      }
    } catch (err) {
      console.error('Error updating lead:', err);
      throw err;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLeads(prev => prev.filter(lead => lead.id !== id));
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete lead');
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
      throw err;
    }
  };

  const addActivity = async (leadId: string, activity: any) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activity),
      });

      if (response.ok) {
        const updatedLead = await response.json();
        setLeads(prev => prev.map(lead => lead.id === leadId ? updatedLead : lead));
        return updatedLead;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add activity');
      }
    } catch (err) {
      console.error('Error adding activity:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return {
    leads,
    loading,
    error,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    addActivity,
  };
}
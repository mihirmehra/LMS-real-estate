'use client';

import { useState, useEffect } from 'react';
import { Agent } from '@/types/lead';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch users with role 'agent' from the users API
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const users = await response.json();
        // Filter users to only include those with role 'agent' and convert to Agent format
        const agentUsers = users
          .filter((user: any) => user.role === 'agent' && user.isActive)
          .map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            active: user.isActive,
            userId: user.id,
          }));
        
        setAgents(agentUsers);
      } else {
        throw new Error('Failed to fetch agents');
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch agents');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async (agentData: Omit<Agent, 'id'>) => {
    try {
      // Since agents are now users, we create them through the users API
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          ...agentData,
          role: 'agent',
          password: 'defaultPassword123', // In production, this should be handled properly
        }),
      });

      if (response.ok) {
        const newUser = await response.json();
        const newAgent = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone || '',
          active: newUser.isActive,
          userId: newUser.id,
        };
        setAgents(prev => [...prev, newAgent]);
        return newAgent;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create agent');
      }
    } catch (err) {
      console.error('Error creating agent:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return {
    agents,
    loading,
    error,
    fetchAgents,
    createAgent,
  };
}
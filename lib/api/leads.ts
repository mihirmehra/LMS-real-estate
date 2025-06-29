import { getDatabase } from '@/lib/mongodb';
import { Lead } from '@/types/lead';
import { ObjectId } from 'mongodb';

export class LeadsAPI {
  private static async getCollection() {
    const db = await getDatabase();
    return db.collection('leads');
  }

  static async getAllLeads(): Promise<Lead[]> {
    try {
      const collection = await this.getCollection();
      const leads = await collection.find({}).sort({ createdAt: -1 }).toArray();
      
      return leads.map(lead => ({
        ...lead,
        id: lead._id.toString(),
        _id: undefined,
        createdAt: new Date(lead.createdAt),
        updatedAt: new Date(lead.updatedAt),
        lastContacted: lead.lastContacted ? new Date(lead.lastContacted) : undefined,
        activities: lead.activities?.map((activity: any) => ({
          ...activity,
          date: new Date(activity.date)
        })) || []
      })) as Lead[];
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw new Error('Failed to fetch leads from database');
    }
  }

  static async getLeadById(id: string): Promise<Lead | null> {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }
      
      const collection = await this.getCollection();
      const lead = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!lead) return null;
      
      return {
        ...lead,
        id: lead._id.toString(),
        _id: undefined,
        createdAt: new Date(lead.createdAt),
        updatedAt: new Date(lead.updatedAt),
        lastContacted: lead.lastContacted ? new Date(lead.lastContacted) : undefined,
        activities: lead.activities?.map((activity: any) => ({
          ...activity,
          date: new Date(activity.date)
        })) || []
      } as Lead;
    } catch (error) {
      console.error('Error fetching lead:', error);
      return null;
    }
  }

  static async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    try {
      const collection = await this.getCollection();
      const now = new Date();
      
      const newLead = {
        ...leadData,
        createdAt: now,
        updatedAt: now,
        activities: leadData.activities || []
      };

      const result = await collection.insertOne(newLead);
      
      return {
        ...newLead,
        id: result.insertedId.toString()
      } as Lead;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw new Error('Failed to create lead');
    }
  }

  static async updateLead(id: string, updateData: Partial<Lead>): Promise<Lead> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error('Invalid lead ID');
      }
      
      const collection = await this.getCollection();
      const now = new Date();
      
      const { id: _, ...dataToUpdate } = updateData;
      
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...dataToUpdate, 
            updatedAt: now 
          } 
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Lead not found');
      }

      return {
        ...result,
        id: result._id.toString(),
        _id: undefined,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        lastContacted: result.lastContacted ? new Date(result.lastContacted) : undefined,
        activities: result.activities?.map((activity: any) => ({
          ...activity,
          date: new Date(activity.date)
        })) || []
      } as Lead;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw new Error('Failed to update lead');
    }
  }

  static async deleteLead(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        return false;
      }
      
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error deleting lead:', error);
      return false;
    }
  }

  static async addActivity(leadId: string, activity: any): Promise<Lead> {
    try {
      if (!ObjectId.isValid(leadId)) {
        throw new Error('Invalid lead ID');
      }
      
      const collection = await this.getCollection();
      const now = new Date();
      
      const newActivity = {
        ...activity,
        id: activity.id || `activity-${Date.now()}`,
        date: new Date(activity.date || now)
      };
      
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(leadId) },
        { 
          $push: { activities: newActivity },
          $set: { updatedAt: now, lastContacted: now }
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Lead not found');
      }

      return {
        ...result,
        id: result._id.toString(),
        _id: undefined,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        lastContacted: result.lastContacted ? new Date(result.lastContacted) : undefined,
        activities: result.activities?.map((activity: any) => ({
          ...activity,
          date: new Date(activity.date)
        })) || []
      } as Lead;
    } catch (error) {
      console.error('Error adding activity:', error);
      throw new Error('Failed to add activity');
    }
  }
}
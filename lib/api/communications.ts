import { getDatabase } from '@/lib/mongodb';
import { CommunicationActivity, CalendarEvent, WhatsAppMessage } from '@/types/communication';
import { ObjectId } from 'mongodb';

export class CommunicationsAPI {
  private static async getCollection(collectionName: string) {
    const db = await getDatabase();
    return db.collection(collectionName);
  }

  // Communication Activities
  static async createActivity(activity: Omit<CommunicationActivity, 'id'>): Promise<CommunicationActivity> {
    try {
      const collection = await this.getCollection('communication_activities');
      const now = new Date();
      
      const newActivity = {
        ...activity,
        timestamp: activity.timestamp || now,
        createdAt: now,
        updatedAt: now,
      };

      const result = await collection.insertOne(newActivity);
      
      return {
        ...newActivity,
        id: result.insertedId.toString(),
      } as CommunicationActivity;
    } catch (error) {
      console.error('Error creating communication activity:', error);
      throw new Error('Failed to create communication activity');
    }
  }

  static async getActivitiesByLead(leadId: string): Promise<CommunicationActivity[]> {
    try {
      const collection = await this.getCollection('communication_activities');
      const activities = await collection.find({ leadId }).sort({ timestamp: -1 }).toArray();
      
      return activities.map(activity => ({
        ...activity,
        id: activity._id.toString(),
        _id: undefined,
        timestamp: new Date(activity.timestamp),
        createdAt: new Date(activity.createdAt),
        updatedAt: new Date(activity.updatedAt),
      })) as CommunicationActivity[];
    } catch (error) {
      console.error('Error fetching communication activities:', error);
      return [];
    }
  }

  // Calendar Events
  static async createCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    try {
      const collection = await this.getCollection('calendar_events');
      const now = new Date();
      
      const newEvent = {
        ...event,
        createdAt: now,
        updatedAt: now,
      };

      const result = await collection.insertOne(newEvent);
      
      return {
        ...newEvent,
        id: result.insertedId.toString(),
      } as CalendarEvent;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  static async getCalendarEvents(userId?: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    try {
      const collection = await this.getCollection('calendar_events');
      const query: any = {};
      
      if (userId) {
        query.createdBy = userId;
      }
      
      if (startDate || endDate) {
        query.startDateTime = {};
        if (startDate) query.startDateTime.$gte = startDate;
        if (endDate) query.startDateTime.$lte = endDate;
      }
      
      const events = await collection.find(query).sort({ startDateTime: 1 }).toArray();
      
      return events.map(event => ({
        ...event,
        id: event._id.toString(),
        _id: undefined,
        startDateTime: new Date(event.startDateTime),
        endDateTime: new Date(event.endDateTime),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
      })) as CalendarEvent[];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  }

  static async updateCalendarEvent(id: string, updateData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error('Invalid event ID');
      }
      
      const collection = await this.getCollection('calendar_events');
      const { id: _, ...dataToUpdate } = updateData;
      
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...dataToUpdate, 
            updatedAt: new Date() 
          } 
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Event not found');
      }

      return {
        ...result,
        id: result._id.toString(),
        _id: undefined,
        startDateTime: new Date(result.startDateTime),
        endDateTime: new Date(result.endDateTime),
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      } as CalendarEvent;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  static async deleteCalendarEvent(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        return false;
      }
      
      const collection = await this.getCollection('calendar_events');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return false;
    }
  }

  // WhatsApp Messages
  static async createWhatsAppMessage(message: Omit<WhatsAppMessage, 'id'>): Promise<WhatsAppMessage> {
    try {
      const collection = await this.getCollection('whatsapp_messages');
      const now = new Date();
      
      const newMessage = {
        ...message,
        sentAt: message.sentAt || now,
        status: message.status || 'sent',
        createdAt: now,
        updatedAt: now,
      };

      const result = await collection.insertOne(newMessage);
      
      return {
        ...newMessage,
        id: result.insertedId.toString(),
      } as WhatsAppMessage;
    } catch (error) {
      console.error('Error creating WhatsApp message:', error);
      throw new Error('Failed to create WhatsApp message');
    }
  }

  static async getWhatsAppMessagesByLead(leadId: string): Promise<WhatsAppMessage[]> {
    try {
      const collection = await this.getCollection('whatsapp_messages');
      const messages = await collection.find({ leadId }).sort({ sentAt: -1 }).toArray();
      
      return messages.map(message => ({
        ...message,
        id: message._id.toString(),
        _id: undefined,
        sentAt: new Date(message.sentAt),
        createdAt: new Date(message.createdAt),
        updatedAt: new Date(message.updatedAt),
      })) as WhatsAppMessage[];
    } catch (error) {
      console.error('Error fetching WhatsApp messages:', error);
      return [];
    }
  }

  static async updateWhatsAppMessageStatus(id: string, status: WhatsAppMessage['status']): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        return false;
      }
      
      const collection = await this.getCollection('whatsapp_messages');
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            status,
            updatedAt: new Date()
          } 
        }
      );
      
      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Error updating WhatsApp message status:', error);
      return false;
    }
  }
}
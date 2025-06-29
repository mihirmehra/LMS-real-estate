'use client';

// Google Calendar integration utilities
export class GoogleCalendarService {
  private static instance: GoogleCalendarService;
  private isInitialized = false;

  static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }

  async initializeGoogleAPI(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          }).then(() => {
            this.isInitialized = true;
            resolve();
          }).catch(reject);
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<boolean> {
    try {
      await this.initializeGoogleAPI();
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn({
        scope: 'https://www.googleapis.com/auth/calendar'
      });
      return user.isSignedIn();
    } catch (error) {
      console.error('Google sign-in failed:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    const authInstance = window.gapi.auth2.getAuthInstance();
    await authInstance.signOut();
  }

  isSignedIn(): boolean {
    if (!this.isInitialized) return false;
    const authInstance = window.gapi.auth2.getAuthInstance();
    return authInstance.isSignedIn.get();
  }

  async createEvent(event: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees?: { email: string }[];
    reminders?: { useDefault: boolean; overrides?: { method: string; minutes: number }[] };
  }): Promise<any> {
    await this.initializeGoogleAPI();
    
    return new Promise((resolve, reject) => {
      window.gapi.load('client', () => {
        window.gapi.client.init({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        }).then(() => {
          return window.gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: event,
          });
        }).then(resolve).catch(reject);
      });
    });
  }

  async updateEvent(eventId: string, event: any): Promise<any> {
    await this.initializeGoogleAPI();
    
    return new Promise((resolve, reject) => {
      window.gapi.load('client', () => {
        window.gapi.client.calendar.events.update({
          calendarId: 'primary',
          eventId: eventId,
          resource: event,
        }).then(resolve).catch(reject);
      });
    });
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.initializeGoogleAPI();
    
    return new Promise((resolve, reject) => {
      window.gapi.load('client', () => {
        window.gapi.client.calendar.events.delete({
          calendarId: 'primary',
          eventId: eventId,
        }).then(resolve).catch(reject);
      });
    });
  }

  async getEvents(timeMin?: string, timeMax?: string): Promise<any[]> {
    await this.initializeGoogleAPI();
    
    return new Promise((resolve, reject) => {
      window.gapi.load('client', () => {
        window.gapi.client.calendar.events.list({
          calendarId: 'primary',
          timeMin: timeMin || new Date().toISOString(),
          timeMax: timeMax,
          showDeleted: false,
          singleEvents: true,
          orderBy: 'startTime',
        }).then((response: any) => {
          resolve(response.result.items || []);
        }).catch(reject);
      });
    });
  }
}

// Extend window object for TypeScript
declare global {
  interface Window {
    gapi: any;
  }
}
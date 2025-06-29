import { NextRequest, NextResponse } from 'next/server';
import { CommunicationsAPI } from '@/lib/api/communications';

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();
    const newEvent = await CommunicationsAPI.createCalendarEvent(eventData);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const events = await CommunicationsAPI.getCalendarEvents(
      userId || undefined,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
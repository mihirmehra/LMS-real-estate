import { NextRequest, NextResponse } from 'next/server';

// This would normally connect to your database
let leads: any[] = [];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activity = await request.json();
    const leadIndex = leads.findIndex(l => l.id === params.id);
    
    if (leadIndex === -1) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }
    
    const newActivity = {
      ...activity,
      id: `activity-${Date.now()}`,
      date: new Date(activity.date || new Date())
    };
    
    if (!leads[leadIndex].activities) {
      leads[leadIndex].activities = [];
    }
    
    leads[leadIndex].activities.unshift(newActivity);
    leads[leadIndex].updatedAt = new Date();
    leads[leadIndex].lastContacted = new Date();
    
    return NextResponse.json(leads[leadIndex]);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to add activity' },
      { status: 500 }
    );
  }
}
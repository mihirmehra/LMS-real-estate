import { NextRequest, NextResponse } from 'next/server';
import { CommunicationsAPI } from '@/lib/api/communications';

export async function POST(request: NextRequest) {
  try {
    const activityData = await request.json();
    const newActivity = await CommunicationsAPI.createActivity(activityData);
    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create communication activity' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    
    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }
    
    const activities = await CommunicationsAPI.getActivitiesByLead(leadId);
    return NextResponse.json(activities);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communication activities' },
      { status: 500 }
    );
  }
}
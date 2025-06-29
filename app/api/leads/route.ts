import { NextRequest, NextResponse } from 'next/server';
import { LeadsAPI } from '@/lib/api/leads';

export async function GET() {
  try {
    const leads = await LeadsAPI.getAllLeads();
    return NextResponse.json(leads);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const leadData = await request.json();
    const newLead = await LeadsAPI.createLead(leadData);
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
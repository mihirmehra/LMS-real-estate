import { NextRequest, NextResponse } from 'next/server';
import { CommunicationsAPI } from '@/lib/api/communications';

export async function POST(request: NextRequest) {
  try {
    const messageData = await request.json();
    const newMessage = await CommunicationsAPI.createWhatsAppMessage(messageData);
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create WhatsApp message' },
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
    
    const messages = await CommunicationsAPI.getWhatsAppMessagesByLead(leadId);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WhatsApp messages' },
      { status: 500 }
    );
  }
}
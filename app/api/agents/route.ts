import { NextRequest, NextResponse } from 'next/server';
import { AgentsAPI } from '@/lib/api/agents';

export async function GET() {
  try {
    const agents = await AgentsAPI.getAllAgents();
    return NextResponse.json(agents);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const agentData = await request.json();
    const newAgent = await AgentsAPI.createAgent(agentData);
    return NextResponse.json(newAgent, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
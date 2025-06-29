import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { UsersAPI } from '@/lib/api/users';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify admin access
function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authentication required');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, JWT_SECRET) as any;
  
  if (decoded.role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return decoded;
}

export async function GET(request: NextRequest) {
  try {
    verifyAdminAccess(request);
    
    const users = await UsersAPI.getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
      }
      if (error.message.includes('Admin access required')) {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    verifyAdminAccess(request);
    
    const userData = await request.json();
    const newUser = await UsersAPI.createUser(userData);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
      }
      if (error.message.includes('Admin access required')) {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }
      if (error.message.includes('already exists')) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
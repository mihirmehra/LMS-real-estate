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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAdminAccess(request);
    
    const user = await UsersAPI.getUserById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAdminAccess(request);
    
    const updateData = await request.json();
    const updatedUser = await UsersAPI.updateUser(params.id, updateData);
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
      }
      if (error.message.includes('Admin access required')) {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }
      if (error.message.includes('not found')) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAdminAccess(request);
    
    const success = await UsersAPI.deleteUser(params.id);
    
    if (!success) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    
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
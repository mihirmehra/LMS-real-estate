import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { UsersAPI } from '@/lib/api/users';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const { currentPassword, newPassword } = await request.json();
      
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { message: 'Current password and new password are required' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { message: 'New password must be at least 6 characters long' },
          { status: 400 }
        );
      }

      // Change password in database
      const success = await UsersAPI.changePassword(decoded.userId, currentPassword, newPassword);
      
      if (!success) {
        return NextResponse.json(
          { message: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        message: 'Password changed successfully',
      });
    } catch (jwtError) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
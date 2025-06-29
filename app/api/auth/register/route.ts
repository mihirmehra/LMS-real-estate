import { NextRequest, NextResponse } from 'next/server';
import { UsersAPI } from '@/lib/api/users';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, phone, department } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'agent'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role. Must be admin or agent' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Create user in database
    const newUser = await UsersAPI.createUser({
      name,
      email,
      password,
      role,
      phone: phone || undefined,
      department: department || undefined,
    });

    return NextResponse.json({
      user: newUser,
      message: 'User created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
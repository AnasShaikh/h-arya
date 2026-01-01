import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByUsername, getUserByEmail } from '@/lib/db/auth-queries';
import '@/lib/db/init';

export async function POST(request: NextRequest) {
  try {
    const { name, username, email, password } = await request.json();

    // Validation
    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if username already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingUsername = getUserByUsername(username) as any;
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Check if email already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingEmail = getUserByEmail(email) as any;
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create user
    const userId = createUser(username, email, password, name);

    return NextResponse.json({
      success: true,
      userId,
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Error in registration:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}

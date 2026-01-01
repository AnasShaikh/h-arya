import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, verifyPassword, updateLastLogin } from '@/lib/db/auth-queries';
import '@/lib/db/init';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Get user from database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = getUserByUsername(username) as any;

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = verifyPassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Update last login
    updateLastLogin(user.id);

    // Return user data (without password hash)
    return NextResponse.json({
      success: true,
      userId: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      grade: user.grade,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

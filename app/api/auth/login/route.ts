import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, verifyPassword, updateLastLogin } from '@/lib/db/auth-queries';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = await getUserByUsername(username);

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    await updateLastLogin(user.id);

    return NextResponse.json({
      success: true,
      userId: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      grade: user.grade,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}

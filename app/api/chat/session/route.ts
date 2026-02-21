import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, subject, chapter } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const session = await prisma.session.create({
      data: { userId: parseInt(userId), subject, chapter },
    });

    return NextResponse.json({ sessionId: session.id, message: 'Session created successfully' });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

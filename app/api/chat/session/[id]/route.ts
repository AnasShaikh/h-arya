import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);

    await prisma.session.update({
      where: { id: sessionId },
      data: { endTime: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Session ended successfully' });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
  }
}

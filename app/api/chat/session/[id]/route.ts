import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/connection';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = parseInt(params.id);

    // End the session
    const stmt = db.prepare('UPDATE sessions SET end_time = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(sessionId);

    return NextResponse.json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}

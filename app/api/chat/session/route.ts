import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/connection';

export async function POST(request: NextRequest) {
  try {
    const { userId, chapterId, subject, chapter } = await request.json();

    if (!userId || !chapterId) {
      return NextResponse.json(
        { error: 'User ID and Chapter ID are required' },
        { status: 400 }
      );
    }

    // Create new chat session
    const stmt = db.prepare(
      'INSERT INTO sessions (user_id, subject, chapter, start_time) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
    );
    const result = stmt.run(userId, subject, chapter);

    return NextResponse.json({
      sessionId: result.lastInsertRowid,
      message: 'Session created successfully'
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

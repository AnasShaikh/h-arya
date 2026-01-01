import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/connection';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const chapterId = parseInt(resolvedParams.id);
    const userId = request.headers.get('x-user-id') || 
                   request.cookies.get('userId')?.value;

    // Get chapter details
    const chapterStmt = db.prepare('SELECT * FROM curriculum WHERE id = ?');
    const chapter = chapterStmt.get(chapterId);

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Get user progress for this chapter (if user is logged in)
    let currentStage = 1;
    let completedStages: number[] = [];

    if (userId) {
      const progressStmt = db.prepare(
        'SELECT * FROM progress WHERE user_id = ? AND subject = ? AND chapter = ?'
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const progress = progressStmt.get(userId, (chapter as any).subject, (chapter as any).chapter_name) as any;

      if (progress) {
        currentStage = progress.current_stage || 1;
        try {
          completedStages = JSON.parse(progress.stages_completed || '[]');
        } catch (e) {
          completedStages = [];
        }
      }
    }

    return NextResponse.json({
      chapter,
      currentStage,
      completedStages
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter details' },
      { status: 500 }
    );
  }
}

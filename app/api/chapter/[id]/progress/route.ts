import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/connection';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, stageCompleted, score } = await request.json();
    const resolvedParams = await params;
    const chapterId = parseInt(resolvedParams.id);

    if (!userId || !stageCompleted) {
      return NextResponse.json(
        { error: 'User ID and stage are required' },
        { status: 400 }
      );
    }

    // Get chapter details
    const chapterStmt = db.prepare('SELECT * FROM curriculum WHERE id = ?');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chapter = chapterStmt.get(chapterId) as any;

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Get current progress
    const progressStmt = db.prepare(
      'SELECT * FROM progress WHERE user_id = ? AND subject = ? AND chapter = ?'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let progress = progressStmt.get(userId, chapter.subject, chapter.chapter_name) as any;

    let completedStages: number[] = [];
    let currentStage = stageCompleted;

    if (progress) {
      // Parse existing completed stages
      try {
        completedStages = JSON.parse(progress.stages_completed || '[]');
      } catch (e) {
        completedStages = [];
      }
      
      // Add this stage if not already completed
      if (!completedStages.includes(stageCompleted)) {
        completedStages.push(stageCompleted);
        completedStages.sort((a, b) => a - b);
      }

      // Update current stage to next incomplete stage
      currentStage = completedStages.length === 5 ? 5 : Math.max(...completedStages) + 1;

      // Update existing progress
      const updateStmt = db.prepare(`
        UPDATE progress 
        SET current_stage = ?, 
            stages_completed = ?, 
            mastery_level = ?,
            status = ?,
            last_practiced = CURRENT_TIMESTAMP
        WHERE user_id = ? AND subject = ? AND chapter = ?
      `);
      
      const status = completedStages.length === 5 ? 'completed' : 'in_progress';
      
      updateStmt.run(
        currentStage,
        JSON.stringify(completedStages),
        score || progress.mastery_level || 0,
        status,
        userId,
        chapter.subject,
        chapter.chapter_name
      );
    } else {
      // Create new progress entry
      completedStages = [stageCompleted];
      currentStage = 2; // Move to stage 2 after completing stage 1

      const insertStmt = db.prepare(`
        INSERT INTO progress (user_id, subject, chapter, current_stage, stages_completed, mastery_level, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      insertStmt.run(
        userId,
        chapter.subject,
        chapter.chapter_name,
        currentStage,
        JSON.stringify(completedStages),
        score || 0,
        'in_progress'
      );
    }

    return NextResponse.json({
      success: true,
      currentStage,
      completedStages,
      message: `Stage ${stageCompleted} completed!`
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

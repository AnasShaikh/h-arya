import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

const TOTAL_LEARNING_STAGES = 6;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, stageCompleted, score } = await request.json();
    const { id } = await params;
    const chapterId = parseInt(id);

    if (!userId || !stageCompleted) {
      return NextResponse.json({ error: 'User ID and stage are required' }, { status: 400 });
    }

    const chapter = await prisma.curriculum.findUnique({ where: { id: chapterId } });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const existing = await prisma.progress.findUnique({
      where: {
        userId_subject_chapter: {
          userId: parseInt(userId),
          subject: chapter.subject,
          chapter: chapter.chapterName,
        },
      },
    });

    let completedStages: number[] = [];
    let currentStage = stageCompleted;

    if (existing) {
      completedStages = Array.isArray(existing.stagesCompleted)
        ? ((existing.stagesCompleted as number[]).filter(stage => stage >= 1 && stage <= TOTAL_LEARNING_STAGES))
        : [];

      if (stageCompleted >= 1 && stageCompleted <= TOTAL_LEARNING_STAGES && !completedStages.includes(stageCompleted)) {
        completedStages.push(stageCompleted);
        completedStages.sort((a, b) => a - b);
      }

      const highestStage = completedStages.length > 0 ? Math.max(...completedStages) : 1;
      currentStage = completedStages.length >= TOTAL_LEARNING_STAGES
        ? TOTAL_LEARNING_STAGES
        : Math.min(highestStage + 1, TOTAL_LEARNING_STAGES);

      const status = completedStages.length >= TOTAL_LEARNING_STAGES ? 'completed' : 'in_progress';

      await prisma.progress.update({
        where: {
          userId_subject_chapter: {
            userId: parseInt(userId),
            subject: chapter.subject,
            chapter: chapter.chapterName,
          },
        },
        data: {
          currentStage,
          stagesCompleted: completedStages,
          masteryLevel: score ?? existing.masteryLevel,
          status,
          lastPracticed: new Date(),
        },
      });
    } else {
      completedStages = stageCompleted >= 1 && stageCompleted <= TOTAL_LEARNING_STAGES
        ? [stageCompleted]
        : [];
      currentStage = completedStages.length > 0
        ? Math.min(stageCompleted + 1, TOTAL_LEARNING_STAGES)
        : 1;

      await prisma.progress.create({
        data: {
          userId: parseInt(userId),
          subject: chapter.subject,
          chapter: chapter.chapterName,
          currentStage,
          stagesCompleted: completedStages,
          masteryLevel: score ?? 0,
          status: 'in_progress',
        },
      });
    }

    return NextResponse.json({
      success: true,
      currentStage,
      completedStages,
      message: `Stage ${stageCompleted} completed!`,
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}

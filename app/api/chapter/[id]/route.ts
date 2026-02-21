import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapterId = parseInt(id);
    const userId = request.headers.get('x-user-id') || request.cookies.get('userId')?.value;

    const chapter = await prisma.curriculum.findUnique({ where: { id: chapterId } });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    let currentStage = 1;
    let completedStages: number[] = [];

    if (userId) {
      const progress = await prisma.progress.findUnique({
        where: {
          userId_subject_chapter: {
            userId: parseInt(userId),
            subject: chapter.subject,
            chapter: chapter.chapterName,
          },
        },
      });

      if (progress) {
        currentStage = progress.currentStage;
        completedStages = Array.isArray(progress.stagesCompleted)
          ? (progress.stagesCompleted as number[])
          : [];
      }
    }

    return NextResponse.json({ chapter, currentStage, completedStages });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json({ error: 'Failed to fetch chapter details' }, { status: 500 });
  }
}

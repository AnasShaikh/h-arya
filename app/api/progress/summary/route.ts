import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const progress = await prisma.progress.findMany({
    where: { userId: parseInt(userId) },
    select: {
      subject: true,
      chapter: true,
      status: true,
      masteryLevel: true,
      stagesCompleted: true,
      currentStage: true,
      lastPracticed: true,
    },
  });

  const bySubject: Record<
    string,
    {
      completed: number;
      inProgress: number;
      total: number;
      avgMastery: number;
      chapters: Record<
        string,
        { status: string; stagesCompleted: number[]; masteryLevel: number }
      >;
    }
  > = {};

  for (const p of progress) {
    if (!bySubject[p.subject]) {
      bySubject[p.subject] = {
        completed: 0,
        inProgress: 0,
        total: 0,
        avgMastery: 0,
        chapters: {},
      };
    }

    bySubject[p.subject].chapters[p.chapter] = {
      status: p.status,
      stagesCompleted: Array.isArray(p.stagesCompleted)
        ? (p.stagesCompleted as number[])
        : [],
      masteryLevel: p.masteryLevel,
    };

    bySubject[p.subject].total++;
    if (p.status === 'completed') bySubject[p.subject].completed++;
    else if (p.status === 'in_progress') bySubject[p.subject].inProgress++;
  }

  for (const subj of Object.keys(bySubject)) {
    const chapters = Object.values(bySubject[subj].chapters);
    bySubject[subj].avgMastery = chapters.length
      ? Math.round(
          chapters.reduce((a, c) => a + c.masteryLevel, 0) / chapters.length,
        )
      : 0;
  }

  const totalStarted = progress.length;
  const totalCompleted = progress.filter((p) => p.status === 'completed').length;
  const overallMastery = progress.length
    ? Math.round(
        progress.reduce((a, p) => a + p.masteryLevel, 0) / progress.length,
      )
    : 0;

  return NextResponse.json({
    bySubject,
    totalStarted,
    totalCompleted,
    overallMastery,
  });
}

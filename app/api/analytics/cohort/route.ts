import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

function hasStage(stagesCompleted: unknown, stage: number): boolean {
  if (!Array.isArray(stagesCompleted)) return false;
  return stagesCompleted.some((s) => Number(s) === stage);
}

function parseIntParam(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) ? n : null;
}

function parseDateParam(raw: string | null): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const grade = parseIntParam(params.get('grade'));
    const board = params.get('board')?.trim() || null;
    const cohort = params.get('cohort')?.trim() || 'all';
    const fromDate = parseDateParam(params.get('from'));
    const toDate = parseDateParam(params.get('to'));

    const userWhere: {
      grade?: number;
      board?: string;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (grade !== null) userWhere.grade = grade;
    if (board) userWhere.board = board;

    if (cohort === 'new_7d') {
      userWhere.createdAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (cohort === 'new_30d') {
      userWhere.createdAt = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }

    if (fromDate || toDate) {
      userWhere.createdAt = {
        ...(userWhere.createdAt || {}),
        ...(fromDate ? { gte: fromDate } : {}),
        ...(toDate ? { lte: toDate } : {}),
      };
    }

    const users = await prisma.user.findMany({
      where: userWhere,
      select: { id: true },
    });

    const userIds = users.map((u) => u.id);

    if (userIds.length === 0) {
      return NextResponse.json({
        kpis: {
          chapter_started: 0,
          memorize_completed: 0,
          test_submitted: 0,
          score_avg_all_time: 0,
          score_avg_24h: 0,
          active_learners: 0,
        },
      });
    }

    const [progressRows, assessments] = await Promise.all([
      prisma.progress.findMany({
        where: { userId: { in: userIds } },
        select: {
          userId: true,
          currentStage: true,
          stagesCompleted: true,
          status: true,
        },
      }),
      prisma.assessment.findMany({
        where: { userId: { in: userIds } },
        select: {
          userId: true,
          score: true,
          timestamp: true,
        },
      }),
    ]);

    const chapterStarted = progressRows.filter(
      (p) => p.status !== 'not_started' || p.currentStage > 1 || (Array.isArray(p.stagesCompleted) && p.stagesCompleted.length > 0)
    ).length;

    const memorizeCompleted = progressRows.filter((p) => hasStage(p.stagesCompleted, 6)).length;
    const testSubmitted = progressRows.filter((p) => hasStage(p.stagesCompleted, 4)).length;

    const uniqueLearners = new Set(progressRows.map((p) => p.userId)).size;
    const testAvgScore = assessments.length
      ? assessments.reduce((acc, a) => acc + Number(a.score || 0), 0) / assessments.length
      : 0;

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const assessments24h = assessments.filter((a) => now - new Date(a.timestamp).getTime() <= oneDayMs);
    const avgScore24h = assessments24h.length
      ? assessments24h.reduce((acc, a) => acc + Number(a.score || 0), 0) / assessments24h.length
      : 0;

    return NextResponse.json({
      kpis: {
        chapter_started: chapterStarted,
        memorize_completed: memorizeCompleted,
        test_submitted: testSubmitted,
        score_avg_all_time: Number(testAvgScore.toFixed(2)),
        score_avg_24h: Number(avgScore24h.toFixed(2)),
        active_learners: uniqueLearners,
      },
    });
  } catch (error) {
    console.error('Failed to load cohort analytics:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}

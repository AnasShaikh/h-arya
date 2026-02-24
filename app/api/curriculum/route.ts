import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const grade = parseInt(searchParams.get('grade') || '7');

    const chapters = await prisma.curriculum.findMany({
      where: { grade },
      orderBy: [{ subject: 'asc' }, { chapterNumber: 'asc' }],
    });
    return NextResponse.json({ chapters });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    return NextResponse.json({ error: 'Failed to fetch curriculum' }, { status: 500 });
  }
}

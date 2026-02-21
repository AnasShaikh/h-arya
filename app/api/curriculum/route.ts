import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET() {
  try {
    const chapters = await prisma.curriculum.findMany({
      orderBy: [{ subject: 'asc' }, { chapterNumber: 'asc' }],
    });
    return NextResponse.json({ chapters });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    return NextResponse.json({ error: 'Failed to fetch curriculum' }, { status: 500 });
  }
}

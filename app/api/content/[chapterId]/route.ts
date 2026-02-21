import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/db/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const curriculumId = parseInt(chapterId);

    const curriculum = await prisma.curriculum.findUnique({ where: { id: curriculumId } });

    if (!curriculum) {
      return NextResponse.json(
        { error: `Chapter with ID ${curriculumId} not found in curriculum` },
        { status: 404 }
      );
    }

    const contentDir = path.join(process.cwd(), 'content', 'chapters');

    if (!fs.existsSync(contentDir)) {
      return NextResponse.json({ error: 'Content directory not found' }, { status: 404 });
    }

    const files = fs.readdirSync(contentDir);

    // Find files matching chapter number, then pick the one whose metadata.subject matches
    const candidates = files.filter(
      f => f.startsWith(`chapter-${curriculum.chapterNumber}-`) && f.endsWith('.json')
    );

    if (candidates.length === 0) {
      return NextResponse.json(
        { error: `Content file not found for chapter ${curriculum.chapterNumber} (${curriculum.chapterName})` },
        { status: 404 }
      );
    }

    // When multiple files match (same chapter number, different subjects), pick by subject
    let chapterFile = candidates[0];
    if (candidates.length > 1) {
      const match = candidates.find(f => {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(contentDir, f), 'utf-8'));
          return data.metadata.subject === curriculum.subject;
        } catch { return false; }
      });
      if (match) chapterFile = match;
    }

    const filePath = path.join(contentDir, chapterFile);
    const chapterData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (chapterData.metadata.chapterNumber !== curriculum.chapterNumber) {
      return NextResponse.json(
        { error: `Chapter number mismatch in file` },
        { status: 400 }
      );
    }

    return NextResponse.json(chapterData);
  } catch (error) {
    console.error('Error loading chapter content:', error);
    return NextResponse.json(
      { error: 'Failed to load chapter content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

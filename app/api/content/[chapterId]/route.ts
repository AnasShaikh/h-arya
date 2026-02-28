import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/db/prisma';

type ChapterCandidate = {
  file: string;
  data: any;
};

function loadCandidate(contentDir: string, file: string): ChapterCandidate | null {
  try {
    const raw = fs.readFileSync(path.join(contentDir, file), 'utf-8');
    return { file, data: JSON.parse(raw) };
  } catch {
    return null;
  }
}

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
    const candidates = files
      .filter(f => f.startsWith(`chapter-${curriculum.chapterNumber}-`) && f.endsWith('.json'))
      .map(f => loadCandidate(contentDir, f))
      .filter((x): x is ChapterCandidate => x !== null);

    if (candidates.length === 0) {
      return NextResponse.json(
        {
          error: `Content file not found for chapter ${curriculum.chapterNumber} (${curriculum.chapterName})`,
        },
        { status: 404 }
      );
    }

    const subjectMatches = candidates.filter(c => c.data?.metadata?.subject === curriculum.subject);

    if (subjectMatches.length === 0) {
      const candidateSubjects = candidates
        .map(c => String(c.data?.metadata?.subject ?? 'unknown'))
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort();

      return NextResponse.json(
        {
          error: `No ${curriculum.subject} content file found for chapter ${curriculum.chapterNumber}`,
          expectedSubject: curriculum.subject,
          candidateSubjects,
        },
        { status: 404 }
      );
    }

    const gradeMatch = subjectMatches.find(c => c.data?.metadata?.grade === curriculum.grade);
    const picked = gradeMatch ?? subjectMatches[0];
    const chapterData = picked.data;

    if (chapterData?.metadata?.chapterNumber !== curriculum.chapterNumber) {
      return NextResponse.json({ error: 'Chapter number mismatch in content file' }, { status: 400 });
    }

    if (chapterData?.metadata?.subject !== curriculum.subject) {
      return NextResponse.json({ error: 'Subject mismatch in content file' }, { status: 400 });
    }

    return NextResponse.json(chapterData);
  } catch (error) {
    console.error('Error loading chapter content:', error);
    return NextResponse.json(
      {
        error: 'Failed to load chapter content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

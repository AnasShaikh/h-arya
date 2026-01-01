import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import db from '@/lib/db/connection';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const resolvedParams = await params;
    const curriculumId = parseInt(resolvedParams.chapterId);

    // Step 1: Query database to get actual chapter number
    const stmt = db.prepare('SELECT chapter_number, chapter_name FROM curriculum WHERE id = ?');
    const curriculum = stmt.get(curriculumId) as { chapter_number: number; chapter_name: string } | undefined;

    if (!curriculum) {
      return NextResponse.json(
        { error: `Chapter with ID ${curriculumId} not found in curriculum` },
        { status: 404 }
      );
    }

    const actualChapterNumber = curriculum.chapter_number;

    // Step 2: Find content file using actual chapter number
    const contentDir = path.join(process.cwd(), 'content', 'chapters');
    
    if (!fs.existsSync(contentDir)) {
      return NextResponse.json(
        { error: 'Content directory not found' },
        { status: 404 }
      );
    }

    const files = fs.readdirSync(contentDir);
    const chapterFile = files.find(file => 
      file.startsWith(`chapter-${actualChapterNumber}-`) && file.endsWith('.json')
    );

    if (!chapterFile) {
      return NextResponse.json(
        { error: `Content file not found for chapter ${actualChapterNumber} (${curriculum.chapter_name})` },
        { status: 404 }
      );
    }

    // Step 3: Read and parse the JSON file
    const filePath = path.join(contentDir, chapterFile);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const chapterData = JSON.parse(fileContent);

    // Step 4: Validate that chapter number matches
    if (chapterData.metadata.chapterNumber !== actualChapterNumber) {
      return NextResponse.json(
        { error: `Chapter number mismatch: file has ${chapterData.metadata.chapterNumber}, expected ${actualChapterNumber}` },
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

import { NextResponse } from 'next/server';
import db from '@/lib/db/connection';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM curriculum ORDER BY subject, chapter_number');
    const chapters = stmt.all();

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curriculum' },
      { status: 500 }
    );
  }
}

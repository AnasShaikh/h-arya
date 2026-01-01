import { NextRequest, NextResponse } from 'next/server';
import { createStudent, getStudentByName } from '@/lib/db/queries';
import '@/lib/db/init'; // Initialize database

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if student already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingStudent = getStudentByName(name) as any;
    
    if (existingStudent) {
      return NextResponse.json({
        studentId: existingStudent.id,
        message: 'Welcome back!',
        isNew: false
      });
    }

    // Create new student
    const studentId = createStudent(name);

    return NextResponse.json({
      studentId,
      message: 'Student created successfully',
      isNew: true
    });
  } catch (error) {
    console.error('Error in student API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

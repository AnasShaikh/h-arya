import { NextRequest, NextResponse } from 'next/server';
import { generateAssessmentQuestions } from '@/lib/ai/gemini';
import { createAssessment } from '@/lib/db/queries';
import type { Question, Answer } from '@/lib/types';

// Sample questions as fallback (in case AI generation fails)
const fallbackQuestions: Question[] = [
  {
    id: 'q1',
    question: 'How is sound produced?',
    options: [
      'By the vibration of an object',
      'By light waves',
      'By heat energy',
      'By magnetic fields'
    ],
    correctAnswer: 'A',
    difficulty: 'easy'
  },
  {
    id: 'q2',
    question: 'What is the unit used to measure the frequency of sound?',
    options: ['Decibel (dB)', 'Hertz (Hz)', 'Meter (m)', 'Second (s)'],
    correctAnswer: 'B',
    difficulty: 'easy'
  },
  {
    id: 'q3',
    question: 'What is the frequency range of sound audible to human beings?',
    options: ['0 Hz to 20 Hz', '20 Hz to 20,000 Hz', '20,000 Hz to 50,000 Hz', '10 Hz to 10,000 Hz'],
    correctAnswer: 'B',
    difficulty: 'medium'
  },
  {
    id: 'q4',
    question: 'Sound with frequency less than 20 Hz is called:',
    options: ['Ultrasonic sound', 'Audible sound', 'Infrasonic sound', 'Supersonic sound'],
    correctAnswer: 'C',
    difficulty: 'medium'
  },
  {
    id: 'q5',
    question: 'Which of these is a use of ultrasonic sound?',
    options: [
      'Listening to music',
      'SONAR - to locate objects underwater',
      'Making phone calls',
      'Watching television'
    ],
    correctAnswer: 'B',
    difficulty: 'hard'
  }
];

export async function GET() {
  try {
    // Try to generate questions with AI
    try {
      const aiResponse = await generateAssessmentQuestions(
        'Sound - Production, Propagation, Pitch, Intensity (7th Grade Maharashtra Board)',
        'medium',
        5
      );
      
      // Parse AI response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]) as Question[];
        return NextResponse.json({ questions });
      }
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError);
    }

    // Use fallback questions if AI fails
    return NextResponse.json({ questions: fallbackQuestions });
  } catch (error) {
    console.error('Error in assessment GET:', error);
    return NextResponse.json(
      { error: 'Failed to generate assessment' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { studentId, answers } = await request.json();

    if (!studentId || !answers) {
      return NextResponse.json(
        { error: 'Student ID and answers are required' },
        { status: 400 }
      );
    }

    // Get questions (use fallback for now)
    const questions = fallbackQuestions;
    
    // Calculate score
    let correct = 0;
    const answersArray: Answer[] = [];

    questions.forEach(q => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      
      if (isCorrect) correct++;
      
      answersArray.push({
        questionId: q.id,
        userAnswer,
        isCorrect
      });
    });

    const score = (correct / questions.length) * 100;
    
    // Determine knowledge level
    let level = 'Beginner';
    if (score >= 80) level = 'Advanced';
    else if (score >= 60) level = 'Intermediate';

    // Save assessment to database
    createAssessment(
      studentId,
      'Science',
      'Sound',
      questions,
      answersArray,
      score,
      questions.length
    );

    return NextResponse.json({
      score,
      correct,
      total: questions.length,
      level,
      message: `Great job! You scored ${score.toFixed(0)}%`
    });
  } catch (error) {
    console.error('Error in assessment POST:', error);
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}

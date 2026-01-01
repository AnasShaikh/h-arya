import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    const { chapterName } = await request.json();

    if (!chapterName) {
      return NextResponse.json(
        { error: 'Chapter name is required' },
        { status: 400 }
      );
    }

    // Generate suggested questions using Gemini
    const prompt = `Generate 4 engaging starter questions that a 7th grade student might ask about "${chapterName}". 

Requirements:
- Questions should be specific to this chapter topic
- Mix of conceptual understanding and real-world applications
- Age-appropriate language for 7th graders
- One question about exam preparation
- Format: Return ONLY a JSON array of 4 question strings, nothing else

Example format:
["Question 1 text here?", "Question 2 text here?", "Question 3 text here?", "Question 4 text here?"]`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse JSON from response
    const jsonMatch = response.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ questions });
    }

    // Fallback if parsing fails
    return NextResponse.json({
      questions: [
        `What are the main concepts in ${chapterName}?`,
        `Can you explain a key concept from this chapter?`,
        `Give me an example related to ${chapterName}`,
        `What should I focus on for exams?`
      ]
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    
    // Return fallback questions on error
    const { chapterName } = await request.json();
    return NextResponse.json({
      questions: [
        `What are the main concepts in ${chapterName}?`,
        `Can you explain a key concept from this chapter?`,
        `Give me an example related to ${chapterName}`,
        `What should I focus on for exams?`
      ]
    });
  }
}

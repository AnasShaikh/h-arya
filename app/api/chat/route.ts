import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, generateTutorPrompt } from '@/lib/ai/gemini';
import { createMessage } from '@/lib/db/queries';
import db from '@/lib/db/connection';

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId, message, conversationHistory } = await request.json();

    if (!userId || !sessionId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save user message
    const userMessageId = createMessage(sessionId, 'user', message);

    // Fetch session details to get chapter name
    const sessionStmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
    const session = sessionStmt.get(sessionId) as { chapter: string; subject: string } | undefined;

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Build context for AI
    const userName = 'Student'; // You can fetch from DB if needed

    // Build system prompt with dynamic chapter context
    const systemPrompt = generateTutorPrompt(
      userName,
      session.chapter,
      'Intermediate', // Can be fetched from pre-assessment
      conversationHistory.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join('\n')
    );

    // Get AI response with better error handling
    let aiResponse: string;
    try {
      console.log('Attempting to generate AI response with Gemini...');
      console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
      console.log('Message:', message);
      
      aiResponse = await generateChatResponse(message, systemPrompt);
      console.log('✅ AI response generated successfully');
    } catch (aiError: unknown) {
      const error = aiError as Error;
      console.error('❌ Gemini API error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      
      // Fallback response if AI fails
      aiResponse = "I'm having trouble connecting to the AI right now. Could you please rephrase your question or try again in a moment?";
    }

    // Save AI response
    const aiMessageId = createMessage(sessionId, 'assistant', aiResponse);

    return NextResponse.json({
      response: aiResponse,
      messageId: aiMessageId,
      sessionId
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

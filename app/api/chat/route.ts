import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, generateTutorPrompt } from '@/lib/ai/gemini';
import { createMessage } from '@/lib/db/queries';
import prisma from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId, message, conversationHistory } = await request.json();

    if (!userId || !sessionId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await createMessage(sessionId, 'user', message);

    const session = await prisma.session.findUnique({ where: { id: sessionId } });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const systemPrompt = generateTutorPrompt(
      'Student',
      session.chapter ?? '',
      session.subject ?? 'General',
      'Intermediate',
      conversationHistory
        .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
        .join('\n'),
    );

    let aiResponse: string;
    try {
      aiResponse = await generateChatResponse(message, systemPrompt);
    } catch (aiError) {
      console.error('Gemini API error:', aiError);
      aiResponse = "I'm having trouble connecting to the AI right now. Please try again in a moment.";
    }

    const aiMessageId = await createMessage(sessionId, 'assistant', aiResponse);

    return NextResponse.json({ response: aiResponse, messageId: aiMessageId, sessionId });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}

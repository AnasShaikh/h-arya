import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing OpenAI API...');
    console.log('OPENAI_KEY exists:', !!process.env.OPENAI_KEY);
    console.log('OPENAI_KEY length:', process.env.OPENAI_KEY?.length);
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY || '',
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello in one sentence.' }
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    const response = completion.choices[0]?.message?.content || 'No response';
    
    console.log('✅ OpenAI API SUCCESS!');
    console.log('Response:', response);

    return NextResponse.json({
      success: true,
      message: 'OpenAI API is working!',
      response: response,
      model: 'gpt-3.5-turbo',
      apiKeyExists: !!process.env.OPENAI_KEY
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ OpenAI API Error:', {
      message: err?.message,
      name: err?.name
    });

    return NextResponse.json({
      success: false,
      error: err?.message || 'Unknown error',
      apiKeyExists: !!process.env.OPENAI_KEY
    }, { status: 500 });
  }
}

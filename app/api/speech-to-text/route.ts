import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get mime type (webm, mp3, wav, etc.)
    const mimeType = audioFile.type || 'audio/webm';

    // Transcribe using Gemini
    const transcription = await transcribeAudio(buffer, mimeType);

    return NextResponse.json({
      transcription: transcription,
      success: true
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}

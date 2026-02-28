import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

function getElevenLabsClient() {
  const apiKey = process.env.ELEVEN_LABS_KEY;
  if (!apiKey) {
    return null;
  }
  return new ElevenLabsClient({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const elevenlabs = getElevenLabsClient();
    if (!elevenlabs) {
      return NextResponse.json(
        { error: 'TTS is not configured on this deployment' },
        { status: 503 }
      );
    }

    const audio = await elevenlabs.textToSpeech.convert('pNInz6obpgDQGcFmaJgB', {
      text,
      modelId: 'eleven_multilingual_v2',
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.0,
        useSpeakerBoost: true,
      },
    });

    const reader = audio.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const audioBuffer = Buffer.concat(chunks);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating TTS:', error);
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
  }
}

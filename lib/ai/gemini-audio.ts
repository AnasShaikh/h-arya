import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI for audio
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the audio-capable model
export const audioModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash-native-audio-dialog'
});

// Generate audio response
export async function generateAudioResponse(
  prompt: string,
  systemPrompt: string = ''
): Promise<{ text: string; audioData: string | null }> {
  try {
    const fullPrompt = systemPrompt 
      ? `${systemPrompt}\n\nStudent Question: ${prompt}` 
      : prompt;

    const result = await audioModel.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: fullPrompt }]
      }],
      generationConfig: {
        responseModalities: ['AUDIO', 'TEXT'],
        speechConfig: {
          voiceConfig: { 
            prebuiltVoiceConfig: { 
              voiceName: 'Kore' // Clear, friendly voice
            } 
          }
        }
      }
    });

    const response = result.response;
    
    // Extract text
    const text = response.text();
    
    // Extract audio data if available
    let audioData: string | null = null;
    const audioPart = response.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData?.mimeType?.startsWith('audio/')
    );
    
    if (audioPart?.inlineData?.data) {
      audioData = audioPart.inlineData.data;
    }

    return { text, audioData };
  } catch (error) {
    console.error('Error generating audio response:', error);
    throw new Error('Failed to generate audio response.');
  }
}

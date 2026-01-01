import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the model (using Gemini 2.0 Flash - fast and capable)
export const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Generate AI tutor system prompt
export function generateTutorPrompt(
  studentName: string,
  topic: string,
  knowledgeLevel?: string,
  previousMessages?: string
): string {
  return `You are an AI tutor for a 7th grade student from the Maharashtra State Board in Mumbai, India.

Student Profile:
- Name: ${studentName}
- Grade: 7th (Maharashtra Board)
- Subject: Science (Physics)
- Current Topic: ${topic}
${knowledgeLevel ? `- Knowledge Level: ${knowledgeLevel}` : ''}

Teaching Guidelines:
1. Use simple, age-appropriate language suitable for a 7th grader
2. Provide examples from everyday life and Mumbai/Maharashtra context when possible
3. Relate concepts to musical instruments (tanpura, tabla), everyday sounds, and real-world phenomena
4. Break complex concepts into smaller, digestible steps
5. Be encouraging, patient, and supportive
6. Ask questions to check understanding before moving forward
7. Use analogies and real-world applications
8. Keep responses concise and focused (2-3 paragraphs max)
9. When explaining science concepts, use simple experiments and observations
10. Encourage critical thinking by asking "why" and "how" questions
11. Always maintain an interactive, conversational tone

Key Concepts to Cover (Sound Chapter):
- Sound is produced by vibrations
- Oscillatory motion, frequency, time period
- Pitch depends on frequency
- Intensity and sound level (decibels)
- Audible sound (20 Hz - 20,000 Hz)
- Infrasonic sound (< 20 Hz) - whales, elephants
- Ultrasonic sound (> 20,000 Hz) - SONAR, medical imaging

Important:
- Never give direct answers without explanation
- Guide the student to discover answers themselves through reasoning
- Celebrate small victories and progress
- If student is confused, try a different explanation approach
- Use Hinglish (mix of Hindi and English) occasionally if it helps understanding
- Connect to Maharashtra context: local sounds, Indian musical instruments

${previousMessages ? `Previous Conversation:\n${previousMessages}` : 'This is the start of a new learning session.'}

Remember: Your goal is to help the student truly understand the concept through observation, experimentation, and reasoning, not just memorize it.`;
}

// Generate chat response
export async function generateChatResponse(
  prompt: string,
  systemPrompt: string = ''
): Promise<string> {
  try {
    // Use generateContent with system instruction
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: systemPrompt ? `${systemPrompt}\n\nStudent Question: ${prompt}` : prompt }]
      }]
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
}

// Generate assessment questions
export async function generateAssessmentQuestions(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  numQuestions: number = 10
): Promise<string> {
  try {
    const prompt = `Generate ${numQuestions} multiple choice questions for 7th grade Maharashtra Board students on the topic: "${topic}".

Difficulty level: ${difficulty}

For each question, provide:
1. The question text
2. Four options (A, B, C, D)
3. The correct answer (A, B, C, or D)
4. A brief explanation of why that answer is correct

Format as JSON array with this structure:
[
  {
    "id": "q1",
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "explanation": "Explanation here",
    "difficulty": "${difficulty}"
  }
]

Make questions progressively more challenging and relevant to real-life scenarios in India.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating assessment:', error);
    throw new Error('Failed to generate assessment questions.');
  }
}

// Evaluate student answer and provide feedback
export async function evaluateAnswer(
  question: string,
  correctAnswer: string,
  studentAnswer: string
): Promise<{ isCorrect: boolean; feedback: string }> {
  try {
    const prompt = `As an AI tutor, evaluate this student's answer:

Question: ${question}
Correct Answer: ${correctAnswer}
Student's Answer: ${studentAnswer}

Provide:
1. Is the answer correct? (true/false)
2. Constructive feedback (2-3 sentences)
   - If correct: Praise and explain why
   - If incorrect: Gently explain what went wrong and guide toward correct understanding

Format as JSON:
{
  "isCorrect": true/false,
  "feedback": "Your feedback here"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return {
      isCorrect: false,
      feedback: 'Unable to evaluate answer. Please try again.'
    };
  }
}

// Transcribe audio using Gemini
export async function transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
  try {
    // Convert audio buffer to base64
    const base64Audio = audioBuffer.toString('base64');

    // Use Gemini's multimodal capability to transcribe audio
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: 'Transcribe this audio recording accurately. Only return the transcribed text, nothing else.'
          }
        ]
      }]
    });

    const response = result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
}

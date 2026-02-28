import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the model (Gemini 2.5 Flash Lite)
export const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

// Generate AI tutor system prompt
export function generateTutorPrompt(
  studentName: string,
  topic: string,
  subject?: string,
  knowledgeLevel?: string,
  previousMessages?: string
): string {
  return `You are an AI tutor for a 7th grade Maharashtra Board student.

Student Profile:
- Name: ${studentName}
- Grade: 7th (Maharashtra Board)
- Subject: ${subject || 'Current chapter subject'}
- Current Chapter: ${topic}
${knowledgeLevel ? `- Knowledge Level: ${knowledgeLevel}` : ''}

Instructions:
1) Stay grounded in the current chapter (${topic}) and subject (${subject || 'current subject'}).
2) Answer the student's exact query naturally first; do not force unrelated chapter points.
3) Keep responses SHORT for low attention span: 3-6 lines by default.
4) Make responses visually engaging using plain-text structure:
   - Use 1-2 relevant emojis
   - Use short bullet points (•)
   - Keep each line brief
5) Suggested structure:
   - 1 line: direct answer
   - 1-3 lines: simple explanation
   - 1 line: quick example
   - 1 line: exam tip
6) Use simple, age-appropriate language.
7) If needed, use everyday examples relevant to India/Maharashtra.
8) If student asks outside chapter scope, answer briefly and then connect back to chapter when useful.
9) Encourage understanding, not rote memorization only.
10) Output plain text only.
11) Do NOT use markdown formatting symbols like * or **.

${previousMessages ? `Recent Conversation:\n${previousMessages}` : 'This is the start of a new learning session.'}`;
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

// Database types
export interface Student {
  id: number;
  name: string;
  grade: number;
  board: string;
  created_at: string;
}

export interface Session {
  id: number;
  student_id: number;
  topic: string;
  start_time: string;
  end_time: string | null;
}

export interface Message {
  id: number;
  session_id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Answer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface Assessment {
  id: number;
  student_id: number;
  topic: string;
  questions: Question[];
  answers: Answer[];
  score: number;
  total: number;
  timestamp: string;
}

export interface Progress {
  id: number;
  student_id: number;
  topic: string;
  subtopic: string;
  mastery_level: number;
  last_practiced: string;
}

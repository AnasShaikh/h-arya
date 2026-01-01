import db from './connection';
import type { Question, Answer, Assessment } from '../types';

// Student queries
export function createStudent(name: string, grade: number = 7) {
  const stmt = db.prepare('INSERT INTO students (name, grade) VALUES (?, ?)');
  const result = stmt.run(name, grade);
  return result.lastInsertRowid;
}

export function getStudent(id: number) {
  const stmt = db.prepare('SELECT * FROM students WHERE id = ?');
  return stmt.get(id);
}

export function getStudentByName(name: string) {
  const stmt = db.prepare('SELECT * FROM students WHERE name = ?');
  return stmt.get(name);
}

// Session queries
export function createSession(studentId: number, topic: string) {
  const stmt = db.prepare('INSERT INTO sessions (student_id, topic) VALUES (?, ?)');
  const result = stmt.run(studentId, topic);
  return result.lastInsertRowid;
}

export function getSession(id: number) {
  const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
  return stmt.get(id);
}

export function endSession(sessionId: number) {
  const stmt = db.prepare('UPDATE sessions SET end_time = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(sessionId);
}

export function getStudentSessions(studentId: number) {
  const stmt = db.prepare('SELECT * FROM sessions WHERE student_id = ? ORDER BY start_time DESC');
  return stmt.all(studentId);
}

// Message queries
export function createMessage(sessionId: number, role: 'user' | 'assistant', content: string) {
  const stmt = db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)');
  const result = stmt.run(sessionId, role, content);
  return result.lastInsertRowid;
}

export function getSessionMessages(sessionId: number) {
  const stmt = db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC');
  return stmt.all(sessionId);
}

// Assessment queries
export function createAssessment(
  userId: number,
  subject: string,
  chapter: string,
  questions: Question[],
  answers: Answer[],
  score: number,
  total: number
) {
  const stmt = db.prepare(
    'INSERT INTO assessments (user_id, subject, chapter, questions, answers, score, total) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(
    userId,
    subject,
    chapter,
    JSON.stringify(questions),
    JSON.stringify(answers),
    score,
    total
  );
  return result.lastInsertRowid;
}

export function getStudentAssessments(studentId: number): Assessment[] {
  const stmt = db.prepare('SELECT * FROM assessments WHERE student_id = ? ORDER BY timestamp DESC');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = stmt.all(studentId) as any[];
  return results.map(r => ({
    ...r,
    questions: JSON.parse(r.questions as string) as Question[],
    answers: JSON.parse(r.answers as string) as Answer[]
  })) as Assessment[];
}

// Progress queries
export function updateProgress(
  studentId: number,
  topic: string,
  subtopic: string,
  masteryLevel: number
) {
  const stmt = db.prepare(`
    INSERT INTO progress (student_id, topic, subtopic, mastery_level)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(student_id, topic, subtopic) 
    DO UPDATE SET mastery_level = ?, last_practiced = CURRENT_TIMESTAMP
  `);
  stmt.run(studentId, topic, subtopic, masteryLevel, masteryLevel);
}

export function getStudentProgress(studentId: number) {
  const stmt = db.prepare('SELECT * FROM progress WHERE student_id = ? ORDER BY last_practiced DESC');
  return stmt.all(studentId);
}

export function getTopicProgress(studentId: number, topic: string) {
  const stmt = db.prepare('SELECT * FROM progress WHERE student_id = ? AND topic = ?');
  return stmt.all(studentId, topic);
}

import prisma from './prisma';
import type { Question, Answer } from '../types';

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function createSession(userId: number, subject: string, chapter: string) {
  const session = await prisma.session.create({ data: { userId, subject, chapter } });
  return session.id;
}

export async function getSession(id: number) {
  return prisma.session.findUnique({ where: { id } });
}

export async function endSession(sessionId: number) {
  await prisma.session.update({ where: { id: sessionId }, data: { endTime: new Date() } });
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function createMessage(sessionId: number, role: 'user' | 'assistant', content: string) {
  const msg = await prisma.message.create({ data: { sessionId, role, content } });
  return msg.id;
}

export async function getSessionMessages(sessionId: number) {
  return prisma.message.findMany({
    where: { sessionId },
    orderBy: { timestamp: 'asc' },
  });
}

// ── Assessments ───────────────────────────────────────────────────────────────

export async function createAssessment(
  userId: number,
  subject: string,
  chapter: string,
  questions: Question[],
  answers: Answer[],
  score: number,
  total: number,
) {
  const assessment = await prisma.assessment.create({
    data: { userId, subject, chapter, questions, answers, score, total },
  });
  return assessment.id;
}

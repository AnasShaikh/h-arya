import prisma from './prisma';
import bcrypt from 'bcryptjs';

// ── User authentication ──────────────────────────────────────────────────────

export async function createUser(username: string, email: string, password: string, name: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, email, passwordHash, name },
  });
  return user.id;
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { username } });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({ where: { id } });
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function updateLastLogin(userId: number) {
  await prisma.user.update({
    where: { id: userId },
    data: { lastLogin: new Date() },
  });
}

// ── Password reset ────────────────────────────────────────────────────────────

export async function createPasswordResetToken(userId: number): Promise<string> {
  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 3_600_000); // 1 hour
  await prisma.passwordResetToken.create({ data: { userId, token, expiresAt } });
  return token;
}

export async function getPasswordResetToken(token: string) {
  return prisma.passwordResetToken.findFirst({
    where: { token, used: false, expiresAt: { gt: new Date() } },
  });
}

export async function markTokenAsUsed(token: string) {
  await prisma.passwordResetToken.update({ where: { token }, data: { used: true } });
}

export async function updateUserPassword(userId: number, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

// ── Curriculum ────────────────────────────────────────────────────────────────

export async function getAllSubjects() {
  const rows = await prisma.curriculum.findMany({
    select: { subject: true },
    distinct: ['subject'],
    orderBy: { subject: 'asc' },
  });
  return rows.map(r => r.subject);
}

export async function getChaptersBySubject(subject: string) {
  return prisma.curriculum.findMany({
    where: { subject },
    orderBy: { chapterNumber: 'asc' },
  });
}

export async function getChapterById(id: number) {
  return prisma.curriculum.findUnique({ where: { id } });
}

// ── Progress ──────────────────────────────────────────────────────────────────

export async function getUserProgress(userId: number) {
  return prisma.progress.findMany({
    where: { userId },
    orderBy: { lastPracticed: 'desc' },
  });
}

export async function getChapterProgress(userId: number, subject: string, chapter: string) {
  return prisma.progress.findUnique({
    where: { userId_subject_chapter: { userId, subject, chapter } },
  });
}

export async function updateChapterProgress(
  userId: number,
  subject: string,
  chapter: string,
  status: 'not_started' | 'in_progress' | 'completed',
  masteryLevel?: number,
) {
  await prisma.progress.upsert({
    where: { userId_subject_chapter: { userId, subject, chapter } },
    update: { status, masteryLevel: masteryLevel ?? 0, lastPracticed: new Date() },
    create: { userId, subject, chapter, status, masteryLevel: masteryLevel ?? 0 },
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateResetToken(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

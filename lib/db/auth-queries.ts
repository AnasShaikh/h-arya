import db from './connection';
import bcrypt from 'bcryptjs';

// User authentication queries
export function createUser(
  username: string,
  email: string,
  password: string,
  name: string
) {
  const passwordHash = bcrypt.hashSync(password, 10);
  const stmt = db.prepare(
    'INSERT INTO users (username, email, password_hash, name) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(username, email, passwordHash, name);
  return result.lastInsertRowid;
}

export function getUserByUsername(username: string) {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username);
}

export function getUserByEmail(email: string) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

export function getUserById(id: number) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function updateLastLogin(userId: number) {
  const stmt = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(userId);
}

// Password reset queries
export function createPasswordResetToken(userId: number): string {
  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour
  
  const stmt = db.prepare(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)'
  );
  stmt.run(userId, token, expiresAt);
  
  return token;
}

export function getPasswordResetToken(token: string) {
  const stmt = db.prepare(
    'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > datetime("now")'
  );
  return stmt.get(token);
}

export function markTokenAsUsed(token: string) {
  const stmt = db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?');
  stmt.run(token);
}

export function updateUserPassword(userId: number, newPassword: string) {
  const passwordHash = bcrypt.hashSync(newPassword, 10);
  const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
  stmt.run(passwordHash, userId);
}

// Curriculum queries
export function getAllSubjects() {
  const stmt = db.prepare('SELECT DISTINCT subject FROM curriculum ORDER BY subject');
  return stmt.all();
}

export function getChaptersBySubject(subject: string) {
  const stmt = db.prepare(
    'SELECT * FROM curriculum WHERE subject = ? ORDER BY chapter_number'
  );
  return stmt.all(subject);
}

export function getChapterById(id: number) {
  const stmt = db.prepare('SELECT * FROM curriculum WHERE id = ?');
  return stmt.get(id);
}

// Progress queries for new schema
export function getUserProgress(userId: number) {
  const stmt = db.prepare(
    `SELECT p.*, c.chapter_name, c.description 
     FROM progress p 
     JOIN curriculum c ON p.subject = c.subject AND p.chapter = c.chapter_name
     WHERE p.user_id = ? 
     ORDER BY p.last_practiced DESC`
  );
  return stmt.all(userId);
}

export function getChapterProgress(userId: number, subject: string, chapter: string) {
  const stmt = db.prepare(
    'SELECT * FROM progress WHERE user_id = ? AND subject = ? AND chapter = ?'
  );
  return stmt.get(userId, subject, chapter);
}

export function updateChapterProgress(
  userId: number,
  subject: string,
  chapter: string,
  status: 'not_started' | 'in_progress' | 'completed',
  masteryLevel?: number
) {
  const stmt = db.prepare(`
    INSERT INTO progress (user_id, subject, chapter, status, mastery_level)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, subject, chapter)
    DO UPDATE SET status = ?, mastery_level = ?, last_practiced = CURRENT_TIMESTAMP
  `);
  stmt.run(userId, subject, chapter, status, masteryLevel || 0, status, masteryLevel || 0);
}

// Helper function to generate reset token
function generateResetToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

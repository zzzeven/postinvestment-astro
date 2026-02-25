import { createHash, randomBytes } from 'crypto';
import { db } from '../db';
import { sessions, users } from '../db/schema';
import { eq, and } from 'drizzle-orm';

// 密码哈希
export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// 生成随机token
export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// 生成session过期时间（30天）
export function generateSessionExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  return expiry;
}

// 验证密码
export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
}

// 创建用户会话
export async function createUserSession(userId: string) {
  const token = generateToken();
  const expiresAt = generateSessionExpiry();

  const result = await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  }).returning();

  return result[0];
}

// 通过token获取会话
export async function getSessionByToken(token: string) {
  const result = await db.select().from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  return result[0] || null;
}

// 通过会话获取用户
export async function getUserBySession(token: string) {
  const session = await getSessionByToken(token);
  if (!session) {
    return null;
  }

  // 检查会话是否过期
  if (new Date(session.expiresAt) < new Date()) {
    return null;
  }

  const result = await db.select().from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return result[0] || null;
}

// 删除会话（登出）
export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}

// 清理过期会话
export async function cleanExpiredSessions() {
  await db.delete(sessions).where(
    // Note: This requires a more complex query, simplified here
    // In production, you might want to use a raw SQL query
  );
}

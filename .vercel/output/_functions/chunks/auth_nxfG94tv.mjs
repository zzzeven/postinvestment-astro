import { createHash, randomBytes } from 'crypto';
import { d as db, u as users, s as sessions } from './index_B-AYb3H8.mjs';
import { eq } from 'drizzle-orm';

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}
function generateToken() {
  return randomBytes(32).toString("hex");
}
function generateSessionExpiry() {
  const expiry = /* @__PURE__ */ new Date();
  expiry.setDate(expiry.getDate() + 30);
  return expiry;
}
async function getSessionByToken(token) {
  const result = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  return result[0] || null;
}
async function getUserBySession(token) {
  const session = await getSessionByToken(token);
  if (!session) {
    return null;
  }
  if (new Date(session.expiresAt) < /* @__PURE__ */ new Date()) {
    return null;
  }
  const result = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  return result[0] || null;
}

export { generateToken as a, generateSessionExpiry as b, getUserBySession as g, hashPassword as h };

import crypto from "crypto";
import { sql } from "@/utils/db";

const SESSION_COOKIE_NAME = "session";
const SESSION_SECRET =
  process.env.SESSION_SECRET || "";
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function base64UrlDecode(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function sign(value) {
  if (SESSION_SECRET.length < 32) throw new Error("SESSION_SECRET deve ter ao menos 32 caracteres.");
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(value)
    .digest("base64url");
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function generateSessionToken(user) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: Date.now(),
  };

  const encodedPayload = base64UrlEncode(payload);
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token) {
  try {
    if (!token || typeof token !== "string") {
      return null;
    }

    const [encodedPayload, signature] = token.split(".");

    if (!encodedPayload || !signature) {
      return null;
    }

    const expectedSignature = sign(encodedPayload);

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const session = base64UrlDecode(encodedPayload);

    if (
      !session?.id ||
      !session?.createdAt ||
      Date.now() - session.createdAt > SESSION_MAX_AGE_MS
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function getSessionFromCookies(cookiesStore) {
  const token = cookiesStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function getCurrentUser(request) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return null;
  }

  const rows = await sql`
    SELECT id, name, email, role, active
    FROM users
    WHERE id = ${session.id}
    LIMIT 1
  `;

  const user = rows[0];
  return user?.active ? user : null;
}

export async function ensureAdmin(request) {
  const user = await getCurrentUser(request);
  return user?.role === "admin" ? user : null;
}

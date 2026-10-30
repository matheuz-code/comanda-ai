import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE = "comanda_ai_session";
const SESSION_SECRET =
  process.env.SESSION_SECRET || "";

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  value = value.replace(/-/g, "+").replace(/_/g, "/");
  while (value.length % 4) value += "=";
  return Buffer.from(value, "base64").toString("utf-8");
}

function sign(data) {
  if (SESSION_SECRET.length < 32) throw new Error("SESSION_SECRET deve ter ao menos 32 caracteres.");
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("hex");
}

export function createSessionToken(payload) {
  const json = JSON.stringify(payload);
  const encoded = base64UrlEncode(json);
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token) {
  try {
    if (!token || !token.includes(".")) return null;

    const [encoded, signature] = token.split(".");
    const expectedSignature = sign(encoded);

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(base64UrlDecode(encoded));

    if (!payload?.email || !payload?.role) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function setSession(sessionData) {
  const cookieStore = await cookies();
  const token = createSessionToken(sessionData);

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + SESSION_SECRET)
    .digest("hex");
}

export function comparePassword(password, hashedPassword) {
  return hashPassword(password) === hashedPassword;
}

export const AUTH_COOKIE_NAME = SESSION_COOKIE;
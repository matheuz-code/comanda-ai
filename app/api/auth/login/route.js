import { NextResponse } from "next/server";
import { sql } from "@/utils/db";
import bcrypt from "bcryptjs";
import { generateSessionToken } from "@/utils/auth";

export async function POST(request) {
  try {
    const body = await request.json();

    const email = body.email?.trim();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { message: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const users = await sql`
      SELECT id, name, email, password_hash, role, active
      FROM users
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `;

    const user = users[0];

    if (!user || !user.active) {
      return NextResponse.json(
        { message: "Usuário ou senha inválidos." },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return NextResponse.json(
        { message: "Usuário ou senha inválidos." },
        { status: 401 }
      );
    }

    const token = generateSessionToken(user);

    const redirectTo = user.role === "admin" ? "/admin" : "/cozinha";

    const response = NextResponse.json({
      message: "Login realizado com sucesso.",
      redirectTo,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Erro no login:", error);

    return NextResponse.json(
      {
        message: "Erro ao realizar login.",

      },
      { status: 500 }
    );
  }
}

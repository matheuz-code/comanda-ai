import { NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/auth";

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar sessão:", error);

    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500 }
    );
  }
}

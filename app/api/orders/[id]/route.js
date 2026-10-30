import { getCurrentUser } from "@/utils/auth";
import { NextResponse } from "next/server";
import { sql } from "../../../../utils/db";

function safeParseItems(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (value && typeof value === "object") {
    return value;
  }

  return [];
}

function mapOrder(row) {
  return {
    id: String(row.id),
    table: row.table_name || "",
    items: safeParseItems(row.items),
    status: row.status || "novo",
    total: Number(row.total || 0),
    createdAt: row.created_at || null,
  };
}

export async function PATCH(request, context) {
  try {
    const user = await getCurrentUser(request);
    if (!user || !["admin", "funcionario"].includes(user.role)) {
      return NextResponse.json({ message: "Acesso negado." }, { status: 401 });
    }
    const resolvedParams = await context.params;
    const orderId = String(resolvedParams?.id || "").trim();

    const body = await request.json();
    const status = String(body?.status || "").trim();

    if (!orderId) {
      return NextResponse.json(
        { message: "ID do pedido é obrigatório." },
        { status: 400 }
      );
    }

    if (!["novo", "preparo", "pronto"].includes(status)) {
      return NextResponse.json(
        { message: "Status é obrigatório." },
        { status: 400 }
      );
    }

    const rows = await sql`
      UPDATE orders
      SET status = ${status}
      WHERE id = ${orderId}
      RETURNING id, table_name, items, status, total, created_at
    `;

    if (!rows.length) {
      return NextResponse.json(
        { message: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Pedido atualizado com sucesso.",
      order: mapOrder(rows[0]),
    });
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);

    return NextResponse.json(
      {
        message: "Erro ao atualizar pedido.",

      },
      { status: 500 }
    );
  }
}

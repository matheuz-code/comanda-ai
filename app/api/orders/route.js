import { NextResponse } from "next/server";
import { sql } from "@/utils/db";

import { getCurrentUser } from "@/utils/auth";
import { validateOrder } from "@/utils/order-validation.mjs";

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || !["admin", "funcionario"].includes(user.role)) {
      return NextResponse.json({ message: "Acesso negado." }, { status: 401 });
    }
    const orders = await sql`
      SELECT
        id,
        table_number,
        table_name,
        items,
        status,
        total,
        created_at
      FROM orders
      ORDER BY created_at DESC, id DESC
    `;

    const normalizedOrders = orders.map((order) => ({
      id: order.id,
      table_number: order.table_number ?? order.table_name ?? "",
      table_name: order.table_name ?? order.table_number ?? "",
      items: Array.isArray(order.items) ? order.items : [],
      status: order.status ?? "novo",
      total: Number(order.total ?? 0),
      created_at: order.created_at,
    }));

    return NextResponse.json(normalizedOrders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);

    return NextResponse.json(
      {
        message: "Erro ao buscar pedidos.",

      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const rawTable =
      body?.table_number ??
      body?.tableName ??
      body?.table_name ??
      body?.mesa ??
      "";

    const table = String(rawTable).trim();

    if (!table || table.length > 80) {
      return NextResponse.json(
        { message: "Mesa é obrigatória." },
        { status: 400 }
      );
    }

    const catalog = await sql`SELECT id, name, price, active FROM menu_items WHERE active = TRUE`;
    let validated;
    try {
      validated = validateOrder(body?.items, catalog);
    } catch (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    const normalizedItems = validated.items;
    const total = validated.total;
    const id = Date.now();

    await sql`
      INSERT INTO orders (
        id,
        table_number,
        table_name,
        items,
        status,
        total,
        created_at
      )
      VALUES (
        ${id},
        ${table},
        ${table},
        ${JSON.stringify(normalizedItems)},
        ${"novo"},
        ${total},
        NOW()
      )
    `;

    return NextResponse.json({
      message: "Pedido confirmado com sucesso.",
      order: {
        id,
        table_number: table,
        table_name: table,
        items: normalizedItems,
        status: "novo",
        total,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);

    return NextResponse.json(
      {
        message: "Erro ao confirmar pedido.",

      },
      { status: 500 }
    );
  }
}

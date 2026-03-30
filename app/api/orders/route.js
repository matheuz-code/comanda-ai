import { NextResponse } from "next/server";
import { sql } from "../../../utils/db";

function calculateOrderTotal(items = []) {
  return Number(
    items.reduce((sum, item) => sum + Number(item.total || 0), 0).toFixed(2)
  );
}

export async function GET() {
  try {
    const rows = await sql`
      SELECT
        id,
        table_name,
        status,
        total,
        created_at,
        items
      FROM orders
      ORDER BY created_at DESC
    `;

    const orders = rows.map((row) => ({
      id: Number(row.id),
      table: row.table_name,
      status: row.status,
      total: Number(row.total),
      createdAt: row.created_at,
      items: row.items,
    }));

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);

    return NextResponse.json(
      { message: "Erro ao buscar pedidos." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { table, items } = body;

    if (!table || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Mesa e itens do pedido são obrigatórios." },
        { status: 400 }
      );
    }

    const newOrder = {
      id: Date.now(),
      table,
      status: "novo",
      total: calculateOrderTotal(items),
      createdAt: new Date().toISOString(),
      items,
    };

    await sql`
      INSERT INTO orders (
        id,
        table_name,
        status,
        total,
        created_at,
        items
      ) VALUES (
        ${newOrder.id},
        ${newOrder.table},
        ${newOrder.status},
        ${newOrder.total},
        ${newOrder.createdAt},
        ${JSON.stringify(newOrder.items)}
      )
    `;

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);

    return NextResponse.json(
      { message: "Erro ao criar pedido." },
      { status: 500 }
    );
  }
}
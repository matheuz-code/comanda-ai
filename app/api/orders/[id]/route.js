import { NextResponse } from "next/server";
import { sql } from "../../../../utils/db";

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    const allowedStatus = ["novo", "preparo", "pronto"];

    if (!allowedStatus.includes(status)) {
      return NextResponse.json(
        { message: "Status inválido." },
        { status: 400 }
      );
    }

    const updatedRows = await sql`
      UPDATE orders
      SET status = ${status}
      WHERE id = ${id}
      RETURNING
        id,
        table_name,
        status,
        total,
        created_at,
        items
    `;

    if (!updatedRows.length) {
      return NextResponse.json(
        { message: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    const row = updatedRows[0];

    const updatedOrder = {
      id: Number(row.id),
      table: row.table_name,
      status: row.status,
      total: Number(row.total),
      createdAt: row.created_at,
      items: row.items,
    };

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);

    return NextResponse.json(
      { message: "Erro ao atualizar pedido." },
      { status: 500 }
    );
  }
}
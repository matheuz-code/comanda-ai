import { NextResponse } from "next/server";
import { sql } from "@/utils/db";
import { ensureAdmin } from "@/utils/auth";

export async function GET(_, context) {
  try {
    const { id } = await context.params;

    const rows = await sql`
      SELECT
        id,
        name,
        category,
        description,
        price,
        active,
        created_at
      FROM menu_items
      WHERE id = ${id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Item do cardápio não encontrado." },
        { status: 404 }
      );
    }

    const item = rows[0];

    return NextResponse.json({
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description,
      price: Number(item.price),
      active: Boolean(item.active),
      createdAt: item.created_at,
    });
  } catch (error) {
    console.error("Erro ao buscar item do cardápio:", error);

    return NextResponse.json(
      {
        message: "Erro ao buscar item do cardápio.",

      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, context) {
  try {
    const admin = await ensureAdmin(request);

    if (!admin) {
      return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const currentRows = await sql`
      SELECT *
      FROM menu_items
      WHERE id = ${id}
      LIMIT 1
    `;

    if (currentRows.length === 0) {
      return NextResponse.json(
        { message: "Item do cardápio não encontrado." },
        { status: 404 }
      );
    }

    const current = currentRows[0];

    const name =
      body.name !== undefined ? String(body.name).trim() : current.name;

    const category =
      body.category !== undefined
        ? String(body.category).trim()
        : current.category;

    const description =
      body.description !== undefined
        ? String(body.description).trim()
        : current.description;

    const price =
      body.price !== undefined ? Number(body.price) : Number(current.price);

    const active =
      body.active !== undefined ? Boolean(body.active) : Boolean(current.active);

    if (!name || !category || !description || Number.isNaN(price)) {
      return NextResponse.json(
        { message: "Dados inválidos para atualização." },
        { status: 400 }
      );
    }

    const updated = await sql`
      UPDATE menu_items
      SET
        name = ${name},
        category = ${category},
        description = ${description},
        price = ${price},
        active = ${active}
      WHERE id = ${id}
      RETURNING
        id,
        name,
        category,
        description,
        price,
        active,
        created_at
    `;

    const item = updated[0];

    return NextResponse.json({
      message: "Item atualizado com sucesso.",
      item: {
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        price: Number(item.price),
        active: Boolean(item.active),
        createdAt: item.created_at,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar item do cardápio:", error);

    return NextResponse.json(
      {
        message: "Erro ao atualizar item do cardápio.",

      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const admin = await ensureAdmin(request);

    if (!admin) {
      return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
    }

    const { id } = await context.params;

    const deleted = await sql`
      DELETE FROM menu_items
      WHERE id = ${id}
      RETURNING id
    `;

    if (deleted.length === 0) {
      return NextResponse.json(
        { message: "Item do cardápio não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Item removido com sucesso.",
      id,
    });
  } catch (error) {
    console.error("Erro ao remover item do cardápio:", error);

    return NextResponse.json(
      {
        message: "Erro ao remover item do cardápio.",

      },
      { status: 500 }
    );
  }
}

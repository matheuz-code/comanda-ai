import { NextResponse } from "next/server";
import { sql } from "@/utils/db";
import { ensureAdmin, getCurrentUser } from "@/utils/auth";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode");
    const forcePublic = mode === "public";

    let items;

    if (forcePublic) {
      items = await sql`
        SELECT id, name, category, description, price, active, created_at
        FROM menu_items
        WHERE active = TRUE
        ORDER BY category ASC, name ASC
      `;
    } else {
      const user = await getCurrentUser(request);
      const isAdmin = user?.role === "admin";

      if (isAdmin) {
        items = await sql`
          SELECT id, name, category, description, price, active, created_at
          FROM menu_items
          ORDER BY category ASC, name ASC
        `;
      } else {
        items = await sql`
          SELECT id, name, category, description, price, active, created_at
          FROM menu_items
          WHERE active = TRUE
          ORDER BY category ASC, name ASC
        `;
      }
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error("Erro ao buscar cardápio:", error);

    return NextResponse.json(
      {
        message: "Erro ao buscar cardápio.",

      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = await ensureAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { message: "Acesso negado." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const id = String(body?.id || "").trim();
    const name = String(body?.name || "").trim();
    const category = String(body?.category || "").trim();
    const description = String(body?.description || "").trim();
    const price = Number(body?.price);
    const active = Boolean(body?.active);

    if (!id || !name || !category || !description || Number.isNaN(price)) {
      return NextResponse.json(
        { message: "Preencha todos os campos obrigatórios do item." },
        { status: 400 }
      );
    }

    const existing = await sql`
      SELECT id
      FROM menu_items
      WHERE id = ${id}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Já existe um item com esse ID." },
        { status: 409 }
      );
    }

    const inserted = await sql`
      INSERT INTO menu_items (id, name, category, description, price, active)
      VALUES (${id}, ${name}, ${category}, ${description}, ${price}, ${active})
      RETURNING id, name, category, description, price, active, created_at
    `;

    return NextResponse.json(
      {
        message: "Item cadastrado com sucesso.",
        item: inserted[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao cadastrar item do cardápio:", error);

    return NextResponse.json(
      {
        message: "Erro ao cadastrar item do cardápio.",

      },
      { status: 500 }
    );
  }
}

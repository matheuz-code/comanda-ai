import { NextResponse } from "next/server";
import { sql } from "../../../utils/db";

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT PRIMARY KEY,
        table_name TEXT NOT NULL,
        status TEXT NOT NULL,
        total NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        items JSONB NOT NULL
      );
    `;

    return NextResponse.json(
      { message: "Tabela orders criada com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao criar tabela:", error);

    return NextResponse.json(
      { message: "Erro ao criar tabela." },
      { status: 500 }
    );
  }
}
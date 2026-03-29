import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const ordersFilePath = path.join(process.cwd(), "data", "orders.json");

async function readOrdersFile() {
  try {
    const fileContent = await fs.readFile(ordersFilePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeOrdersFile(orders) {
  await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), "utf-8");
}

function calculateOrderTotal(items = []) {
  return Number(
    items.reduce((sum, item) => sum + Number(item.total || 0), 0).toFixed(2)
  );
}

export async function GET() {
  try {
    const orders = await readOrdersFile();

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

    const orders = await readOrdersFile();

    const newOrder = {
      id: Date.now(),
      table,
      status: "novo",
      total: calculateOrderTotal(items),
      createdAt: new Date().toISOString(),
      items,
    };

    const updatedOrders = [newOrder, ...orders];

    await writeOrdersFile(updatedOrders);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);

    return NextResponse.json(
      { message: "Erro ao criar pedido." },
      { status: 500 }
    );
  }
}
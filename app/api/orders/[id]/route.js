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

    const orders = await readOrdersFile();

    const orderIndex = orders.findIndex(
      (order) => String(order.id) === String(id)
    );

    if (orderIndex === -1) {
      return NextResponse.json(
        { message: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      status,
    };

    await writeOrdersFile(orders);

    return NextResponse.json(orders[orderIndex], { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);

    return NextResponse.json(
      { message: "Erro ao atualizar pedido." },
      { status: 500 }
    );
  }
}
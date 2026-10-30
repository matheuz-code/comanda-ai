import { NextResponse } from "next/server";
import { sql } from "@/utils/db";

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildAliases(item) {
  const aliases = new Set();

  const name = String(item.name || "");
  const id = String(item.id || "");

  aliases.add(normalizeText(name));
  aliases.add(normalizeText(id));
  aliases.add(slugify(name).replace(/-/g, " "));
  aliases.add(slugify(id).replace(/-/g, " "));

  const baseName = normalizeText(name)
    .replace(/\bx\b/g, "x ")
    .replace(/\s+/g, " ")
    .trim();

  aliases.add(baseName);

  if (baseName.endsWith("s")) {
    aliases.add(baseName.slice(0, -1));
  } else {
    aliases.add(`${baseName}s`);
  }

  if (baseName.includes("x ")) {
    aliases.add(baseName.replace("x ", "x-"));
    aliases.add(baseName.replace("x ", "x"));
  }

  return Array.from(aliases).filter(Boolean);
}

function findMenuItemInText(text, menuItems) {
  const normalizedText = normalizeText(text);

  let bestMatch = null;

  for (const item of menuItems) {
    const aliases = buildAliases(item);

    for (const alias of aliases) {
      if (!alias) continue;

      if (normalizedText.includes(alias)) {
        if (!bestMatch || alias.length > bestMatch.alias.length) {
          bestMatch = { item, alias };
        }
      }
    }
  }

  return bestMatch?.item || null;
}

function extractQuantity(text) {
  const normalizedText = normalizeText(text);

  const patterns = [
    /(\d+)\s*x\b/,
    /(\d+)\s*x-/,
    /(\d+)\s+unidades?\b/,
    /(\d+)\s+un\b/,
    /(\d+)\s+unidade\b/,
    /(\d+)\b/,
  ];

  for (const pattern of patterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const quantity = Number(match[1]);
      if (Number.isFinite(quantity) && quantity > 0) {
        return quantity;
      }
    }
  }

  return 1;
}

function fallbackInterpret(texto, menuItems) {
  const rawParts = String(texto || "")
    .split(/,| e /gi)
    .map((part) => part.trim())
    .filter(Boolean);

  const parts = rawParts.length > 0 ? rawParts : [String(texto || "").trim()].filter(Boolean);

  const interpretedItems = [];

  for (const part of parts) {
    const menuItem = findMenuItemInText(part, menuItems);

    if (!menuItem) {
      continue;
    }

    const quantity = extractQuantity(part);

    interpretedItems.push({
      id: menuItem.id,
      name: menuItem.name,
      category: menuItem.category,
      description: menuItem.description,
      price: Number(menuItem.price),
      quantity,
      notes: "",
    });
  }

  return interpretedItems;
}

function mergeItems(items) {
  const grouped = new Map();

  for (const item of items) {
    const key = String(item.id);

    if (!grouped.has(key)) {
      grouped.set(key, {
        ...item,
        quantity: Number(item.quantity || 1),
      });
      continue;
    }

    const current = grouped.get(key);
    current.quantity += Number(item.quantity || 1);
  }

  return Array.from(grouped.values());
}

export async function POST(request) {
  try {
    const body = await request.json();
    const texto = String(body?.text || "").trim();

    if (!texto) {
      return NextResponse.json(
        { message: "Texto do pedido é obrigatório." },
        { status: 400 }
      );
    }

    const menuItems = await sql`
      SELECT id, name, category, description, price, active
      FROM menu_items
      WHERE active = TRUE
      ORDER BY created_at ASC
    `;

    const interpretedItems = mergeItems(fallbackInterpret(texto, menuItems));

    if (interpretedItems.length === 0) {
      return NextResponse.json({
        message:
          "Não consegui identificar itens válidos do cardápio nesse texto. Tente citar o nome do item como está no cardápio.",
        items: [],
        source: "fallback",
      });
    }

    return NextResponse.json({
      message: "Pedido interpretado com sucesso.",
      items: interpretedItems,
      source: "fallback",
    });
  } catch (error) {
    console.error("Erro ao interpretar pedido:", error);

    return NextResponse.json(
      {
        message: "Erro ao interpretar pedido.",

      },
      { status: 500 }
    );
  }
}

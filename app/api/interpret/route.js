import { NextResponse } from "next/server";
import { menuItems } from "../../../data/mockData";
import { interpretOrderWithGemini } from "../../../utils/gemini";

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildAliases(item) {
  const base = normalizeText(item.name);
  const aliases = new Set([base]);

  if (base.includes("x-bacon")) {
    aliases.add("xbacon");
    aliases.add("x bacon");
    aliases.add("x-bacon");
  }

  if (base.includes("x-salada")) {
    aliases.add("xsalada");
    aliases.add("x salada");
    aliases.add("x-salada");
  }

  if (base.includes("batata frita m")) {
    aliases.add("batata frita m");
    aliases.add("batata media");
    aliases.add("batata média");
    aliases.add("frita m");
  }

  if (base.includes("coca-cola zero")) {
    aliases.add("coca cola zero");
    aliases.add("coca zero");
    aliases.add("coca-cola zero");
  }

  if (base.includes("milk-shake chocolate")) {
    aliases.add("milk shake chocolate");
    aliases.add("milkshake chocolate");
    aliases.add("shake chocolate");
  }

  if (base.includes("brownie")) {
    aliases.add("brownie");
  }

  return Array.from(aliases);
}

function extractQuantity(segment) {
  const numberMatch = segment.match(/\b(\d+)\b/);
  return numberMatch ? Number(numberMatch[1]) : 1;
}

function parseNotes(text) {
  const normalized = normalizeText(text);
  const notes = [];

  if (
    normalized.includes("sem cebola") ||
    normalized.includes("tirar cebola") ||
    normalized.includes("tira a cebola")
  ) {
    notes.push("Sem cebola");
  }

  if (
    normalized.includes("sem tomate") ||
    normalized.includes("tirar tomate") ||
    normalized.includes("tira o tomate")
  ) {
    notes.push("Sem tomate");
  }

  if (
    normalized.includes("sem gelo") ||
    normalized.includes("tirar gelo") ||
    normalized.includes("sem o gelo")
  ) {
    notes.push("Sem gelo");
  }

  return notes.join(", ");
}

function splitOrderText(text) {
  return String(text || "")
    .split(/,| e |;/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function fallbackInterpret(text) {
  const normalizedFullText = normalizeText(text);
  const segments = splitOrderText(normalizedFullText);
  const foundItems = [];

  for (const item of menuItems) {
    const aliases = buildAliases(item);

    for (const alias of aliases) {
      const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const fullRegex = new RegExp(`(?:\\b(\\d+)\\b\\s*)?${escapedAlias}\\b`, "i");
      const globalRegex = new RegExp(`(?:\\b(\\d+)\\b\\s*)?${escapedAlias}\\b`, "gi");

      const globalMatches = [...normalizedFullText.matchAll(globalRegex)];

      if (globalMatches.length > 0) {
        let totalQuantity = 0;

        for (const match of globalMatches) {
          totalQuantity += match[1] ? Number(match[1]) : 1;
        }

        const notes = parseNotes(normalizedFullText);

        foundItems.push({
          name: item.name,
          quantity: totalQuantity,
          notes,
        });

        break;
      }

      for (const segment of segments) {
        if (fullRegex.test(segment)) {
          const quantity = extractQuantity(segment);
          const notes = parseNotes(segment);

          foundItems.push({
            name: item.name,
            quantity,
            notes,
          });

          break;
        }
      }

      if (foundItems.some((found) => found.name === item.name)) {
        break;
      }
    }
  }

  const merged = new Map();

  for (const item of foundItems) {
    const key = `${item.name}::${item.notes || ""}`;

    if (!merged.has(key)) {
      merged.set(key, { ...item });
      continue;
    }

    const existing = merged.get(key);
    existing.quantity += item.quantity;
    merged.set(key, existing);
  }

  return Array.from(merged.values()).filter((item) => item.quantity > 0);
}

function validateItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const matchedMenuItem = menuItems.find(
        (menuItem) => normalizeText(menuItem.name) === normalizeText(item?.name)
      );

      if (!matchedMenuItem) return null;

      return {
        name: matchedMenuItem.name,
        quantity: Math.max(1, Number(item?.quantity || 1)),
        notes: String(item?.notes || "").trim(),
      };
    })
    .filter(Boolean);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const text = String(body?.text || "").trim();

    if (!text) {
      return NextResponse.json(
        { error: "Texto do pedido não informado." },
        { status: 400 }
      );
    }

    let items = [];

    try {
      const geminiItems = await interpretOrderWithGemini(text, menuItems);
      items = validateItems(geminiItems);
    } catch (error) {
      console.error("Erro Gemini, usando fallback:", error);
    }

    if (!items.length) {
      items = fallbackInterpret(text);
    }

    if (!items.length) {
      return NextResponse.json({
        items: [],
        message: "Não temos essa opção no cardápio ou não consegui entender o pedido.",
        source: "fallback",
      });
    }

    return NextResponse.json({
      items,
      message: "Pedido interpretado com sucesso.",
      source: items.length ? "gemini-or-fallback" : "fallback",
    });
  } catch (error) {
    console.error("Erro ao interpretar pedido:", error);

    return NextResponse.json(
      { error: "Não foi possível interpretar o pedido." },
      { status: 500 }
    );
  }
}
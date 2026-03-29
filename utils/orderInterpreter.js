function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function numberFromWord(word) {
  const map = {
    um: 1,
    uma: 1,
    dois: 2,
    duas: 2,
    tres: 3,
    três: 3,
    quatro: 4,
    cinco: 5,
    seis: 6,
  };

  return map[normalizeText(word)] || null;
}

function detectQuantity(text, alias) {
  const escapedAlias = escapeRegex(alias);

  const patterns = [
    new RegExp(`(\\d+)\\s*x?\\s*${escapedAlias}`, "i"),
    new RegExp(`\\b(um|uma|dois|duas|tres|três|quatro|cinco|seis)\\b\\s+${escapedAlias}`, "i"),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      const rawValue = match[1];
      const numeric = Number(rawValue);

      if (!Number.isNaN(numeric) && numeric > 0) {
        return numeric;
      }

      const fromWord = numberFromWord(rawValue);
      if (fromWord) return fromWord;
    }
  }

  return 1;
}

function detectNotes(text, itemName) {
  const lower = normalizeText(text);
  const name = normalizeText(itemName);
  const notes = [];

  const itemBlockPattern = new RegExp(`${escapeRegex(name)}([\\s\\S]{0,60})`, "i");
  const blockMatch = lower.match(itemBlockPattern);
  const block = blockMatch ? blockMatch[0] : lower;

  if (block.includes("sem cebola")) notes.push("sem cebola");
  if (block.includes("sem gelo")) notes.push("sem gelo");
  if (block.includes("bem crocante")) notes.push("bem crocante");
  if (block.includes("tirar a cebola")) notes.push("sem cebola");
  if (block.includes("sem molho")) notes.push("sem molho");
  if (block.includes("sem queijo")) notes.push("sem queijo");

  return [...new Set(notes)].join(" • ");
}

function getAliases(item) {
  const name = item.name || "";
  const normalized = normalizeText(name);

  const aliases = [normalized];

  if (normalized.includes("x-bacon")) aliases.push("xbacon", "x bacon");
  if (normalized.includes("x-salada")) aliases.push("xsalada", "x salada");
  if (normalized.includes("batata frita m")) aliases.push("batata media", "batata média", "batata frita", "batata");
  if (normalized.includes("coca-cola zero")) aliases.push("coca zero", "coca cola zero", "coca");
  if (normalized.includes("milk-shake chocolate")) aliases.push("milk shake", "milk-shake", "milk shake chocolate");
  if (normalized.includes("combo duplo")) aliases.push("combo");

  return [...new Set(aliases)];
}

export function parseOrderText(text, menuItems = []) {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return [];
  }

  const interpretedItems = [];

  menuItems.forEach((item) => {
    const aliases = getAliases(item);
    const foundAlias = aliases.find((alias) => normalizedText.includes(alias));

    if (!foundAlias) return;

    const quantity = detectQuantity(normalizedText, foundAlias);
    const notes = detectNotes(normalizedText, item.name);

    interpretedItems.push({
      id: `${item.id}-${notes || "sem-obs"}`,
      name: item.name,
      quantity,
      notes,
      unitPrice: Number(item.price || 0),
      total: Number((Number(item.price || 0) * quantity).toFixed(2)),
    });
  });

  return interpretedItems;
}
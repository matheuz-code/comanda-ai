import { GoogleGenAI } from "@google/genai";

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function interpretOrderWithGemini(text, menuItems) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não definida.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const menuDescription = menuItems
    .map(
      (item) =>
        `- ${item.name} | categoria: ${item.category} | preço: ${item.price}`
    )
    .join("\n");

  const prompt = `
Você é um interpretador de pedidos de restaurante.

Seu trabalho é ler o texto do cliente e converter SOMENTE para itens reais do cardápio abaixo.

CARDÁPIO:
${menuDescription}

REGRAS:
1. Retorne apenas itens que realmente existam no cardápio.
2. Se o cliente pedir algo que não existe, ignore esse item.
3. Se nada do pedido existir no cardápio, retorne um array vazio.
4. Corrija pequenas variações de escrita, como:
   - xbacon = X-Bacon
   - x salada = X-Salada
   - coca zero = Coca-Cola Zero
5. Cada item deve ter:
   - name
   - quantity
   - notes
6. notes deve ser string, mesmo vazia.
7. Responda APENAS JSON puro, sem markdown, sem explicação, sem crases.

FORMATO EXATO:
[
  {
    "name": "X-Bacon",
    "quantity": 2,
    "notes": "Sem cebola"
  }
]

PEDIDO DO CLIENTE:
${text}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      temperature: 0.1,
    },
  });

  const rawText = String(response?.text || "").trim();

  if (!rawText) {
    return [];
  }

  const cleaned = rawText
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  let parsed;

  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error("Resposta inválida do Gemini:", cleaned);
    throw new Error("O Gemini não retornou JSON válido.");
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((item) => ({
      name: String(item?.name || "").trim(),
      quantity: Math.max(1, Number(item?.quantity || 1)),
      notes: String(item?.notes || "").trim(),
    }))
    .filter((item) => {
      if (!item.name) return false;

      return menuItems.some(
        (menuItem) => normalizeText(menuItem.name) === normalizeText(item.name)
      );
    });
}
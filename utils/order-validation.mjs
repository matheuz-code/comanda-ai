export function validateOrder(items, catalog) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    throw new Error('Informe de 1 a 100 itens.');
  }
  const indexed = new Map(catalog.map(item => [String(item.id), item]));
  const grouped = new Map();
  for (const input of items) {
    if (!input || typeof input !== 'object') throw new Error('Item inválido.');
    const id = String(input.id ?? '');
    const product = indexed.get(id);
    const quantity = Number(input.quantity ?? 1);
    if (!product || product.active === false || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error('Produto ou quantidade inválidos.');
    }
    const cents = Math.round(Number(product.price) * 100);
    if (!Number.isSafeInteger(cents) || cents < 0 || cents > 100000000) throw new Error('Preço de catálogo inválido.');
    const notes = String(input.notes ?? '').trim().slice(0, 500);
    const key = JSON.stringify([id, notes]);
    const count = quantity + (grouped.get(key)?.quantity ?? 0);
    if (count > 99) throw new Error('Quantidade máxima excedida.');
    grouped.set(key, { id, name: product.name, quantity: count, unitPrice: cents / 100, price: cents / 100, notes, total: cents * count / 100 });
  }
  const normalized = [...grouped.values()];
  const total = normalized.reduce((sum, item) => sum + Math.round(item.total * 100), 0) / 100;
  return { items: normalized, total };
}

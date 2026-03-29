"use client";

import { useMemo, useState } from "react";
import MenuCard from "../../components/MenuCard";
import OrderSummary from "../../components/OrderSummary";
import { menuItems } from "../../data/mockData";
import { useOrders } from "../../context/OrderContext";
import { parseOrderText } from "../../utils/orderInterpreter";

const categories = ["Todos", "Hambúrgueres", "Batatas", "Bebidas", "Sobremesas"];

function mergeCartItems(currentItems, incomingItems) {
  const map = new Map();

  [...currentItems, ...incomingItems].forEach((item) => {
    const key = `${item.name}-${item.notes || ""}`;

    if (map.has(key)) {
      const existing = map.get(key);
      const quantity = existing.quantity + item.quantity;
      const total = Number((existing.unitPrice * quantity).toFixed(2));

      map.set(key, {
        ...existing,
        quantity,
        total,
      });
    } else {
      map.set(key, {
        ...item,
        total: Number((item.unitPrice * item.quantity).toFixed(2)),
      });
    }
  });

  return Array.from(map.values());
}

export default function ClientPage() {
  const [table, setTable] = useState("Mesa 9");
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [cartItems, setCartItems] = useState([]);

  const { addConfirmedOrder } = useOrders();

  const filteredItems = useMemo(() => {
    if (activeCategory === "Todos") return menuItems;
    return menuItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const total = useMemo(() => {
    return Number(
      cartItems.reduce((sum, item) => sum + Number(item.total || 0), 0).toFixed(2)
    );
  }, [cartItems]);

  function handleAddItem(item) {
    const normalizedItem = {
      id: `${item.id}-sem-obs`,
      name: item.name,
      quantity: 1,
      notes: "",
      unitPrice: Number(item.price || 0),
      total: Number(item.price || 0),
    };

    setCartItems((prev) => mergeCartItems(prev, [normalizedItem]));
  }

  function handleInterpretOrder() {
    const interpreted = parseOrderText(input, menuItems);

    if (!interpreted.length) {
      window.alert("Não consegui interpretar esse pedido. Tente escrever de outra forma.");
      return;
    }

    setCartItems((prev) => mergeCartItems(prev, interpreted));
    setInput("");
  }

  function handleRemoveItem(itemId) {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  function handleClearCart() {
    setCartItems([]);
  }

  async function handleConfirmOrder() {
    if (!cartItems.length) {
      window.alert("Adicione itens antes de confirmar o pedido.");
      return;
    }

    const result = await addConfirmedOrder({
      table,
      items: cartItems,
    });

    if (!result.success) {
      window.alert("Não foi possível confirmar o pedido.");
      return;
    }

    setCartItems([]);
    setInput("");
    window.alert("Pedido confirmado com sucesso.");
  }

  return (
    <main className="page-shell">
      <div className="page-container">
        <header className="page-header">
          <h1 className="page-title">Cliente • Comanda AI</h1>
          <p className="page-subtitle">
            Monte o pedido pelo cardápio ou escreva naturalmente para a IA interpretar.
          </p>
        </header>

        <div className="client-layout">
          <section className="panel-spacing">
            <div className="glass-card form-panel">
              <div className="form-section">
                <div>
                  <h2 className="section-title">Novo pedido</h2>
                  <p className="section-subtitle">
                    Preencha a mesa, escreva o pedido ou adicione itens manualmente.
                  </p>
                </div>

                <div className="form-divider" />

                <div className="field-group">
                  <label className="field-label" htmlFor="table-number">
                    Número da mesa
                  </label>
                  <input
                    id="table-number"
                    className="field-input"
                    value={table}
                    onChange={(event) => setTable(event.target.value)}
                    placeholder="Ex: Mesa 9"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="order-text">
                    Pedido em linguagem natural
                  </label>
                  <p className="field-help">
                    Exemplo: “quero 2 x-bacon, 1 coca zero e tira a cebola de um deles”.
                  </p>
                  <textarea
                    id="order-text"
                    className="field-textarea"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Escreva aqui o pedido do cliente..."
                  />
                </div>

                <div className="action-row">
                  <button
                    type="button"
                    onClick={handleInterpretOrder}
                    className="btn btn-primary"
                  >
                    Interpretar pedido com IA
                  </button>

                  <button
                    type="button"
                    onClick={() => setInput("")}
                    className="btn btn-secondary"
                  >
                    Limpar texto
                  </button>
                </div>

                <div className="helper-banner">
                  <strong>Dica:</strong> o botão de interpretar soma os itens ao pedido atual. Os itens adicionados aparecem imediatamente no resumo ao lado.
                </div>
              </div>
            </div>

            <div className="section-box glass-card">
              <div className="section-block">
                <div>
                  <h2 className="section-title">Cardápio</h2>
                  <p className="section-subtitle">
                    Escolha uma categoria ou adicione itens diretamente.
                  </p>
                </div>

                <div className="chips-row">
                  {categories.map((category) => {
                    const isActive = activeCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={isActive ? "chip chip-active" : "chip"}
                        aria-pressed={isActive}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="menu-grid">
              {filteredItems.map((item) => (
                <MenuCard key={item.id} item={item} onAdd={handleAddItem} />
              ))}
            </div>
          </section>

          <aside className="sticky-summary">
            <OrderSummary
              items={cartItems}
              total={total}
              onConfirm={handleConfirmOrder}
              onClear={handleClearCart}
              onRemoveItem={handleRemoveItem}
              disabled={!cartItems.length}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
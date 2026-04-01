"use client";

import { useMemo, useState } from "react";
import { menuItems } from "../../data/mockData";

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function mergeCartItem(cart, incomingItem) {
  const existingIndex = cart.findIndex(
    (item) =>
      item.id === incomingItem.id &&
      normalizeText(item.notes) === normalizeText(incomingItem.notes)
  );

  if (existingIndex === -1) {
    return [...cart, incomingItem];
  }

  const updated = [...cart];
  const current = updated[existingIndex];
  const newQuantity = current.quantity + incomingItem.quantity;

  updated[existingIndex] = {
    ...current,
    quantity: newQuantity,
    total: Number(current.price) * newQuantity,
  };

  return updated;
}

export default function ClientPage() {
  const [tableNumber, setTableNumber] = useState("Mesa 9");
  const [orderText, setOrderText] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const categories = useMemo(() => {
    const unique = [...new Set(menuItems.map((item) => item.category))];
    return ["Todos", ...unique];
  }, []);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "Todos") return menuItems;
    return menuItems.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.total || 0), 0);
  }, [cart]);

  function addToCart(menuItem, quantity = 1, notes = "") {
    const safeQuantity = Math.max(1, Number(quantity || 1));

    const cartItem = {
      id: menuItem.id,
      name: menuItem.name,
      category: menuItem.category,
      description: menuItem.description,
      price: Number(menuItem.price),
      quantity: safeQuantity,
      notes: notes || "",
      total: Number(menuItem.price) * safeQuantity,
    };

    setCart((prev) => mergeCartItem(prev, cartItem));
  }

  function handleAddManual(menuItem) {
    addToCart(menuItem, 1, "");
  }

  function handleRemoveItem(itemId, notes = "") {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === itemId &&
            normalizeText(item.notes) === normalizeText(notes)
          )
      )
    );
  }

  function handleClearOrder() {
    setCart([]);
    setOrderText("");
  }

  async function handleInterpretOrder() {
    if (!orderText.trim()) {
      window.alert("Digite um pedido para a IA interpretar.");
      return;
    }

    setIsInterpreting(true);

    try {
      const response = await fetch("/api/interpret", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: orderText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Falha ao interpretar pedido.");
      }

      const interpretedItems = Array.isArray(data?.items) ? data.items : [];

      if (!interpretedItems.length) {
        window.alert(data?.message || "Não temos essa opção no cardápio.");
        return;
      }

      interpretedItems.forEach((item) => {
        const matchedMenuItem = menuItems.find(
          (menuItem) => normalizeText(menuItem.name) === normalizeText(item.name)
        );

        if (matchedMenuItem) {
          addToCart(
            matchedMenuItem,
            Number(item.quantity || 1),
            String(item.notes || "")
          );
        }
      });

      setOrderText("");
    } catch (error) {
      console.error("Erro ao interpretar pedido:", error);
      window.alert("Não foi possível interpretar o pedido com IA.");
    } finally {
      setIsInterpreting(false);
    }
  }

  async function handleConfirmOrder() {
    if (!cart.length) {
      window.alert("Adicione itens ao pedido antes de confirmar.");
      return;
    }

    if (!tableNumber.trim()) {
      window.alert("Informe o número da mesa.");
      return;
    }

    setIsConfirming(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table: tableNumber.trim(),
          status: "novo",
          total,
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            notes: item.notes || "",
            total: Number(item.total),
            quantity: Number(item.quantity),
            unitPrice: Number(item.price),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Falha ao confirmar pedido.");
      }

      window.alert("Pedido confirmado com sucesso.");
      setCart([]);
      setOrderText("");
    } catch (error) {
      console.error("Erro ao confirmar pedido:", error);
      window.alert("Não foi possível confirmar o pedido.");
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-section">
        <h1 className="hero-title">Cliente • Comanda AI</h1>
        <p className="hero-subtitle">
          Monte o pedido pelo cardápio ou escreva naturalmente para a IA interpretar.
        </p>
      </section>

      <section className="client-grid">
        <div className="panel-card">
          <h2 className="panel-title">Novo pedido</h2>
          <p className="panel-subtitle">
            Preencha a mesa, escreva o pedido ou adicione itens manualmente.
          </p>

          <div className="field-group">
            <label className="field-label">Número da mesa</label>
            <input
              className="field-input"
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Mesa 9"
            />
          </div>

          <div className="field-group">
            <label className="field-label">Pedido em linguagem natural</label>
            <p className="field-helper">
              Exemplo: “quero 2 x-bacon, 1 coca zero e tira a cebola de um deles”.
            </p>

            <textarea
              className="field-textarea"
              value={orderText}
              onChange={(e) => setOrderText(e.target.value)}
              placeholder="Escreva aqui o pedido do cliente..."
              rows={5}
            />
          </div>

          <div className="actions-row">
            <button
              className="primary-button"
              onClick={handleInterpretOrder}
              disabled={isInterpreting}
            >
              {isInterpreting ? "Interpretando..." : "Interpretar pedido com IA"}
            </button>

            <button
              className="secondary-button"
              onClick={() => setOrderText("")}
              disabled={isInterpreting}
            >
              Limpar texto
            </button>
          </div>

          <div className="tip-box">
            <strong>Dica:</strong> o botão de interpretar soma os itens ao pedido atual.
            Os itens adicionados aparecem imediatamente no resumo ao lado.
          </div>

          <div className="menu-section">
            <h2 className="panel-title">Cardápio</h2>
            <p className="panel-subtitle">
              Escolha uma categoria ou adicione itens diretamente.
            </p>

            <div className="category-tabs">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-tab ${
                    selectedCategory === category ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="menu-list">
              {filteredItems.map((item) => (
                <article key={item.id} className="menu-card">
                  <div className="menu-card-content">
                    <div className="menu-card-top">
                      <h3 className="menu-item-name">{item.name}</h3>
                      <span className="menu-item-price">
                        {Number(item.price).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>

                    <p className="menu-item-description">{item.description}</p>

                    <div className="menu-card-bottom">
                      <span className="menu-item-category">{item.category}</span>

                      <button
                        className="success-button"
                        onClick={() => handleAddManual(item)}
                      >
                        Adicionar ao pedido
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="summary-card">
          <h2 className="panel-title">Resumo do pedido</h2>
          <p className="panel-subtitle">
            Confira os itens antes de enviar para a cozinha.
          </p>

          {!cart.length ? (
            <div className="empty-summary">
              Nenhum item no pedido ainda. Você pode adicionar itens pelo cardápio ou
              escrever o pedido no campo de interpretação.
            </div>
          ) : (
            <div className="summary-list">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.notes || "sem-notes"}`}
                  className="summary-item"
                >
                  <div>
                    <p className="summary-item-title">
                      {item.quantity}x {item.name}
                    </p>
                    <p className="summary-item-notes">
                      {item.notes?.trim() ? item.notes : "Sem observações"}
                    </p>
                  </div>

                  <div className="summary-item-right">
                    <span className="summary-item-price">
                      {Number(item.total).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>

                    <button
                      className="remove-button"
                      onClick={() => handleRemoveItem(item.id, item.notes)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="summary-total">
            <span>Total</span>
            <strong>
              {Number(total).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </strong>
          </div>

          <div className="summary-actions">
            <button
              className="confirm-button"
              onClick={handleConfirmOrder}
              disabled={!cart.length || isConfirming}
            >
              {isConfirming ? "Confirmando..." : "Confirmar pedido"}
            </button>

            <button
              className="clear-button"
              onClick={handleClearOrder}
              disabled={!cart.length}
            >
              Limpar pedido
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
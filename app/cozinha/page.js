"use client";

import { useMemo } from "react";
import { useOrders } from "../../context/OrderContext";

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, #0b2c75 0%, #03123f 45%, #020b2d 100%)",
    color: "#f5f7ff",
    padding: "48px 24px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
  },
  title: {
    fontSize: "64px",
    lineHeight: 1,
    fontWeight: 800,
    margin: 0,
    marginBottom: "12px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#d7def7",
    marginBottom: "28px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "rgba(28, 45, 98, 0.86)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "28px",
    padding: "24px",
    boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
  },
  orderId: {
    fontSize: "15px",
    color: "#cbd6ff",
    marginBottom: "10px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "18px",
  },
  table: {
    fontSize: "38px",
    fontWeight: 800,
    margin: 0,
  },
  badge: {
    padding: "10px 16px",
    borderRadius: "999px",
    fontWeight: 800,
    fontSize: "15px",
    textTransform: "lowercase",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  badgeNovo: {
    background: "rgba(175, 120, 25, 0.22)",
    color: "#ffd56a",
  },
  badgePreparo: {
    background: "rgba(45, 102, 210, 0.22)",
    color: "#8fc1ff",
  },
  badgePronto: {
    background: "rgba(19, 150, 120, 0.22)",
    color: "#67f0cc",
  },
  itemsWrap: {
    display: "grid",
    gap: "14px",
    marginBottom: "18px",
  },
  itemCard: {
    background: "rgba(58, 74, 126, 0.72)",
    borderRadius: "22px",
    padding: "18px",
  },
  itemName: {
    fontSize: "18px",
    fontWeight: 800,
    marginBottom: "8px",
  },
  itemNotes: {
    fontSize: "15px",
    color: "#d7def7",
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  prepButton: {
    border: "none",
    borderRadius: "18px",
    padding: "14px 20px",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer",
    background: "#326cf0",
    color: "#ffffff",
    minWidth: "160px",
  },
  readyButton: {
    border: "none",
    borderRadius: "18px",
    padding: "14px 20px",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer",
    background: "#19b877",
    color: "#ffffff",
    minWidth: "160px",
  },
  empty: {
    background: "rgba(28, 45, 98, 0.86)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "28px",
    padding: "24px",
    color: "#d7def7",
    fontSize: "18px",
  },
};

function getBadgeStyle(status) {
  if (status === "preparo") {
    return { ...styles.badge, ...styles.badgePreparo };
  }

  if (status === "pronto") {
    return { ...styles.badge, ...styles.badgePronto };
  }

  return { ...styles.badge, ...styles.badgeNovo };
}

export default function KitchenPage() {
  const { orders, updateOrderStatus } = useOrders();

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => Number(b.id) - Number(a.id));
  }, [orders]);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Painel da Cozinha</h1>
        <p style={styles.subtitle}>
          Atualize rapidamente o andamento dos pedidos.
        </p>

        {sortedOrders.length === 0 ? (
          <div style={styles.empty}>Nenhum pedido recebido ainda.</div>
        ) : (
          <div style={styles.grid}>
            {sortedOrders.map((order) => (
              <article key={order.id} style={styles.card}>
                <div style={styles.orderId}>Pedido #{order.id}</div>

                <div style={styles.headerRow}>
                  <h2 style={styles.table}>{order.table}</h2>
                  <span style={getBadgeStyle(order.status)}>
                    {order.status || "novo"}
                  </span>
                </div>

                <div style={styles.itemsWrap}>
                  {(order.items || []).map((item) => (
                    <div
                      key={`${order.id}-${item.id}-${item.name}`}
                      style={styles.itemCard}
                    >
                      <div style={styles.itemName}>
                        {item.quantity}x {item.name}
                      </div>
                      <div style={styles.itemNotes}>
                        {item.notes?.trim() || "Sem observações"}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.actions}>
                  <button
                    type="button"
                    style={styles.prepButton}
                    onClick={() => updateOrderStatus(order.id, "preparo")}
                  >
                    Marcar preparo
                  </button>

                  <button
                    type="button"
                    style={styles.readyButton}
                    onClick={() => updateOrderStatus(order.id, "pronto")}
                  >
                    Marcar pronto
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
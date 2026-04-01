"use client";

import { useMemo } from "react";
import { useOrders } from "../../context/OrderContext";
import { menuItems } from "../../data/mockData";

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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginBottom: "28px",
  },
  statCard: {
    background: "rgba(28, 45, 98, 0.86)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "28px",
    padding: "28px",
    boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
  },
  statLabel: {
    fontSize: "18px",
    color: "#d7def7",
    marginBottom: "18px",
  },
  statValue: {
    fontSize: "76px",
    lineHeight: 1,
    fontWeight: 800,
  },
  statMoney: {
    fontSize: "64px",
    lineHeight: 1,
    fontWeight: 800,
    color: "#2be7b2",
  },
  lowerGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "24px",
  },
  panel: {
    background: "rgba(28, 45, 98, 0.86)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "28px",
    padding: "28px",
    boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
  },
  panelTitle: {
    fontSize: "28px",
    fontWeight: 800,
    marginBottom: "8px",
  },
  panelText: {
    fontSize: "16px",
    color: "#d7def7",
    marginBottom: "18px",
  },
  list: {
    display: "grid",
    gap: "14px",
  },
  listItem: {
    background: "rgba(58, 74, 126, 0.72)",
    borderRadius: "22px",
    padding: "18px",
  },
  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    marginBottom: "8px",
  },
  itemTitle: {
    fontSize: "18px",
    fontWeight: 800,
  },
  itemSub: {
    fontSize: "15px",
    color: "#d7def7",
  },
  price: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#2be7b2",
    whiteSpace: "nowrap",
  },
  empty: {
    color: "#d7def7",
    fontSize: "16px",
  },
};

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

export default function AdminPage() {
  const { orders } = useOrders();

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    return {
      ordersToday: orders.length,
      productsCount: menuItems.length,
      revenue: totalRevenue,
      latestOrders: [...orders].sort((a, b) => Number(b.id) - Number(a.id)),
    };
  }, [orders]);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Painel Admin</h1>
        <p style={styles.subtitle}>
          Visão geral da operação do restaurante, com foco em pedidos, cardápio
          e faturamento.
        </p>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Pedidos hoje</div>
            <div style={styles.statValue}>{stats.ordersToday}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Produtos cadastrados</div>
            <div style={styles.statValue}>{stats.productsCount}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Faturamento simulado</div>
            <div style={styles.statMoney}>{formatCurrency(stats.revenue)}</div>
          </div>
        </section>

        <section style={styles.lowerGrid}>
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Cardápio</div>
            <div style={styles.panelText}>
              Itens atualmente visíveis no sistema.
            </div>

            <div style={styles.list}>
              {menuItems.map((item) => (
                <div key={item.id} style={styles.listItem}>
                  <div style={styles.rowBetween}>
                    <div style={styles.itemTitle}>{item.name}</div>
                    <div style={styles.price}>{formatCurrency(item.price)}</div>
                  </div>
                  <div style={styles.itemSub}>{item.category}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelTitle}>Últimos pedidos</div>
            <div style={styles.panelText}>
              Histórico recente para acompanhamento operacional.
            </div>

            <div style={styles.list}>
              {stats.latestOrders.length === 0 ? (
                <div style={styles.empty}>Nenhum pedido registrado ainda.</div>
              ) : (
                stats.latestOrders.map((order) => (
                  <div key={order.id} style={styles.listItem}>
                    <div style={styles.itemTitle}>
                      Pedido #{order.id} • {order.table}
                    </div>
                    <div style={{ ...styles.itemSub, marginTop: "10px" }}>
                      Total: {formatCurrency(order.total)}
                    </div>
                    <div style={styles.itemSub}>
                      Status: {order.status || "novo"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
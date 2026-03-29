"use client";

import { useMemo } from "react";
import { menuItems } from "../../data/mockData";
import { useOrders } from "../../context/OrderContext";

function formatPrice(value) {
  return `R$ ${Number(value || 0).toFixed(2).replace(".", ",")}`;
}

export default function AdminPage() {
  const { orders, loading } = useOrders();

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  }, [orders]);

  const latestOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [orders]);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="page-container">
          <header className="page-header">
            <h1 className="page-title">Painel Admin</h1>
            <p className="page-subtitle">Carregando dados da operação...</p>
          </header>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-container">
        <header className="page-header">
          <h1 className="page-title">Painel Admin</h1>
          <p className="page-subtitle">
            Visão geral da operação do restaurante, com foco em pedidos, cardápio e faturamento.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="metric-card">
            <p className="metric-label">Pedidos hoje</p>
            <p className="metric-value">{orders.length}</p>
          </div>

          <div className="metric-card">
            <p className="metric-label">Produtos cadastrados</p>
            <p className="metric-value">{menuItems.length}</p>
          </div>

          <div className="metric-card">
            <p className="metric-label">Faturamento simulado</p>
            <p className="metric-value metric-value-strong">{formatPrice(totalRevenue)}</p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="glass-card section-box">
            <div className="section-block">
              <div>
                <h2 className="section-title">Cardápio</h2>
                <p className="section-subtitle">
                  Itens atualmente visíveis no sistema.
                </p>
              </div>

              <div className="muted-divider" />
            </div>

            <div className="admin-list">
              {menuItems.map((item) => (
                <div key={item.id} className="admin-row">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="admin-row-title">{item.name}</p>
                      <p className="admin-row-subtitle">{item.category}</p>
                    </div>

                    <strong className="text-2xl font-black text-emerald-400">
                      {formatPrice(item.price)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card section-box">
            <div className="section-block">
              <div>
                <h2 className="section-title">Últimos pedidos</h2>
                <p className="section-subtitle">
                  Histórico recente para acompanhamento operacional.
                </p>
              </div>

              <div className="muted-divider" />
            </div>

            <div className="admin-list">
              {latestOrders.length === 0 ? (
                <div className="summary-empty">Nenhum pedido registrado ainda.</div>
              ) : (
                latestOrders.map((order) => (
                  <div key={order.id} className="admin-row">
                    <p className="admin-row-title">
                      Pedido #{order.id} • {order.table}
                    </p>
                    <p className="admin-row-subtitle">Total: {formatPrice(order.total)}</p>
                    <p className="admin-row-subtitle">Status: {order.status}</p>
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
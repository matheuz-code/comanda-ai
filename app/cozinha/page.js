"use client";

import { useMemo } from "react";
import StatusBadge from "../../components/StatusBadge";
import { useOrders } from "../../context/OrderContext";

const statusPriority = {
  novo: 0,
  preparo: 1,
  pronto: 2,
};

export default function KitchenPage() {
  const { orders, loading, updateOrderStatus } = useOrders();

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const statusDiff = statusPriority[a.status] - statusPriority[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders]);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="page-container">
          <header className="page-header">
            <h1 className="page-title">Painel da Cozinha</h1>
            <p className="page-subtitle">Carregando pedidos...</p>
          </header>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-container">
        <header className="page-header">
          <h1 className="page-title">Painel da Cozinha</h1>
          <p className="page-subtitle">
            Atualize rapidamente o andamento dos pedidos.
          </p>
        </header>

        {sortedOrders.length === 0 ? (
          <div className="glass-card section-box">
            <h2 className="section-title">Nenhum pedido no momento</h2>
            <p className="section-subtitle">
              Assim que um pedido for confirmado pelo cliente, ele aparece aqui.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {sortedOrders.map((order) => (
              <article key={order.id} className="glass-card kitchen-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="kitchen-order-id">Pedido #{order.id}</p>
                    <h2 className="kitchen-table">{order.table}</h2>
                  </div>

                  <StatusBadge status={order.status} />
                </div>

                <div className="kitchen-items">
                  {order.items.map((item, index) => (
                    <div key={`${order.id}-${item.id}-${index}`} className="kitchen-item">
                      <p className="kitchen-item-title">
                        {item.quantity}x {item.name}
                      </p>

                      {item.notes ? (
                        <p className="kitchen-item-note">{item.notes}</p>
                      ) : (
                        <p className="kitchen-item-note">Sem observações</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="kitchen-actions">
                  <button
                    type="button"
                    onClick={async () => {
                      await updateOrderStatus(order.id, "preparo");
                    }}
                    className="btn btn-blue"
                  >
                    Marcar preparo
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await updateOrderStatus(order.id, "pronto");
                    }}
                    className="btn btn-green"
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
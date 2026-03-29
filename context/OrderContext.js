"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    try {
      const response = await fetch("/api/orders", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Falha ao buscar pedidos.");
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function addConfirmedOrder(orderData) {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Falha ao criar pedido.");
      }

      const createdOrder = await response.json();

      setOrders((prev) => [createdOrder, ...prev]);

      return { success: true, order: createdOrder };
    } catch (error) {
      console.error("Erro ao adicionar pedido:", error);
      return { success: false, error };
    }
  }

  async function updateOrderStatus(orderId, status) {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar status do pedido.");
      }

      const updatedOrder = await response.json();

      setOrders((prev) =>
        prev.map((order) =>
          String(order.id) === String(orderId) ? updatedOrder : order
        )
      );

      return { success: true, order: updatedOrder };
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      return { success: false, error };
    }
  }

  const value = useMemo(() => {
    return {
      orders,
      loading,
      fetchOrders,
      addConfirmedOrder,
      updateOrderStatus,
    };
  }, [orders, loading]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error("useOrders deve ser usado dentro de um OrderProvider.");
  }

  return context;
}
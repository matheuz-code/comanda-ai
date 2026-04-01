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
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function createOrder(orderData) {
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

    return createdOrder;
  }

  async function updateOrderStatus(orderId, status) {
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
      prev.map((order) => (order.id === orderId ? updatedOrder : order))
    );

    return updatedOrder;
  }

  function clearOrders() {
    setOrders([]);
  }

  const value = useMemo(() => {
    return {
      orders,
      loading,
      fetchOrders,
      createOrder,
      updateOrderStatus,
      clearOrders,

      // compatibilidade com código antigo
      addConfirmedOrder: createOrder,
    };
  }, [orders, loading]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error("useOrders precisa ser usado dentro de OrderProvider.");
  }

  return context;
}
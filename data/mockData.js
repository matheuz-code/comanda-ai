export const menuItems = [
  {
    id: "x-bacon",
    name: "X-Bacon",
    description: "Pão brioche, hambúrguer, queijo, bacon e molho especial",
    category: "Hambúrgueres",
    price: 28.9,
  },
  {
    id: "x-salada",
    name: "X-Salada",
    description: "Pão brioche, hambúrguer, queijo, alface, tomate e molho",
    category: "Hambúrgueres",
    price: 24.9,
  },
  {
    id: "batata-frita-m",
    name: "Batata Frita M",
    description: "Porção média crocante",
    category: "Batatas",
    price: 14,
  },
  {
    id: "coca-cola-zero",
    name: "Coca-Cola Zero",
    description: "Lata 350ml",
    category: "Bebidas",
    price: 7.5,
  },
  {
    id: "milk-shake-chocolate",
    name: "Milk-shake Chocolate",
    description: "Shake cremoso de chocolate",
    category: "Sobremesas",
    price: 18,
  },
  {
    id: "combo-duplo",
    name: "Combo Duplo",
    description: "2 hambúrgueres + batata + bebida",
    category: "Hambúrgueres",
    price: 59.9,
  },
];

export const kitchenOrders = [
  {
    id: 101,
    table: "Mesa 3",
    status: "novo",
    items: ["2x X-Bacon", "1 sem cebola", "1x Coca-Cola Zero"],
  },
  {
    id: 102,
    table: "Mesa 7",
    status: "preparo",
    items: ["1x Combo Duplo", "1x Batata Frita M", "bem crocante"],
  },
  {
    id: 103,
    table: "Mesa 2",
    status: "pronto",
    items: ["2x Milk-shake Chocolate"],
  },
];
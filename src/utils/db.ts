import { CustomerInfo, OrderItem } from "./zalo";

export interface ServerOrder {
  id: string;
  customer: CustomerInfo;
  items: OrderItem[];
  total: number;
  status: "pending" | "approved" | "cancelled";
  createdAt: string;
  updatedAt?: string;
}

// In-memory storage — works on Vercel serverless (no filesystem write needed)
// Orders persist while the serverless instance is warm.
// For production, replace with a real database (e.g. MongoDB, Supabase, etc.)
const globalForOrders = globalThis as unknown as { orders: ServerOrder[] };
if (!globalForOrders.orders) {
  globalForOrders.orders = [];
}

// Fetch all orders
export async function getOrders(): Promise<ServerOrder[]> {
  return globalForOrders.orders;
}

// Save a new order from user
export async function saveOrder(orderData: {
  customer: CustomerInfo;
  items: OrderItem[];
  total: number;
}): Promise<ServerOrder> {
  const newOrder: ServerOrder = {
    id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    customer: orderData.customer,
    items: orderData.items,
    total: orderData.total,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  globalForOrders.orders.unshift(newOrder); // Newest order on top
  return newOrder;
}

// Update an order (status, items, total, customer details)
export async function updateOrder(
  id: string,
  updatedFields: Partial<Omit<ServerOrder, "id" | "createdAt">>
): Promise<ServerOrder | null> {
  const orders = globalForOrders.orders;
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) return null;

  orders[index] = {
    ...orders[index],
    ...updatedFields,
    updatedAt: new Date().toISOString(),
  };

  return orders[index];
}

// Delete an order
export async function deleteOrder(id: string): Promise<boolean> {
  const orders = globalForOrders.orders;
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) return false;

  globalForOrders.orders.splice(index, 1);
  return true;
}

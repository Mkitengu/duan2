import fs from "fs/promises";
import path from "path";
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

const dbFilePath = path.join(process.cwd(), "src/data/orders.json");

// Helper to ensure database folder and file exist
async function ensureFileExists() {
  try {
    await fs.access(dbFilePath);
  } catch {
    const folder = path.dirname(dbFilePath);
    await fs.mkdir(folder, { recursive: true });
    await fs.writeFile(dbFilePath, JSON.stringify([], null, 2), "utf-8");
  }
}

// Fetch all orders
export async function getOrders(): Promise<ServerOrder[]> {
  await ensureFileExists();
  try {
    const data = await fs.readFile(dbFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read database file, resetting to empty array:", error);
    await fs.writeFile(dbFilePath, JSON.stringify([], null, 2), "utf-8");
    return [];
  }
}

// Save a new order from user
export async function saveOrder(orderData: {
  customer: CustomerInfo;
  items: OrderItem[];
  total: number;
}): Promise<ServerOrder> {
  await ensureFileExists();
  const orders = await getOrders();
  
  const newOrder: ServerOrder = {
    id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    customer: orderData.customer,
    items: orderData.items,
    total: orderData.total,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  orders.unshift(newOrder); // Newest order on top
  await fs.writeFile(dbFilePath, JSON.stringify(orders, null, 2), "utf-8");
  return newOrder;
}

// Update an order (status, items, total, customer details)
export async function updateOrder(
  id: string,
  updatedFields: Partial<Omit<ServerOrder, "id" | "createdAt">>
): Promise<ServerOrder | null> {
  await ensureFileExists();
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === id);
  
  if (index === -1) return null;

  orders[index] = {
    ...orders[index],
    ...updatedFields,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(dbFilePath, JSON.stringify(orders, null, 2), "utf-8");
  return orders[index];
}

// Delete an order
export async function deleteOrder(id: string): Promise<boolean> {
  await ensureFileExists();
  const orders = await getOrders();
  const filtered = orders.filter((o) => o.id !== id);
  
  if (orders.length === filtered.length) return false;
  
  await fs.writeFile(dbFilePath, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

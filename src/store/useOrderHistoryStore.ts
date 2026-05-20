import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CustomerInfo } from "@/utils/zalo";

export interface OrderHistoryItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customer: CustomerInfo;
  shopPhone: string;
  items: OrderHistoryItem[];
  total: number;
  message: string;
  createdAt: string;
  status: "sent" | "pending";
}

interface OrderHistoryStore {
  orders: Order[];
  isHistoryOpen: boolean;
  addOrder: (order: Omit<Order, "id" | "createdAt">) => void;
  removeOrder: (id: string) => void;
  clearHistory: () => void;
  toggleHistory: () => void;
  setHistoryOpen: (open: boolean) => void;
}

export const useOrderHistoryStore = create<OrderHistoryStore>()(
  persist(
    (set) => ({
      orders: [],
      isHistoryOpen: false,

      addOrder: (orderData) => {
        const order: Order = {
          ...orderData,
          id: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          orders: [order, ...state.orders],
        }));
      },

      removeOrder: (id: string) => {
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== id),
        }));
      },

      clearHistory: () => set({ orders: [] }),

      toggleHistory: () =>
        set((state) => ({ isHistoryOpen: !state.isHistoryOpen })),

      setHistoryOpen: (open: boolean) => set({ isHistoryOpen: open }),
    }),
    {
      name: "water-order-history",
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);

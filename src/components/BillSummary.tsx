"use client";

import { formatCurrency } from "@/utils/currency";
import { useCartStore } from "@/store/useCartStore";

export default function BillSummary() {
  const { items, calculateTotal } = useCartStore();
  const total = calculateTotal();

  if (items.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-2xl p-4 border border-slate-100">
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-slate-600">
              {item.product.name}{" "}
              <span className="text-slate-400">x{item.quantity}</span>
            </span>
            <span className="font-medium text-slate-700">
              {formatCurrency(item.product.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-slate-300 my-3" />

      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-700">Tổng cộng:</span>
        <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}

"use client";

import {
  X,
  Clock,
  Trash2,
  Copy,
  Check,
  Send,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";
import { useOrderHistoryStore, Order } from "@/store/useOrderHistoryStore";
import { formatCurrency } from "@/utils/currency";
import { copyToClipboard, openZaloDirect } from "@/utils/zalo";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function OrderCard({ order, onRemove }: { order: Order; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const date = new Date(order.createdAt);
  const formattedDate = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCopy = async () => {
    const success = await copyToClipboard(order.message);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResend = async () => {
    await openZaloDirect(order.shopPhone, order.message);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50, height: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Summary Row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center flex-shrink-0">
          <Package className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-slate-800 truncate">
              {order.customer.name}
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold flex-shrink-0">
              {order.status === "sent" ? "Đã gửi" : "Chờ gửi"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-400">
              {formattedDate} · {formattedTime}
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-semibold text-teal-600">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 text-slate-400">
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">SĐT khách:</span>
                  <p className="font-medium text-slate-700">
                    {order.customer.phone}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Zalo quán:</span>
                  <p className="font-medium text-blue-600">
                    {order.shopPhone}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Địa chỉ:</span>
                  <p className="font-medium text-slate-700">
                    {order.customer.address}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-xs"
                  >
                    <span className="text-slate-600">
                      {item.productName}{" "}
                      <span className="text-slate-400">
                        x{item.quantity}
                      </span>
                    </span>
                    <span className="font-medium text-slate-700">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-dashed border-slate-300 pt-1.5 mt-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">Tổng:</span>
                    <span className="font-bold text-teal-600">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Note */}
              {order.customer.note && (
                <div className="text-xs">
                  <span className="text-slate-400">Ghi chú:</span>
                  <p className="text-slate-600 italic">
                    {order.customer.note}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResend}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#0068FF] text-white text-xs font-bold hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Gửi lại Zalo
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    copied
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Đã chép" : "Sao chép"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onRemove}
                  className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function OrderHistory() {
  const { orders, isHistoryOpen, setHistoryOpen, removeOrder, clearHistory } =
    useOrderHistoryStore();

  return (
    <AnimatePresence>
      {isHistoryOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setHistoryOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Lịch sử đơn hàng
                  </h2>
                  <p className="text-xs text-slate-400">
                    {orders.length} đơn hàng
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setHistoryOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </motion.button>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence mode="popLayout">
                {orders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-slate-400"
                  >
                    <Clock className="w-16 h-16 mb-4 text-slate-200" />
                    <p className="text-lg font-medium">Chưa có đơn hàng</p>
                    <p className="text-sm mt-1">
                      Đơn hàng sẽ hiển thị tại đây sau khi đặt
                    </p>
                  </motion.div>
                ) : (
                  orders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onRemove={() => removeOrder(order.id)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {orders.length > 0 && (
              <div className="p-4 border-t border-slate-100">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearHistory}
                  className="w-full py-3 rounded-2xl border border-slate-200 text-slate-500 text-sm font-medium hover:border-red-300 hover:text-red-500 hover:bg-red-50/50 transition-all"
                >
                  Xoá tất cả lịch sử
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

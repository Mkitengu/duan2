"use client";

import { useState } from "react";
import { X, Check, Loader2, Sparkles, AlertTriangle, Coffee } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useOrderHistoryStore } from "@/store/useOrderHistoryStore";
import { formatCurrency } from "@/utils/currency";
import { motion, AnimatePresence } from "framer-motion";

type ModalState = "confirm" | "submitting" | "success" | "error";

export default function CustomerForm() {
  const {
    activeCheckoutProduct,
    activeCheckoutQty,
    setActiveCheckout,
  } = useCartStore();

  const { addOrder } = useOrderHistoryStore();

  const [modalState, setModalState] = useState<ModalState>("confirm");
  const [apiError, setApiError] = useState("");

  if (!activeCheckoutProduct) return null;

  const total = activeCheckoutProduct.price * activeCheckoutQty;

  const handleClose = () => {
    setActiveCheckout(null);
    setModalState("confirm");
    setApiError("");
  };

  const handleConfirmOrder = async () => {
    setModalState("submitting");
    setApiError("");

    const defaultCustomer = {
      name: "Khách vãng lai",
      phone: "Không cung cấp",
      address: "Nhận tại quán / bàn",
      note: "",
    };

    const orderItems = [
      {
        name: activeCheckoutProduct.name,
        quantity: activeCheckoutQty,
        price: activeCheckoutProduct.price,
      },
    ];

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: defaultCustomer,
          items: orderItems,
          total,
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể gửi đơn hàng. Vui lòng thử lại!");
      }

      const savedOrder = await response.json();

      // Add to local history store so customer can track it
      addOrder({
        customer: defaultCustomer,
        shopPhone: "0815633162", // Default shop Zalo phone
        items: [
          {
            productName: activeCheckoutProduct.name,
            quantity: activeCheckoutQty,
            price: activeCheckoutProduct.price,
          },
        ],
        total,
        message: `Món: ${activeCheckoutProduct.name} x${activeCheckoutQty}\nTổng: ${formatCurrency(total)}`,
        status: "pending",
      });

      setModalState("success");
    } catch (err: any) {
      setApiError(err.message || "Đã xảy ra lỗi kết nối tới máy chủ!");
      setModalState("error");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={modalState !== "submitting" ? handleClose : undefined}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden z-10"
        >
          {/* Decorative Glows */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          {modalState !== "submitting" && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* STATE 1: CONFIRMATION */}
          {modalState === "confirm" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">
                    Xác nhận chọn món
                  </h3>
                  <p className="text-xs text-slate-400">
                    Vui lòng xác thực trước khi gửi đơn hàng
                  </p>
                </div>
              </div>

              {/* Message */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4.5 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  Bạn có chắc muốn chọn món
                </p>
                <p className="text-xl font-black text-teal-600 tracking-tight mt-1.5">
                  &ldquo;{activeCheckoutProduct.name}&rdquo;
                </p>
                <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-200/50 text-xs font-bold text-slate-500">
                  <span>Số lượng: {activeCheckoutQty} cốc/phần</span>
                  <span className="text-base font-black text-slate-800">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-50 transition-all uppercase tracking-wider"
                >
                  Không
                </button>
                <button
                  onClick={handleConfirmOrder}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold text-xs shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all uppercase tracking-wider"
                >
                  Có (Đặt món)
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: SUBMITTING */}
          {modalState === "submitting" && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
              <div className="text-center">
                <h4 className="font-extrabold text-slate-800 text-base">
                  Đang gửi đơn hàng...
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Đơn uống đang được gửi thẳng đến quầy pha chế
                </p>
              </div>
            </div>
          )}

          {/* STATE 3: SUCCESS */}
          {modalState === "success" && (
            <div className="space-y-6 pt-4">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-green-50 border border-green-100 flex items-center justify-center text-green-500 mb-4 shadow-lg shadow-green-500/10">
                  <Check className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-slate-800">
                  Đặt món thành công! 🎉
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-2 max-w-xs">
                  Yêu cầu của bạn đã được chuyển tới Admin quán. Vui lòng đợi trong giây lát, đồ uống đang được chuẩn bị.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Món uống:</span>
                  <span className="text-slate-800 font-bold">{activeCheckoutProduct.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Số lượng:</span>
                  <span className="text-slate-800 font-bold">x{activeCheckoutQty}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200/50 font-bold">
                  <span className="text-slate-700">Tổng cộng:</span>
                  <span className="text-teal-600">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold text-xs shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all uppercase tracking-wider"
              >
                Đồng ý & Đóng
              </button>
            </div>
          )}

          {/* STATE 4: ERROR */}
          {modalState === "error" && (
            <div className="space-y-6 pt-4">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-4 shadow-lg shadow-rose-500/10">
                  <AlertTriangle className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-lg font-black text-slate-800">
                  Lỗi gửi đơn đặt nước!
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-2 max-w-xs">
                  {apiError || "Không thể lưu hoặc kết nối tới máy chủ. Vui lòng kiểm tra và thử lại!"}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-50 transition-all uppercase tracking-wider"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirmOrder}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all uppercase tracking-wider"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

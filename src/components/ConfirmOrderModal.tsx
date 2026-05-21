"use client";

import { useState } from "react";
import { Product } from "@/data/products";
import { formatCurrency } from "@/utils/currency";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, User } from "lucide-react";

interface ConfirmOrderModalProps {
  isOpen: boolean;
  product: Product | null;
  quantity: number;
  onClose: () => void;
  onConfirm: (customerName: string) => void;
}

export default function ConfirmOrderModal({
  isOpen,
  product,
  quantity,
  onClose,
  onConfirm,
}: ConfirmOrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState("");

  const handleConfirm = async () => {
    const trimmed = customerName.trim();
    if (!trimmed) {
      setNameError("Vui lòng nhập tên của bạn!");
      return;
    }
    setNameError("");
    setIsSubmitting(true);
    try {
      await onConfirm(trimmed);
    } finally {
      setIsSubmitting(false);
      setCustomerName("");
    }
  };

  const handleClose = () => {
    setCustomerName("");
    setNameError("");
    onClose();
  };

  if (!product) return null;

  const total = product.price * quantity;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Body */}
          <motion.div
            initial={{ scale: 0.94, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden z-10"
          >
            {/* Glow effects */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  Xác nhận đặt hàng
                </h3>
                <p className="text-xs text-slate-400">
                  Kiểm tra đơn hàng và nhập tên của bạn
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 mb-5 relative z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
                  {product.name}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  x{quantity}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">
                  Đơn giá: {formatCurrency(product.price)}
                </span>
                <span className="text-base font-black bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Customer Name Input */}
            <div className="mb-6 relative z-10">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                <User className="w-3.5 h-3.5" />
                Tên của bạn
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (nameError) setNameError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleConfirm();
                  }
                }}
                placeholder="Nhập tên của bạn..."
                autoFocus
                className={`w-full px-4 py-3.5 rounded-2xl border ${
                  nameError
                    ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                    : "border-slate-200 focus:ring-teal-500/20 focus:border-teal-500"
                } focus:outline-none focus:ring-2 bg-white transition-all font-semibold text-slate-800 placeholder:text-slate-300`}
              />
              {nameError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 font-bold mt-1.5 ml-1"
                >
                  ⚠️ {nameError}
                </motion.p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 relative z-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Không
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? "Đang gửi..." : "Có, Đặt ngay"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

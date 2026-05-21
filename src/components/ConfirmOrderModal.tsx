"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/data/products";
import { formatCurrency } from "@/utils/currency";
import { X } from "lucide-react";

interface ConfirmOrderModalProps {
  isOpen: boolean;
  product: Product | null;
  quantity: number;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function ConfirmOrderModal({
  isOpen,
  product,
  quantity,
  onClose,
  onConfirm,
}: ConfirmOrderModalProps) {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Card */}
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 z-10"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Xác nhận đơn hàng
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              Bạn có chắc muốn chọn món này?
            </p>

            {/* Product info */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl mb-5">
              <img
                src={product.image}
                alt={product.name}
                className="w-14 h-14 object-cover rounded-xl"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">
                  {product.name}
                </p>
                <p className="text-sm text-slate-500">
                  {formatCurrency(product.price)} × {quantity}
                </p>
              </div>
              <p className="font-bold text-teal-600 whitespace-nowrap">
                {formatCurrency(product.price * quantity)}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
              >
                Không
              </button>
              <button
                onClick={async () => {
                  await onConfirm();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold hover:from-teal-600 hover:to-blue-600 shadow-lg shadow-teal-500/25 transition"
              >
                Có, Đặt ngay
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/utils/currency";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function CartPanel() {
  const {
    items,
    isCartOpen,
    setCartOpen,
    removeItem,
    updateQuantity,
    clearCart,
    calculateTotal,
    setOrderFormOpen,
  } = useCartStore();

  const total = calculateTotal();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Giỏ hàng
                  </h2>
                  <p className="text-xs text-slate-400">
                    {items.length} sản phẩm
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCartOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </motion.button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-slate-400"
                  >
                    <ShoppingBag className="w-16 h-16 mb-4 text-slate-200" />
                    <p className="text-lg font-medium">Giỏ hàng trống</p>
                    <p className="text-sm mt-1">
                      Hãy thêm sản phẩm yêu thích!
                    </p>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors"
                    >
                      {/* Product Image */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-slate-800 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {formatCurrency(item.product.price)} / ly
                        </p>
                        <p className="text-sm font-bold text-teal-600 mt-0.5">
                          {formatCurrency(
                            item.product.price * item.quantity
                          )}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                          className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-teal-300 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 text-slate-500" />
                        </motion.button>
                        <span className="w-8 text-center text-sm font-bold text-slate-700">
                          {item.quantity}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                          className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-teal-300 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-500" />
                        </motion.button>
                      </div>

                      {/* Remove */}
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => removeItem(item.product.id)}
                        className="p-2 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-slate-100 space-y-4">
                {/* Bill */}
                <div className="bg-gradient-to-br from-slate-50 to-teal-50/50 rounded-2xl p-4 space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-slate-500">
                        {item.product.name}{" "}
                        <span className="text-slate-400">
                          x{item.quantity}
                        </span>
                      </span>
                      <span className="font-medium text-slate-700">
                        {formatCurrency(
                          item.product.price * item.quantity
                        )}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-dashed border-slate-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-700">
                        Tổng cộng:
                      </span>
                      <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearCart}
                    className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-500 text-sm font-medium hover:border-red-300 hover:text-red-500 transition-all"
                  >
                    Xoá hết
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCartOpen(false);
                      setOrderFormOpen(true);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all"
                  >
                    Đặt hàng ngay
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

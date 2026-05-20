"use client";

import { ShoppingCart, Droplets, Clock } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useOrderHistoryStore } from "@/store/useOrderHistoryStore";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { toggleCart, itemCount } = useCartStore();
  const { toggleHistory, orders } = useOrderHistoryStore();
  const count = itemCount();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 sm:gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                AquaOrder
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium -mt-0.5">
                Đặt nước nhanh chóng
              </p>
            </div>
          </motion.div>

          {/* Right Buttons */}
          <div className="flex items-center gap-2">
            {/* History Button */}
            <motion.button
              onClick={toggleHistory}
              className="relative p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-300 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 group-hover:text-orange-600 transition-colors" />
              <AnimatePresence>
                {orders.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-orange-400 to-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30"
                  >
                    {orders.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Cart Button */}
            <motion.button
              onClick={toggleCart}
              className="relative p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 hover:from-teal-100 hover:to-blue-100 transition-all duration-300 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 group-hover:text-teal-700 transition-colors" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-orange-400 to-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}

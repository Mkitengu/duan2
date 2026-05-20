"use client";

import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import CartPanel from "@/components/CartPanel";
import CustomerForm from "@/components/CustomerForm";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/utils/currency";
import { motion } from "framer-motion";
import { ShoppingCart, Sparkles } from "lucide-react";

export default function Home() {
  const { items, calculateTotal, setCartOpen, itemCount } = useCartStore();
  const total = calculateTotal();
  const count = itemCount();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        {/* Background decorations */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-200/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-14"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-100 mb-4 sm:mb-6"
            >
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm font-medium text-teal-700">
                Đặt nước online nhanh chóng
              </span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-3 sm:mb-4">
              Thực đơn{" "}
              <span className="bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
                đồ uống
              </span>
            </h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
              Chọn đồ uống yêu thích, thêm vào giỏ hàng và đặt hàng ngay qua
              Zalo
            </p>
          </motion.div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Floating Cart Button (Mobile) */}
      {count > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto z-40"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCartOpen(true)}
            className="w-full sm:w-auto flex items-center justify-between sm:justify-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-400 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              </div>
              <span className="font-bold text-sm">Giỏ hàng</span>
            </div>
            <span className="font-bold text-base">
              {formatCurrency(total)}
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* Cart Panel */}
      <CartPanel />

      {/* Customer Form */}
      <CustomerForm />

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-400 border-t border-slate-100 mt-10">
        <p>
          © 2026 AquaOrder. Đặt hàng nhanh qua{" "}
          <span className="text-blue-500 font-medium">Zalo</span>
        </p>
      </footer>
    </div>
  );
}

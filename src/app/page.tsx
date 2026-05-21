"use client";

import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import CustomerForm from "@/components/CustomerForm";
import OrderHistory from "@/components/OrderHistory";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import ConfirmOrderModal from "@/components/ConfirmOrderModal";
import { useCartStore } from "@/store/useCartStore";

export default function Home() {
  const { activeCheckoutProduct, activeCheckoutQty, setActiveCheckout, clearCart } = useCartStore();

  return (
    <div className="min-h-screen">
      <Header />

      <ConfirmOrderModal
        isOpen={!!activeCheckoutProduct}
        product={activeCheckoutProduct}
        quantity={activeCheckoutQty}
        onClose={() => {
          setActiveCheckout(null);
        }}
        onConfirm={async (customerName: string) => {
          // Build order payload
          const order = {
            customer: {
              name: customerName,
              phone: "0815633162",
              address: "Tại quán / bàn",
              note: "",
            },
            items: activeCheckoutProduct ? [{ product: activeCheckoutProduct, quantity: activeCheckoutQty }] : [],
            total: activeCheckoutProduct ? activeCheckoutProduct.price * activeCheckoutQty : 0,
          };
          try {
            const res = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(order),
            });
            if (!res.ok) throw new Error("Failed to submit order");
            // reset checkout state
            setActiveCheckout(null);
            clearCart();
          } catch (e) {
            console.error(e);
            alert("❌ Không thể gửi đơn hàng. Vui lòng thử lại!");
          }
        }}
      />

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

      {/* Customer Form (InstantOrderModal) */}
      <CustomerForm />

      {/* Order History */}
      <OrderHistory />

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-400 border-t border-slate-100 mt-10">
        <p>
          © 2026 AquaOrder. Đặt hàng nhanh chóng và tiện lợi
        </p>
        <p className="mt-2">
          <a
            href="/admin"
            className="text-xs text-slate-300 hover:text-teal-500 hover:underline transition-colors"
          >
            Quản trị viên
          </a>
        </p>
      </footer>
    </div>
  );
}

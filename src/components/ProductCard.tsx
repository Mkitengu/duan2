"use client";

import Image from "next/image";
import { Plus, Check } from "lucide-react";
import { Product } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/utils/currency";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { addItem, items } = useCartStore();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = items.find((item) => item.product.id === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="group relative bg-white rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100 hover:shadow-xl hover:shadow-teal-100/50 transition-shadow duration-500"
    >
      {/* Image Container */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-teal-700 shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Quantity badge */}
        <AnimatePresence>
          {quantityInCart > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-3 right-3"
            >
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                {quantityInCart}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-1 group-hover:text-teal-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            {formatCurrency(product.price)}
          </span>

          <motion.button
            onClick={handleAddToCart}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
              justAdded
                ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-500/30"
                : "bg-gradient-to-br from-teal-400 to-blue-500 shadow-teal-500/30 hover:shadow-teal-500/50"
            }`}
          >
            <AnimatePresence mode="wait">
              {justAdded ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <Check className="w-5 h-5 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <Plus className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Success flash effect */}
      <AnimatePresence>
        {justAdded && (
          <motion.div
            initial={{ opacity: 0.6, scale: 0 }}
            animate={{ opacity: 0, scale: 3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-teal-400/20 rounded-3xl pointer-events-none"
            style={{ transformOrigin: "bottom right" }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

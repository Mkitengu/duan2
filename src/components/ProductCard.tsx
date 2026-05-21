"use client";

import Image from "next/image";
import { Plus, Check, Sparkles, X, Minus } from "lucide-react";
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
  const { setActiveCheckout } = useCartStore();
  const [justAdded, setJustAdded] = useState(false);

  // States for Custom Drink modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState<number>(15000);
  const [customQty, setCustomQty] = useState(1);

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.isCustom) {
      setIsModalOpen(true);
    } else {
      setActiveCheckout(product, 1);
    }
  };

  const handleCardClick = () => {
    if (product.isCustom) {
      setIsModalOpen(true);
    } else {
      setActiveCheckout(product, 1);
    }
  };

  const handleAddCustomProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newCustomProduct: Product = {
      id: Date.now(), // Dynamic unique ID so they can add multiple custom drinks
      name: customName.trim(),
      price: customPrice || 0,
      image: "/products/custom.png",
      description: "Món nước tự ghi",
      category: "Món khác",
      isCustom: true,
    };

    setIsModalOpen(false);
    setActiveCheckout(newCustomProduct, customQty);
    
    // Reset form
    setCustomName("");
    setCustomPrice(15000);
    setCustomQty(1);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        whileHover={{ y: -6 }}
        onClick={handleCardClick}
        className={`group relative bg-white rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100 hover:shadow-xl hover:shadow-teal-100/50 transition-all duration-500 ${
          product.isCustom ? "cursor-pointer" : ""
        }`}
      >
        {/* Image Container */}
        <div className="relative h-48 sm:h-52 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          {product.isCustom ? (
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-500 to-blue-500 flex flex-col items-center justify-center p-4 text-center group-hover:scale-105 transition-transform duration-700">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 animate-pulse border border-white/20">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <span className="text-white font-bold text-xs tracking-wider bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                MÓN KHÁC
              </span>
            </div>
          ) : (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={index < 4}
            />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-teal-700 shadow-sm">
              {product.category}
            </span>
          </div>

        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-1 group-hover:text-teal-700 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-3 line-clamp-2 min-h-[40px]">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            {product.isCustom ? (
              <span className="text-xs font-semibold text-slate-500 italic">
                Giá tự quyết định
              </span>
            ) : (
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                {formatCurrency(product.price)}
              </span>
            )}

            <motion.button
              onClick={handleAddToCartClick}
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

      {/* Custom Drink Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden z-10"
            >
              {/* Glow effects */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Tự ghi món nước
                  </h3>
                  <p className="text-xs text-slate-400">
                    Thêm món nước theo ý thích của bạn
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleAddCustomProduct} className="space-y-4">
                {/* Drink Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Tên món nước
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Ví dụ: Cà phê muối, trà chanh ít đường..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50 transition-all font-medium text-slate-800"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Giá tiền (VND)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={1000000}
                      value={customPrice || ""}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      placeholder="Nhập giá tiền, ví dụ: 15000"
                      className="w-full pl-4 pr-16 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50 transition-all font-bold text-slate-800"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-400">
                      đ
                    </span>
                  </div>
                  {customPrice > 0 && (
                    <p className="text-xs text-teal-600 font-semibold mt-1">
                      Xem trước: {formatCurrency(customPrice)}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Số lượng
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 w-max">
                    <button
                      type="button"
                      onClick={() => setCustomQty(Math.max(1, customQty - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-teal-300 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-slate-500" />
                    </button>
                    <span className="w-10 text-center font-bold text-slate-700">
                      {customQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCustomQty(customQty + 1)}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-teal-300 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all"
                  >
                    Chọn món này
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

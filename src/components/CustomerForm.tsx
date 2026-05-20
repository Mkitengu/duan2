"use client";

import { useState } from "react";
import { X, Send, User, Phone, MapPin, MessageSquare } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/utils/currency";
import {
  generateOrderMessage,
  openZaloOrder,
  getZaloShareUrl,
  CustomerInfo,
} from "@/utils/zalo";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomerForm() {
  const { items, isOrderFormOpen, setOrderFormOpen, calculateTotal, clearCart } =
    useCartStore();
  const total = calculateTotal();

  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});
  const [orderSent, setOrderSent] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerInfo> = {};

    if (!customer.name.trim()) {
      newErrors.name = "Vui lòng nhập tên";
    }

    if (!customer.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(customer.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!customer.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const orderItems = items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const message = generateOrderMessage(orderItems, customer, total);

    // Open Zalo with order message
    openZaloOrder(message);

    // Also try the share URL as a fallback
    const shareUrl = getZaloShareUrl(message);

    setOrderSent(true);

    setTimeout(() => {
      setOrderSent(false);
      setOrderFormOpen(false);
      clearCart();
      setCustomer({ name: "", phone: "", address: "", note: "" });
    }, 3000);
  };

  const inputFields = [
    {
      key: "name" as keyof CustomerInfo,
      label: "Tên khách hàng",
      icon: User,
      placeholder: "Nguyễn Văn A",
      type: "text",
      required: true,
    },
    {
      key: "phone" as keyof CustomerInfo,
      label: "Số điện thoại",
      icon: Phone,
      placeholder: "0123456789",
      type: "tel",
      required: true,
    },
    {
      key: "address" as keyof CustomerInfo,
      label: "Địa chỉ giao hàng",
      icon: MapPin,
      placeholder: "123 Đường ABC, Quận 1, TP.HCM",
      type: "text",
      required: true,
    },
    {
      key: "note" as keyof CustomerInfo,
      label: "Ghi chú",
      icon: MessageSquare,
      placeholder: "Ít đá, thêm đường...",
      type: "text",
      required: false,
    },
  ];

  return (
    <AnimatePresence>
      {isOrderFormOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOrderFormOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[480px] sm:max-h-[90vh] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {orderSent ? (
                /* Success State */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center justify-center p-10 text-center h-full min-h-[400px]"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      damping: 10,
                      stiffness: 200,
                      delay: 0.1,
                    }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-green-500/30"
                  >
                    <Send className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    Đã gửi đơn hàng!
                  </h3>
                  <p className="text-slate-500">
                    Đơn hàng đã được gửi qua Zalo. Cảm ơn bạn!
                  </p>
                  <p className="text-xs text-slate-400 mt-3">
                    Nội dung đã được sao chép vào clipboard
                  </p>
                </motion.div>
              ) : (
                /* Form State */
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">
                        Thông tin đặt hàng
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Vui lòng điền thông tin giao hàng
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setOrderFormOpen(false)}
                      className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </motion.button>
                  </div>

                  {/* Form */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {inputFields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          {field.label}
                          {field.required && (
                            <span className="text-red-400 ml-1">*</span>
                          )}
                        </label>
                        <div className="relative">
                          <field.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                          <input
                            type={field.type}
                            value={customer[field.key]}
                            onChange={(e) => {
                              setCustomer({
                                ...customer,
                                [field.key]: e.target.value,
                              });
                              if (errors[field.key]) {
                                setErrors({ ...errors, [field.key]: undefined });
                              }
                            }}
                            placeholder={field.placeholder}
                            className={`w-full pl-11 pr-4 py-3 rounded-2xl border ${
                              errors[field.key]
                                ? "border-red-300 bg-red-50/50"
                                : "border-slate-200 bg-slate-50"
                            } focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all text-sm text-slate-800 placeholder:text-slate-300`}
                          />
                        </div>
                        {errors[field.key] && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-500 mt-1 ml-1"
                          >
                            {errors[field.key]}
                          </motion.p>
                        )}
                      </div>
                    ))}

                    {/* Order Summary */}
                    <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-2xl p-4 border border-slate-100 mt-4">
                      <h3 className="text-sm font-bold text-slate-700 mb-3">
                        Tóm tắt đơn hàng
                      </h3>
                      <div className="space-y-2">
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
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="p-5 border-t border-slate-100">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold text-base shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Đặt hàng qua Zalo
                    </motion.button>
                    <p className="text-center text-xs text-slate-400 mt-2">
                      Đơn hàng sẽ được gửi qua tin nhắn Zalo
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

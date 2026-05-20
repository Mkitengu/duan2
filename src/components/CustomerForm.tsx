"use client";

import { useState } from "react";
import {
  X,
  Send,
  User,
  Phone,
  MapPin,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/utils/currency";
import {
  generateOrderMessage,
  openZaloShare,
  openZaloChat,
  copyToClipboard,
  CustomerInfo,
} from "@/utils/zalo";
import { motion, AnimatePresence } from "framer-motion";

type FormStep = "info" | "preview" | "success";

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
  const [step, setStep] = useState<FormStep>("info");
  const [orderMessage, setOrderMessage] = useState("");
  const [copied, setCopied] = useState(false);

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

  const handleContinue = () => {
    if (!validateForm()) return;

    const orderItems = items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const message = generateOrderMessage(orderItems, customer, total);
    setOrderMessage(message);
    setStep("preview");
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(orderMessage);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleZaloShare = () => {
    openZaloShare(orderMessage);
    setStep("success");
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  const handleZaloChat = async () => {
    await copyToClipboard(orderMessage);
    setCopied(true);
    openZaloChat();
    setStep("success");
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  const handleClose = () => {
    setStep("info");
    setOrderFormOpen(false);
    clearCart();
    setCustomer({ name: "", phone: "", address: "", note: "" });
    setCopied(false);
    setOrderMessage("");
  };

  const handleDismiss = () => {
    setStep("info");
    setOrderFormOpen(false);
    setCopied(false);
    setOrderMessage("");
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
            onClick={handleDismiss}
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
              {/* ========== STEP 1: Customer Info ========== */}
              {step === "info" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
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
                      onClick={handleDismiss}
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
                                setErrors({
                                  ...errors,
                                  [field.key]: undefined,
                                });
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

                  {/* Continue Button */}
                  <div className="p-5 border-t border-slate-100">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleContinue}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold text-base shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Tiếp tục
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ========== STEP 2: Preview & Send via Zalo ========== */}
              {step === "preview" && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setStep("info")}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                      </motion.button>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">
                          Gửi qua Zalo
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Chọn cách gửi đơn hàng
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleDismiss}
                      className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </motion.button>
                  </div>

                  {/* Message Preview */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Preview Box */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700">
                          Nội dung đơn hàng
                        </label>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCopy}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            copied
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Đã sao chép!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Sao chép
                            </>
                          )}
                        </motion.button>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-48 overflow-y-auto">
                        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                          {orderMessage}
                        </pre>
                      </div>
                    </div>

                    {/* Zalo Buttons */}
                    <div className="space-y-3">
                      {/* Option 1: Share via Zalo (Recommended) */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleZaloShare}
                        className="w-full py-4 px-5 rounded-2xl bg-[#0068FF] text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center gap-4"
                      >
                        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Send className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-base">
                            Chia sẻ qua Zalo
                          </div>
                          <div className="text-blue-200 text-xs mt-0.5">
                            Mở Zalo → chọn shop → gửi tin nhắn (nội dung có
                            sẵn)
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 ml-auto flex-shrink-0 opacity-60" />
                      </motion.button>

                      {/* Divider */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400 font-medium">
                          hoặc
                        </span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>

                      {/* Option 2: Open Direct Chat */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleZaloChat}
                        className="w-full py-4 px-5 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center gap-4"
                      >
                        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-base">
                            Mở chat Zalo shop
                          </div>
                          <div className="text-slate-400 text-xs mt-0.5">
                            Tự động sao chép nội dung → dán vào chat Zalo
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 ml-auto flex-shrink-0 opacity-40" />
                      </motion.button>
                    </div>

                    {/* Help note */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                      <p className="text-xs text-amber-700 leading-relaxed">
                        💡 <strong>Cách 1 (khuyên dùng):</strong> Nhấn
                        &ldquo;Chia sẻ qua Zalo&rdquo; → Zalo mở ra với nội
                        dung đơn hàng có sẵn → chọn shop → gửi.
                        <br />
                        <br />
                        💡 <strong>Cách 2:</strong> Nhấn &ldquo;Mở chat Zalo
                        shop&rdquo; → nội dung được sao chép tự động → dán
                        (paste) vào ô chat Zalo.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ========== STEP 3: Success ========== */}
              {step === "success" && (
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
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    Đã mở Zalo!
                  </h3>
                  <p className="text-slate-500 max-w-xs">
                    Vui lòng hoàn tất gửi đơn hàng bên Zalo. Cảm ơn bạn đã đặt
                    hàng!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose}
                    className="mt-6 px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    Đóng
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

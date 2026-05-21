"use client";

import { useState } from "react";
import {
  X,
  Send,
  User,
  Phone,
  MapPin,
  MessageSquare,
  Check,
  ArrowLeft,
  Loader2,
  Package,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useOrderHistoryStore } from "@/store/useOrderHistoryStore";
import { formatCurrency } from "@/utils/currency";
import { CustomerInfo } from "@/utils/zalo";
import { motion, AnimatePresence } from "framer-motion";

type FormStep = "info" | "preview" | "success";

export default function CustomerForm() {
  const { items, isOrderFormOpen, setOrderFormOpen, calculateTotal, clearCart } =
    useCartStore();
  const { addOrder } = useOrderHistoryStore();
  const total = calculateTotal();

  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<FormStep>("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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
    setStep("preview");
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    setApiError("");

    const orderItems = items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer,
          items: orderItems,
          total,
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể gửi đơn hàng. Vui lòng thử lại!");
      }

      // Add to customer's local history for tracking
      addOrder({
        customer,
        shopPhone: "0815633162", // Default shop phone
        items: items.map((item) => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        total,
        message: "",
        status: "pending",
      });

      setStep("success");
    } catch (err: any) {
      setApiError(err.message || "Đã xảy ra lỗi kết nối!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("info");
    setOrderFormOpen(false);
    clearCart();
    setCustomer({ name: "", phone: "", address: "", note: "" });
    setApiError("");
  };

  const handleDismiss = () => {
    if (isSubmitting) return; // Prevent dismissal during submission
    setStep("info");
    setOrderFormOpen(false);
    setApiError("");
  };

  const inputFields = [
    {
      key: "name",
      label: "Tên khách hàng",
      icon: User,
      placeholder: "Nguyễn Văn A",
      type: "text",
      required: true,
    },
    {
      key: "phone",
      label: "SĐT khách hàng",
      icon: Phone,
      placeholder: "0912345678",
      type: "tel",
      required: true,
    },
    {
      key: "address",
      label: "Địa chỉ giao hàng",
      icon: MapPin,
      placeholder: "123 Đường ABC, Quận 1, TP.HCM",
      type: "text",
      required: true,
    },
    {
      key: "note",
      label: "Ghi chú (nếu có)",
      icon: MessageSquare,
      placeholder: "Ví dụ: Ít đá, thêm đường, mang ống hút...",
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
            className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 15 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[480px] sm:max-h-[90vh] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-100"
          >
            <AnimatePresence mode="wait">
              {/* ========== STEP 1: Customer Form ========== */}
              {step === "info" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">
                        Thông tin giao hàng
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Điền thông tin của bạn để quán lập hóa đơn
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

                  {/* Inputs */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {inputFields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          {field.label}
                          {field.required && (
                            <span className="text-red-400 ml-1">*</span>
                          )}
                        </label>
                        <div className="relative">
                          <field.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                          <input
                            type={field.type}
                            value={customer[field.key as keyof CustomerInfo]}
                            onChange={(e) => {
                              setCustomer({
                                ...customer,
                                [field.key]: e.target.value,
                              });
                              if (errors[field.key]) {
                                setErrors({
                                  ...errors,
                                  [field.key]: "",
                                });
                              }
                            }}
                            placeholder={field.placeholder}
                            className={`w-full pl-11 pr-4 py-3 rounded-2xl border ${
                              errors[field.key]
                                ? "border-red-300 bg-red-50/30"
                                : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                            } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm text-slate-800 placeholder:text-slate-300 font-medium`}
                          />
                        </div>
                        {errors[field.key] && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-500 mt-1 ml-1"
                          >
                            {errors[field.key]}
                          </motion.p>
                        )}
                      </div>
                    ))}

                    {/* Quick Bill Preview */}
                    <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-2xl p-4 border border-slate-100 mt-4">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Tóm tắt đồ uống
                      </h3>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-slate-600 font-medium">
                              {item.product.name}{" "}
                              <span className="text-slate-400 font-normal">
                                x{item.quantity}
                              </span>
                            </span>
                            <span className="font-semibold text-slate-700">
                              {formatCurrency(
                                item.product.price * item.quantity
                              )}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-dashed border-slate-200 pt-2.5 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-700 text-sm">
                              Tổng cộng:
                            </span>
                            <span className="text-base font-extrabold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                              {formatCurrency(total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-5 border-t border-slate-100 bg-white">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleContinue}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold text-base shadow-lg shadow-teal-500/20 hover:shadow-teal-500/35 transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Tiếp tục
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ========== STEP 2: Review & Submit ========== */}
              {step === "preview" && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setStep("info")}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                        disabled={isSubmitting}
                      >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                      </motion.button>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">
                          Xác nhận đơn hàng
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Kiểm tra thông tin trước khi gửi đi
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleDismiss}
                      className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                      disabled={isSubmitting}
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </motion.button>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Customer Info Card */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Thông tin giao hàng
                      </h3>
                      <div className="flex items-start gap-2.5 text-sm">
                        <User className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-700">
                            {customer.name}
                          </p>
                          <p className="text-xs text-slate-500">Người nhận</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 text-sm">
                        <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-700">
                            {customer.phone}
                          </p>
                          <p className="text-xs text-slate-500">Số điện thoại</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-700 leading-relaxed">
                            {customer.address}
                          </p>
                          <p className="text-xs text-slate-500">Địa chỉ giao hàng</p>
                        </div>
                      </div>
                      {customer.note && (
                        <div className="flex items-start gap-2.5 text-sm border-t border-slate-200/50 pt-2 mt-2">
                          <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-slate-600 italic">
                              &ldquo;{customer.note}&rdquo;
                            </p>
                            <p className="text-xs text-slate-400">Ghi chú của khách</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Details Card */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-4 h-4 text-slate-400" />
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Chi tiết hóa đơn
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-slate-600 font-medium">
                              {item.product.name}{" "}
                              <span className="text-slate-400 font-normal">
                                x{item.quantity}
                              </span>
                            </span>
                            <span className="font-semibold text-slate-700">
                              {formatCurrency(
                                item.product.price * item.quantity
                              )}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-slate-200 pt-2.5 mt-2.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800">
                              Tổng hóa đơn tạm tính:
                            </span>
                            <span className="text-lg font-black text-teal-600">
                              {formatCurrency(total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Error display */}
                    {apiError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-xs font-semibold">
                        ❌ {apiError}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="p-5 border-t border-slate-100 bg-white">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold text-base shadow-lg shadow-teal-500/20 hover:shadow-teal-500/35 transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Đang gửi đơn hàng...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Xác nhận & Gửi đơn hàng
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ========== STEP 3: Success Screen ========== */}
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.82 }}
                  className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[420px]"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      damping: 11,
                      stiffness: 220,
                      delay: 0.1,
                    }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 shadow-xl shadow-green-500/20"
                  >
                    <Check className="w-9 h-9 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    Đặt hàng thành công!
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                    Đơn hàng của bạn đã được chuyển tới Admin quán thành công.
                  </p>
                  <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-4 my-4 max-w-xs">
                    <p className="text-xs text-teal-800 leading-relaxed font-medium">
                      💡 Quán sẽ kiểm tra, lập hóa đơn hoàn chỉnh và liên hệ lại
                      với bạn qua số điện thoại/Zalo trong ít phút nữa!
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleClose}
                    className="px-8 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Đóng & Quay lại
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

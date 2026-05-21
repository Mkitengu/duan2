"use client";

import { useState, useEffect, useRef } from "react";
import {
  Lock,
  Plus,
  Minus,
  Trash2,
  Edit3,
  Check,
  X,
  Clock,
  User,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  Copy,
  ExternalLink,
  RefreshCw,
  Search,
  LogOut,
  Sparkles,
  CheckCircle2,
  Trash,
  Coffee,
} from "lucide-react";
import { products, Product } from "@/data/products";
import { formatCurrency } from "@/utils/currency";
import { generateOrderMessage, copyToClipboard, openZaloDirect } from "@/utils/zalo";
import { motion, AnimatePresence } from "framer-motion";

// Admin default credentials
const ADMIN_PASSCODE = "admin123";
const DEFAULT_SHOP_PHONE = "0815633162";
const AUTH_KEY = "water-order-admin-auth-token";

interface ServerOrder {
  id: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    note: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: "pending" | "approved" | "cancelled";
  createdAt: string;
  updatedAt?: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  
  // Dashboard states
  const [orders, setOrders] = useState<ServerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Edit modal states
  const [editingOrder, setEditingOrder] = useState<ServerOrder | null>(null);
  const [editCustomer, setEditCustomer] = useState({ name: "", phone: "", address: "", note: "" });
  const [editItems, setEditItems] = useState<{ name: string; quantity: number; price: number }[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Zalo dispatch modal states
  const [dispatchOrder, setDispatchOrder] = useState<ServerOrder | null>(null);
  const [dispatchMessage, setDispatchMessage] = useState("");
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  // Auto-refresh interval ref
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const token = sessionStorage.getItem(AUTH_KEY);
    if (token === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      // Auto refresh every 15 seconds
      refreshIntervalRef.current = setInterval(() => {
        fetchOrders(true);
      }, 15000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      sessionStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Mã xác thực không chính xác!");
      setPasscode("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
  };

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Change order status directly
  const handleUpdateStatus = async (orderId: string, newStatus: "pending" | "approved" | "cancelled") => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Open Edit Modal
  const openEditModal = (order: ServerOrder) => {
    setEditingOrder(order);
    setEditCustomer({ ...order.customer });
    setEditItems([...order.items]);
    setSelectedProductToAdd("");
  };

  // Adjust item quantity in editor
  const handleEditQty = (index: number, delta: number) => {
    const updated = [...editItems];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index] = { ...updated[index], quantity: newQty };
    }
    setEditItems(updated);
  };

  // Edit price in editor
  const handleEditPrice = (index: number, value: number) => {
    const updated = [...editItems];
    updated[index] = { ...updated[index], price: Math.max(0, value) };
    setEditItems(updated);
  };

  // Add product to edited invoice
  const handleAddProductToInvoice = () => {
    if (!selectedProductToAdd) return;
    const foundProduct = products.find(p => p.id === Number(selectedProductToAdd));
    if (foundProduct) {
      // Check if product already in list
      const existingIndex = editItems.findIndex(item => item.name === foundProduct.name && !foundProduct.isCustom);
      if (existingIndex > -1) {
        const updated = [...editItems];
        updated[existingIndex].quantity += 1;
        setEditItems(updated);
      } else {
        setEditItems([
          ...editItems,
          {
            name: foundProduct.isCustom ? "Món nước tự chọn" : foundProduct.name,
            quantity: 1,
            price: foundProduct.price,
          },
        ]);
      }
    }
    setSelectedProductToAdd("");
  };

  // Save edits
  const handleSaveInvoiceEdits = async () => {
    if (!editingOrder) return;
    setIsSavingEdit(true);

    const calculatedTotal = editItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    try {
      const res = await fetch(`/api/orders/${editingOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: editCustomer,
          items: editItems,
          total: calculatedTotal,
        }),
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(orders.map(o => o.id === editingOrder.id ? updatedOrder : o));
        setEditingOrder(null);
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng này?")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== orderId));
      }
    } catch (error) {
      console.error("Failed to delete order:", error);
    }
  };

  // Open Zalo dispatch panel
  const handleOpenZaloDispatch = async (order: ServerOrder) => {
    // 1. First automatically approve the order on server
    if (order.status !== "approved") {
      await handleUpdateStatus(order.id, "approved");
    }

    // 2. Format custom Zalo invoice message
    const cleanItems = order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));
    
    // Custom formatted message
    const invoiceMsg = `HÓA ĐƠN XÁC NHẬN
====================
Mã đơn: ${order.id}
Khách hàng: ${order.customer.name}
SĐT: ${order.customer.phone}
Địa chỉ: ${order.customer.address}

Sản phẩm đã chọn:
${cleanItems.map(item => `• ${item.name} x${item.quantity} = ${formatCurrency(item.price * item.quantity)}`).join("\n")}

Tổng bill thanh toán: ${formatCurrency(order.total)}
${order.customer.note ? `Ghi chú: ${order.customer.note}\n` : ""}====================
Cảm ơn bạn đã ủng hộ quán! Đồ uống đang được giao đến bạn.`;

    // 3. Open modal
    setDispatchOrder(order);
    setDispatchMessage(invoiceMsg);
    setCopiedInvoice(false);
  };

  // Handle direct Zalo client dispatch
  const handleSendToCustomerZalo = async () => {
    if (!dispatchOrder) return;
    await copyToClipboard(dispatchMessage);
    await openZaloDirect(dispatchOrder.customer.phone, dispatchMessage);
    setCopiedInvoice(true);
  };

  // Handle direct Zalo shop dispatch
  const handleSendToShopZalo = async () => {
    await copyToClipboard(dispatchMessage);
    await openZaloDirect(DEFAULT_SHOP_PHONE, dispatchMessage);
    setCopiedInvoice(true);
  };

  const handleCopyInvoice = async () => {
    const success = await copyToClipboard(dispatchMessage);
    if (success) {
      setCopiedInvoice(true);
      setTimeout(() => setCopiedInvoice(false), 2000);
    }
  };

  // Filtering and Searching
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* ========== SCREEN 1: LOCK SCREEN ========== */}
      {!isAuthenticated ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-100 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Glow effects inside card */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center text-center mb-8 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center mb-4 shadow-lg shadow-teal-500/35 border border-white/20">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                AquaOrder Admin
              </h1>
              <p className="text-slate-400 text-xs mt-1 font-semibold uppercase tracking-wider">
                Màn hình khóa bảo mật
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Mã xác thực Admin
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Nhập mã pin..."
                  className="w-full text-center tracking-widest text-lg font-bold px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500 bg-slate-50/50 transition-all text-slate-700"
                />
              </div>

              {authError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 font-bold text-center"
                >
                  ⚠️ {authError}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold text-sm shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 transition-all"
              >
                Mở khóa hệ thống
              </motion.button>
            </form>
          </motion.div>
          <span className="text-xs text-slate-400 font-medium mt-6">
            Mật khẩu mặc định là: <span className="font-bold text-slate-500">admin123</span>
          </span>
        </div>
      ) : (
        /* ========== SCREEN 2: MAIN ADMIN DASHBOARD ========== */
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          {/* Dashboard Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-xl mb-8">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Coffee className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                  AquaOrder Dashboard
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 text-[10px] font-bold uppercase tracking-wider">
                    Admin
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Quản lý và lập hóa đơn Zalo đơn đặt nước
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Force Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchOrders()}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 text-slate-600 transition-colors flex items-center justify-center"
                title="Tải lại đơn hàng"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing || loading ? "animate-spin text-teal-500" : ""}`} />
              </motion.button>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-100 text-sm font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </motion.button>
            </div>
          </header>

          {/* Filtering and Search Controls */}
          <section className="bg-white/80 border border-slate-100 rounded-3xl p-5 shadow-xl mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {(["all", "pending", "approved", "cancelled"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4.5 py-2.5 rounded-2xl text-xs font-bold transition-all uppercase tracking-wider ${
                    filterStatus === status
                      ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-md shadow-teal-500/20"
                      : "bg-slate-50 border border-slate-200/60 hover:bg-slate-100 text-slate-500"
                  }`}
                >
                  {status === "all" && "Tất cả"}
                  {status === "pending" && "Chờ xử lý"}
                  {status === "approved" && "Đã duyệt"}
                  {status === "cancelled" && "Đã hủy"}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên, SĐT, mã đơn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50 placeholder:text-slate-400 text-slate-700"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </section>

          {/* Orders Counter Banner */}
          <div className="flex items-center gap-2 mb-4 ml-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Đơn hàng lọc được:
            </span>
            <span className="text-xs font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
              {filteredOrders.length} đơn
            </span>
          </div>

          {/* Main List Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm border border-slate-100 rounded-3xl shadow-xl">
              <RefreshCw className="w-10 h-10 animate-spin text-teal-500 mb-3" />
              <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider">
                Đang tải dữ liệu đơn hàng...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 border border-slate-100 rounded-3xl shadow-xl text-center px-4">
              <Clock className="w-14 h-14 text-slate-200 mb-3.5" />
              <p className="text-base font-bold text-slate-500">
                Không tìm thấy đơn đặt nước nào!
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Hệ thống chưa nhận được đơn hàng nào khớp với điều kiện lọc hiện tại.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-slate-100 hover:border-teal-200 rounded-3xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Card Top */}
                    <div>
                      {/* ID and Status */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black font-mono text-slate-400 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-lg">
                          {order.id}
                        </span>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              order.status === "pending"
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                : order.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                            }`}
                          >
                            {order.status === "pending" && "Chờ xử lý"}
                            {order.status === "approved" && "Đã duyệt"}
                            {order.status === "cancelled" && "Đã hủy"}
                          </span>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="bg-slate-50/50 border border-slate-200/40 rounded-2xl p-4.5 space-y-2.5 mb-4">
                        <div className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold">
                          <User className="w-4 h-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-slate-800 text-sm font-bold">{order.customer.name}</p>
                            <p className="text-[10px] text-slate-400 font-normal">Khách hàng</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold">
                          <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-slate-800 font-bold">{order.customer.phone}</p>
                            <p className="text-[10px] text-slate-400 font-normal">Số điện thoại</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold">
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-slate-700 leading-relaxed font-bold">{order.customer.address}</p>
                            <p className="text-[10px] text-slate-400 font-normal">Địa chỉ giao nước</p>
                          </div>
                        </div>
                        {order.customer.note && (
                          <div className="flex items-start gap-2.5 text-xs border-t border-slate-200/60 pt-2.5 mt-2.5 font-medium italic">
                            <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-slate-500 font-semibold leading-relaxed">
                                &ldquo;{order.customer.note}&rdquo;
                              </p>
                              <p className="text-[10px] text-slate-400 font-normal not-italic">
                                Ghi chú
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Items Invoice list */}
                      <div className="border-b border-slate-100 pb-3 mb-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
                          Đồ uống đặt mua:
                        </p>
                        <div className="space-y-1.5 ml-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-600 font-bold">
                                • {item.name}{" "}
                                <span className="text-slate-400 font-medium">x{item.quantity}</span>
                              </span>
                              <span className="text-slate-700">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom - Pricing & Actions */}
                    <div>
                      <div className="flex justify-between items-center mb-4 ml-1">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Tổng bill hóa đơn
                          </span>
                          <p className="text-lg font-black text-teal-600 tracking-tight mt-0.5">
                            {formatCurrency(order.total)}
                          </p>
                        </div>

                        {/* Timestamp */}
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Thời gian đặt
                          </span>
                          <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 border-t border-slate-100 pt-4">
                        {/* Primary Zalo Approval */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleOpenZaloDispatch(order)}
                          className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-black shadow-lg shadow-teal-500/20 hover:shadow-teal-500/35 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Duyệt & Gửi Zalo
                        </motion.button>

                        {/* Edit Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openEditModal(order)}
                          className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-600 hover:bg-slate-50/50 transition-colors flex items-center justify-center"
                          title="Sửa chi tiết hóa đơn"
                        >
                          <Edit3 className="w-4 h-4" />
                        </motion.button>

                        {/* Quick cancel/delete */}
                        {order.status !== "cancelled" ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleUpdateStatus(order.id, "cancelled")}
                            className="px-3.5 py-2.5 rounded-2xl border border-red-100 text-red-500 hover:bg-red-50/50 transition-colors flex items-center justify-center"
                            title="Hủy đơn hàng"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleDeleteOrder(order.id)}
                            className="px-3.5 py-2.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center"
                            title="Xóa vĩnh viễn đơn"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* ========== POPUP 1: INVOICE EDITOR MODAL ========== */}
      <AnimatePresence>
        {editingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingOrder(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.94, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative overflow-hidden z-10 max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">
                      Sửa chi tiết hóa đơn
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold tracking-wider font-mono">
                      {editingOrder.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto py-5 space-y-5">
                {/* 1. Customer details */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                    Thông tin giao hàng
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 ml-1">Tên khách</label>
                      <input
                        type="text"
                        value={editCustomer.name}
                        onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 ml-1">SĐT khách</label>
                      <input
                        type="tel"
                        value={editCustomer.phone}
                        onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-500 ml-1">Địa chỉ giao nước</label>
                      <input
                        type="text"
                        value={editCustomer.address}
                        onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-500 ml-1">Ghi chú của khách</label>
                      <input
                        type="text"
                        value={editCustomer.note}
                        onChange={(e) => setEditCustomer({ ...editCustomer, note: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Items list editor */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                    Đồ uống đặt mua
                  </h4>
                  <div className="space-y-2">
                    {editItems.length === 0 ? (
                      <p className="text-xs font-bold text-slate-400 italic text-center py-4">
                        Chưa có sản phẩm nào! Chọn sản phẩm phía dưới để thêm.
                      </p>
                    ) : (
                      editItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-teal-200 transition-colors"
                        >
                          {/* Name & price input */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đơn giá:</span>
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) => handleEditPrice(idx, Number(e.target.value))}
                                className="w-20 px-2 py-0.5 rounded border border-slate-200 focus:outline-none focus:border-teal-400 bg-white text-[11px] font-bold text-slate-700 text-center"
                              />
                              <span className="text-[10px] font-bold text-slate-400">đ</span>
                            </div>
                          </div>

                          {/* Quantity selector */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditQty(idx, -1)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-red-300 hover:text-red-500 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-extrabold text-slate-700">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleEditQty(idx, 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-teal-300 hover:text-teal-600 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleEditQty(idx, -item.quantity)}
                            className="p-2.5 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all flex items-center justify-center"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Add new product option */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                    Thêm đồ uống vào hóa đơn
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedProductToAdd}
                      onChange={(e) => setSelectedProductToAdd(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      <option value="">-- Chọn món nước từ menu --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {formatCurrency(p.price)}
                        </option>
                      ))}
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddProductToInvoice}
                      disabled={!selectedProductToAdd}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold text-xs shadow-md shadow-teal-500/10 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm món
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Footer Calculations & Actions */}
              <div className="border-t border-slate-100 pt-4 space-y-4 bg-white">
                {/* Real-time sum calculation */}
                <div className="flex justify-between items-center px-1">
                  <span className="font-bold text-sm text-slate-700">Tổng hóa đơn mới:</span>
                  <span className="text-lg font-black text-teal-600">
                    {formatCurrency(
                      editItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
                    )}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    disabled={isSavingEdit}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-50 transition-colors uppercase tracking-wider"
                  >
                    Huỷ bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveInvoiceEdits}
                    disabled={isSavingEdit || editItems.length === 0}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold text-xs shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingEdit ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========== POPUP 2: ZALO DISPATCH MODAL ========== */}
      <AnimatePresence>
        {dispatchOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDispatchOrder(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.94, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden z-10 flex flex-col"
            >
              {/* Glow effects inside card */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">
                      Đã duyệt & Lập hóa đơn
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold">
                      Gửi hóa đơn Zalo tới khách hàng
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDispatchOrder(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Message preview details */}
              <div className="py-5 space-y-4 relative z-10">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                      Nội dung hóa đơn xác thực
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyInvoice}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all ${
                        copiedInvoice
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {copiedInvoice ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Đã copy hóa đơn!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy nội dung
                        </>
                      )}
                    </motion.button>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-48 overflow-y-auto">
                    <pre className="text-[10px] font-bold text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
                      {dispatchMessage}
                    </pre>
                  </div>
                </div>

                {/* Dispatch options */}
                <div className="space-y-3">
                  {/* Option 1: Send to Customer Zalo */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendToCustomerZalo}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#0068FF] text-white font-bold text-xs shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-extrabold text-sm">Gửi Zalo cho Khách hàng</p>
                      <p className="text-[10px] text-blue-200 mt-0.5 font-semibold">
                        Mở chat Zalo SĐT khách ({dispatchOrder.customer.phone})
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto opacity-70 flex-shrink-0" />
                  </motion.button>

                  {/* Option 2: Send to Shop Default Zalo */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendToShopZalo}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-xs hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-extrabold text-sm">Gửi Zalo cho Quán (Pha chế)</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                        Mở Zalo quán ({DEFAULT_SHOP_PHONE}) báo pha chế
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto opacity-50 flex-shrink-0" />
                  </motion.button>
                </div>

                {/* Instructions */}
                <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                    📌 <strong>Quy trình gửi:</strong> Bấm nút gửi → Hệ thống tự
                    động sao chép hóa đơn và mở chat Zalo số đó → Click vào khung
                    chat Zalo và nhấn tổ hợp phím <strong>Ctrl+V</strong> (hoặc nhấn giữ dán trên điện thoại) và gửi hóa đơn.
                  </p>
                </div>
              </div>

              {/* Close action */}
              <div className="border-t border-slate-100 pt-4 flex justify-end relative z-10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDispatchOrder(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Hoàn thành
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

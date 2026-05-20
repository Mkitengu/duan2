import { formatCurrency } from "./currency";

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  note: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

// Shop's Zalo phone number - change this to your shop's number
const SHOP_PHONE = "0123456789";

export function generateOrderMessage(
  items: OrderItem[],
  customer: CustomerInfo,
  total: number
): string {
  const itemLines = items
    .map(
      (item) =>
        `• ${item.name} x${item.quantity} = ${formatCurrency(item.price * item.quantity)}`
    )
    .join("\n");

  const message = `====================
ĐƠN ĐẶT NƯỚC
====================

Khách hàng: ${customer.name}
SĐT: ${customer.phone}
Địa chỉ: ${customer.address}

Sản phẩm:
${itemLines}

────────────────
Tổng bill: ${formatCurrency(total)}
────────────────

${customer.note ? `Ghi chú: ${customer.note}` : ""}
====================`;

  return message;
}

export function openZaloOrder(message: string): void {
  const encodedMessage = encodeURIComponent(message);

  // Try zalo.me/share first for sharing text content
  const zaloUrl = `https://zalo.me/${SHOP_PHONE}`;

  // Open Zalo with the shop number - user can paste the message
  // Also copy message to clipboard for easy pasting
  if (navigator.clipboard) {
    navigator.clipboard.writeText(message).catch(() => {
      // Fallback: do nothing if clipboard fails
    });
  }

  window.open(zaloUrl, "_blank");
}

export function getZaloShareUrl(message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://zalo.me/share?text=${encodedMessage}`;
}

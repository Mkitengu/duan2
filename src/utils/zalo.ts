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
export const SHOP_PHONE = "0123456789";

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

  const message = `ĐƠN ĐẶT NƯỚC
====================
Khách hàng: ${customer.name}
SĐT: ${customer.phone}
Địa chỉ: ${customer.address}

Sản phẩm:
${itemLines}

Tổng bill: ${formatCurrency(total)}
${customer.note ? `\nGhi chú: ${customer.note}` : ""}
====================`;

  return message;
}

/**
 * Copy message to clipboard
 * Returns true if successful
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for non-secure contexts (HTTP)
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textArea);
    return success;
  } catch {
    return false;
  }
}

/**
 * Open Zalo share dialog with pre-filled message text.
 * This is the most reliable way to send a message via Zalo
 * because it pre-fills the text content in Zalo's share UI.
 */
export function openZaloShare(message: string): void {
  const encodedMessage = encodeURIComponent(message);
  const url = `https://zalo.me/share?text=${encodedMessage}`;
  window.open(url, "_blank");
}

/**
 * Open direct Zalo chat with the shop phone number.
 * User will need to paste the message manually.
 */
export function openZaloChat(): void {
  const url = `https://zalo.me/${SHOP_PHONE}`;
  window.open(url, "_blank");
}

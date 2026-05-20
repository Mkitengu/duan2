import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AquaOrder - Đặt Nước Online Nhanh Chóng",
  description:
    "Đặt nước uống online nhanh chóng, thanh toán dễ dàng qua Zalo. Trà sữa, cà phê, nước ép và nhiều loại đồ uống khác.",
  keywords: [
    "đặt nước",
    "order nước",
    "trà sữa",
    "cà phê",
    "nước ép",
    "đồ uống",
    "giao hàng",
  ],
  openGraph: {
    title: "AquaOrder - Đặt Nước Online",
    description: "Đặt nước uống online nhanh chóng, thanh toán qua Zalo",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

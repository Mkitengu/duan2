import { NextResponse } from "next/server";
import { getOrders, saveOrder } from "@/utils/db";

// GET /api/orders - Get all orders (for Admin Dashboard)
export async function GET() {
  try {
    const orders = await getOrders();
    // Prevent client caching of dynamic order data
    return NextResponse.json(orders, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("GET orders API error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST /api/orders - Save new customer order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, items, total } = body;

    // Validate request body
    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return NextResponse.json(
        { error: "Missing required customer information" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    const savedOrder = await saveOrder({
      customer,
      items,
      total,
    });

    return NextResponse.json(savedOrder, { status: 201 });
  } catch (error) {
    console.error("POST save order API error:", error);
    return NextResponse.json({ error: "Failed to process and save order" }, { status: 500 });
  }
}

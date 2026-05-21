import { NextResponse } from "next/server";
import { updateOrder, deleteOrder } from "@/utils/db";

// PATCH /api/orders/[id] - Update specific order (for Admin edit/approval/cancel)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateOrder(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(`PATCH order ${request.url} API error:`, error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

// DELETE /api/orders/[id] - Remove specific order
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteOrder(id);
    
    if (!success) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE order ${request.url} API error:`, error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}

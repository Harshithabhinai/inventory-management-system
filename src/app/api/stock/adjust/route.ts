import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, stockTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, type, quantity, reason, notes } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      return NextResponse.json({ error: "Quantity must be a valid positive number" }, { status: 400 });
    }

    const prodId = parseInt(productId, 10);
    const [product] = await db.select().from(products).where(eq(products.id, prodId));
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const prevStock = product.stockQuantity;
    let newStock = prevStock;
    let change = 0;

    if (type === "ADD") {
      change = qty;
      newStock = prevStock + qty;
    } else if (type === "SUBTRACT") {
      if (qty > prevStock) {
        return NextResponse.json(
          { error: `Cannot deduct ${qty} items. Only ${prevStock} currently in stock.` },
          { status: 400 }
        );
      }
      change = -qty;
      newStock = prevStock - qty;
    } else if (type === "SET") {
      change = qty - prevStock;
      newStock = qty;
    } else {
      return NextResponse.json({ error: "Invalid adjustment type. Must be ADD, SUBTRACT, or SET" }, { status: 400 });
    }

    const result = await db.transaction(async (tx: any) => {
      // 1. Update product
      const [updated] = await tx
        .update(products)
        .set({
          stockQuantity: newStock,
          updatedAt: new Date(),
        })
        .where(eq(products.id, prodId))
        .returning();

      // 2. Insert transaction
      await tx.insert(stockTransactions).values({
        productId: prodId,
        transactionType: "ADJUSTMENT",
        quantityChange: change,
        previousStock: prevStock,
        newStock: newStock,
        referenceId: reason || "Manual Audit",
        notes: notes?.trim() || `Manual adjustment: ${reason || "Audit"}`,
      });

      return updated;
    });

    return NextResponse.json({
      message: "Stock adjusted successfully",
      previousStock: prevStock,
      newStock: newStock,
      product: result,
    });
  } catch (error: any) {
    console.error("Stock adjustment error:", error);
    return NextResponse.json({ error: error.message || "Failed to adjust stock" }, { status: 500 });
  }
}

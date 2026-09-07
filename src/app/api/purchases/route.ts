import { NextResponse } from "next/server";
import { db } from "@/db";
import { purchases, purchaseItems, products, suppliers, stockTransactions } from "@/db/schema";
import { loadDemoData } from "@/lib/demo-data";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select({
        id: purchases.id,
        purchaseNumber: purchases.purchaseNumber,
        supplierId: purchases.supplierId,
        supplierName: suppliers.name,
        purchaseDate: purchases.purchaseDate,
        totalAmount: purchases.totalAmount,
        status: purchases.status,
        notes: purchases.notes,
        createdAt: purchases.createdAt,
      })
      .from(purchases)
      .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
      .orderBy(desc(purchases.purchaseDate), desc(purchases.id));

    return NextResponse.json(list);
  } catch (error: any) {
    console.error("Error fetching purchases:", error);
    const demo = await loadDemoData();
    return NextResponse.json(demo.purchases ?? []);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supplierId, purchaseNumber, purchaseDate, notes, items } = body;

    if (!supplierId) {
      return NextResponse.json({ error: "Supplier is required" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required in the purchase" }, { status: 400 });
    }

    const supId = parseInt(supplierId, 10);
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, supId));
    if (!supplier) {
      return NextResponse.json({ error: "Selected supplier not found" }, { status: 404 });
    }

    // Auto-generate purchase number if omitted
    const poNumber = purchaseNumber?.trim() || `PO-${Date.now().toString().slice(-6)}`;

    // Validate items
    for (const item of items) {
      if (!item.productId) {
        return NextResponse.json({ error: "Product ID is missing on an item" }, { status: 400 });
      }
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return NextResponse.json({ error: "Item quantity must be greater than zero" }, { status: 400 });
      }
      const price = parseFloat(item.unitPrice);
      if (isNaN(price) || price < 0) {
        return NextResponse.json({ error: "Item unit price must be valid" }, { status: 400 });
      }
    }

    // Compute total
    let total = 0;
    for (const item of items) {
      total += parseInt(item.quantity, 10) * parseFloat(item.unitPrice);
    }

    // Execute atomic transaction for Purchase + Stock Update + Stock Transactions
    const result = await db.transaction(async (tx: any) => {
      // 1. Create Purchase
      const [newPurchase] = await tx
        .insert(purchases)
        .values({
          purchaseNumber: poNumber,
          supplierId: supId,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
          totalAmount: total.toFixed(2),
          status: "Completed",
          notes: notes?.trim() || null,
        })
        .returning();

      // 2. Process each item
      for (const item of items) {
        const prodId = parseInt(item.productId, 10);
        const qty = parseInt(item.quantity, 10);
        const unitPrice = parseFloat(item.unitPrice);
        const lineTotal = qty * unitPrice;

        // Fetch current product stock
        const [product] = await tx.select().from(products).where(eq(products.id, prodId));
        if (!product) {
          throw new Error(`Product with ID ${prodId} not found`);
        }

        const prevStock = product.stockQuantity;
        const newStock = prevStock + qty;

        // Insert Purchase Item
        await tx.insert(purchaseItems).values({
          purchaseId: newPurchase.id,
          productId: prodId,
          quantity: qty,
          unitPrice: unitPrice.toFixed(2),
          totalPrice: lineTotal.toFixed(2),
        });

        // Update Product Stock and Cost Price
        await tx
          .update(products)
          .set({
            stockQuantity: newStock,
            costPrice: unitPrice.toFixed(2), // update latest cost
            updatedAt: new Date(),
          })
          .where(eq(products.id, prodId));

        // Record Stock Transaction
        await tx.insert(stockTransactions).values({
          productId: prodId,
          transactionType: "PURCHASE_IN",
          quantityChange: qty,
          previousStock: prevStock,
          newStock: newStock,
          referenceId: poNumber,
          notes: `Purchase from ${supplier.name} (${poNumber})`,
        });
      }

      return newPurchase;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Purchase creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create purchase" }, { status: 500 });
  }
}

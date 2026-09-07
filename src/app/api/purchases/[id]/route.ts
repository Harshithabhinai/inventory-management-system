import { NextResponse } from "next/server";
import { db } from "@/db";
import { purchases, purchaseItems, products, suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const poId = parseInt(id, 10);
    if (isNaN(poId)) {
      return NextResponse.json({ error: "Invalid purchase ID" }, { status: 400 });
    }

    const [purchase] = await db
      .select({
        id: purchases.id,
        purchaseNumber: purchases.purchaseNumber,
        supplierId: purchases.supplierId,
        supplierName: suppliers.name,
        supplierEmail: suppliers.email,
        supplierPhone: suppliers.phone,
        supplierAddress: suppliers.address,
        purchaseDate: purchases.purchaseDate,
        totalAmount: purchases.totalAmount,
        status: purchases.status,
        notes: purchases.notes,
        createdAt: purchases.createdAt,
      })
      .from(purchases)
      .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
      .where(eq(purchases.id, poId));

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    const items = await db
      .select({
        id: purchaseItems.id,
        productId: purchaseItems.productId,
        productName: products.name,
        sku: products.sku,
        quantity: purchaseItems.quantity,
        unitPrice: purchaseItems.unitPrice,
        totalPrice: purchaseItems.totalPrice,
      })
      .from(purchaseItems)
      .leftJoin(products, eq(purchaseItems.productId, products.id))
      .where(eq(purchaseItems.purchaseId, poId));

    return NextResponse.json({ ...purchase, items });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch purchase details" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { sales, saleItems, products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const saleId = parseInt(id, 10);
    if (isNaN(saleId)) {
      return NextResponse.json({ error: "Invalid sale ID" }, { status: 400 });
    }

    const [sale] = await db.select().from(sales).where(eq(sales.id, saleId));
    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    const items = await db
      .select({
        id: saleItems.id,
        productId: saleItems.productId,
        productName: products.name,
        sku: products.sku,
        quantity: saleItems.quantity,
        unitPrice: saleItems.unitPrice,
        totalPrice: saleItems.totalPrice,
      })
      .from(saleItems)
      .leftJoin(products, eq(saleItems.productId, products.id))
      .where(eq(saleItems.saleId, saleId));

    return NextResponse.json({ ...sale, items });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch sale" }, { status: 500 });
  }
}

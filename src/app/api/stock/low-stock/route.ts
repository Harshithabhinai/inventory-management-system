import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories, suppliers } from "@/db/schema";
import { eq, lte, asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        categoryId: products.categoryId,
        categoryName: categories.name,
        price: products.price,
        costPrice: products.costPrice,
        stockQuantity: products.stockQuantity,
        reorderLevel: products.reorderLevel,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(lte(products.stockQuantity, products.reorderLevel))
      .orderBy(asc(products.stockQuantity));

    const enriched = list.map((p: any) => ({
      ...p,
      deficit: Math.max(0, p.reorderLevel - p.stockQuantity + 5), // suggested reorder qty
      status: p.stockQuantity <= 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
    }));

    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error("Error fetching low stock:", error);
    return NextResponse.json({ error: "Failed to fetch low stock alerts" }, { status: 500 });
  }
}

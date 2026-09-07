import { NextResponse } from "next/server";
import { db } from "@/db";
import { sales, saleItems, products } from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const [overview] = await db
      .select({
        totalRevenue: sql<string>`coalesce(sum(${sales.totalAmount}), 0)`,
        totalSalesCount: sql<number>`count(*)::int`,
        averageOrderValue: sql<string>`coalesce(avg(${sales.totalAmount}), 0)`,
      })
      .from(sales);

    // Top selling products
    const topProducts = await db
      .select({
        productId: saleItems.productId,
        productName: products.name,
        sku: products.sku,
        unitsSold: sql<number>`coalesce(sum(${saleItems.quantity}), 0)::int`,
        revenue: sql<string>`coalesce(sum(${saleItems.totalPrice}), 0)`,
      })
      .from(saleItems)
      .leftJoin(products, eq(saleItems.productId, products.id))
      .groupBy(saleItems.productId, products.name, products.sku)
      .orderBy(desc(sql`sum(${saleItems.quantity})`))
      .limit(8);

    // Payment methods breakdown
    const paymentMethods = await db
      .select({
        method: sales.paymentMethod,
        count: sql<number>`count(*)::int`,
        total: sql<string>`coalesce(sum(${sales.totalAmount}), 0)`,
      })
      .from(sales)
      .groupBy(sales.paymentMethod);

    return NextResponse.json({
      totalRevenue: parseFloat(overview?.totalRevenue || "0").toFixed(2),
      totalSalesCount: overview?.totalSalesCount || 0,
      averageOrderValue: parseFloat(overview?.averageOrderValue || "0").toFixed(2),
      topProducts,
      paymentMethods,
    });
  } catch (error: any) {
    console.error("Sales report error:", error);
    return NextResponse.json({ error: "Failed to generate sales report" }, { status: 500 });
  }
}

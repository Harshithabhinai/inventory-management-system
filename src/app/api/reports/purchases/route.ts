import { NextResponse } from "next/server";
import { db } from "@/db";
import { purchases, suppliers } from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const [overview] = await db
      .select({
        totalSpent: sql<string>`coalesce(sum(${purchases.totalAmount}), 0)`,
        totalPurchasesCount: sql<number>`count(*)::int`,
        averagePurchaseValue: sql<string>`coalesce(avg(${purchases.totalAmount}), 0)`,
      })
      .from(purchases);

    const supplierBreakdown = await db
      .select({
        supplierId: suppliers.id,
        supplierName: suppliers.name,
        contactPerson: suppliers.contactPerson,
        purchaseCount: sql<number>`count(${purchases.id})::int`,
        totalSpent: sql<string>`coalesce(sum(${purchases.totalAmount}), 0)`,
      })
      .from(suppliers)
      .leftJoin(purchases, eq(suppliers.id, purchases.supplierId))
      .groupBy(suppliers.id, suppliers.name, suppliers.contactPerson)
      .orderBy(desc(sql`coalesce(sum(${purchases.totalAmount}), 0)`));

    return NextResponse.json({
      totalSpent: parseFloat(overview?.totalSpent || "0").toFixed(2),
      totalPurchasesCount: overview?.totalPurchasesCount || 0,
      averagePurchaseValue: parseFloat(overview?.averagePurchaseValue || "0").toFixed(2),
      supplierBreakdown,
    });
  } catch (error: any) {
    console.error("Purchases report error:", error);
    return NextResponse.json({ error: "Failed to generate purchases report" }, { status: 500 });
  }
}

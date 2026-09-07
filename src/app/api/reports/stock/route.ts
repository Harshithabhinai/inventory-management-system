import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";

export async function GET() {
  try {
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        categoryName: categories.name,
        price: products.price,
        costPrice: products.costPrice,
        stockQuantity: products.stockQuantity,
        reorderLevel: products.reorderLevel,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(asc(products.name));

    let totalRetailValue = 0;
    let totalCostValue = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const p of allProducts) {
      const stock = p.stockQuantity;
      const price = parseFloat(p.price || "0");
      const cost = parseFloat(p.costPrice || "0");

      totalRetailValue += stock * price;
      totalCostValue += stock * cost;

      if (stock <= 0) {
        outOfStockCount++;
      } else if (stock <= p.reorderLevel) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    }

    const potentialProfit = Math.max(0, totalRetailValue - totalCostValue);
    const profitMarginPercent = totalRetailValue > 0 ? ((potentialProfit / totalRetailValue) * 100).toFixed(1) : "0.0";

    return NextResponse.json({
      totalProducts: allProducts.length,
      totalRetailValue: totalRetailValue.toFixed(2),
      totalCostValue: totalCostValue.toFixed(2),
      potentialProfit: potentialProfit.toFixed(2),
      profitMarginPercent,
      stockHealth: {
        inStock: inStockCount,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
      },
      products: allProducts.map((p: any) => ({
        ...p,
        totalValuation: (p.stockQuantity * parseFloat(p.price || "0")).toFixed(2),
        status: p.stockQuantity <= 0 ? "OUT_OF_STOCK" : p.stockQuantity <= p.reorderLevel ? "LOW_STOCK" : "HEALTHY",
      })),
    });
  } catch (error: any) {
    console.error("Stock report error:", error);
    return NextResponse.json({ error: "Failed to generate stock report" }, { status: 500 });
  }
}

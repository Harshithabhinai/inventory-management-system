import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories, sales, purchases, suppliers, stockTransactions } from "@/db/schema";
import { loadDemoData } from "@/lib/demo-data";
import { sql, desc, lte, eq } from "drizzle-orm";

export async function GET() {
  try {
    // 1. Total products & total stock
    const [prodStats] = await db
      .select({
        totalProducts: sql<number>`count(*)::int`,
        totalStock: sql<number>`coalesce(sum(${products.stockQuantity}), 0)::int`,
      })
      .from(products);

    // 2. Low stock count
    const [lowStockStats] = await db
      .select({
        lowStockCount: sql<number>`count(*)::int`,
      })
      .from(products)
      .where(lte(products.stockQuantity, products.reorderLevel));

    // 3. Total sales amount
    const [salesStats] = await db
      .select({
        totalSales: sql<string>`coalesce(sum(${sales.totalAmount}), 0)`,
        countSales: sql<number>`count(*)::int`,
      })
      .from(sales);

    // 4. Total purchases amount
    const [purchasesStats] = await db
      .select({
        totalPurchases: sql<string>`coalesce(sum(${purchases.totalAmount}), 0)`,
        countPurchases: sql<number>`count(*)::int`,
      })
      .from(purchases);

    // 5. Recent 5 sales
    const recentSales = await db
      .select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        customerName: sales.customerName,
        saleDate: sales.saleDate,
        totalAmount: sales.totalAmount,
        status: sales.status,
      })
      .from(sales)
      .orderBy(desc(sales.saleDate))
      .limit(5);

    // 6. Recent 5 purchases
    const recentPurchases = await db
      .select({
        id: purchases.id,
        purchaseNumber: purchases.purchaseNumber,
        supplierName: suppliers.name,
        purchaseDate: purchases.purchaseDate,
        totalAmount: purchases.totalAmount,
        status: purchases.status,
      })
      .from(purchases)
      .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
      .orderBy(desc(purchases.purchaseDate))
      .limit(5);

    // 7. Critical Low Stock Products
    const lowStockList = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        stockQuantity: products.stockQuantity,
        reorderLevel: products.reorderLevel,
        price: products.price,
      })
      .from(products)
      .where(lte(products.stockQuantity, products.reorderLevel))
      .orderBy(products.stockQuantity)
      .limit(6);

    // 8. Category Stock Breakdown
    const categoryDistribution = await db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        productCount: sql<number>`count(${products.id})::int`,
        totalStock: sql<number>`coalesce(sum(${products.stockQuantity}), 0)::int`,
        inventoryValue: sql<string>`coalesce(sum(${products.stockQuantity} * ${products.price}), 0)`,
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .groupBy(categories.id, categories.name)
      .orderBy(desc(sql`coalesce(sum(${products.stockQuantity}), 0)`));

    // 9. Recent Stock Transactions
    const recentTransactions = await db
      .select({
        id: stockTransactions.id,
        productName: products.name,
        transactionType: stockTransactions.transactionType,
        quantityChange: stockTransactions.quantityChange,
        newStock: stockTransactions.newStock,
        referenceId: stockTransactions.referenceId,
        createdAt: stockTransactions.createdAt,
      })
      .from(stockTransactions)
      .leftJoin(products, eq(stockTransactions.productId, products.id))
      .orderBy(desc(stockTransactions.createdAt))
      .limit(6);

    return NextResponse.json({
      totalProducts: prodStats?.totalProducts || 0,
      totalStock: prodStats?.totalStock || 0,
      lowStockCount: lowStockStats?.lowStockCount || 0,
      totalSales: parseFloat(salesStats?.totalSales || "0").toFixed(2),
      totalPurchases: parseFloat(purchasesStats?.totalPurchases || "0").toFixed(2),
      countSales: salesStats?.countSales || 0,
      countPurchases: purchasesStats?.countPurchases || 0,
      recentSales,
      recentPurchases,
      lowStockList,
      categoryDistribution,
      recentTransactions,
    });
  } catch (error: any) {
    console.error("Dashboard report error:", error);
    const demo = await loadDemoData();
    const productsList = demo.products ?? [];
    const totalProducts = productsList.length;
    const totalStock = productsList.reduce((sum: number, product: any) => sum + Number(product.stockQuantity ?? 0), 0);
    const lowStockList = productsList.filter((product: any) => Number(product.stockQuantity ?? 0) <= Number(product.reorderLevel ?? 0));
    const totalSales = (demo.sales ?? []).reduce((sum: number, sale: any) => sum + Number(sale.totalAmount ?? 0), 0);
    const totalPurchases = (demo.purchases ?? []).reduce((sum: number, purchase: any) => sum + Number(purchase.totalAmount ?? 0), 0);

    return NextResponse.json({
      totalProducts,
      totalStock,
      lowStockCount: lowStockList.length,
      totalSales: totalSales.toFixed(2),
      totalPurchases: totalPurchases.toFixed(2),
      countSales: (demo.sales ?? []).length,
      countPurchases: (demo.purchases ?? []).length,
      recentSales: (demo.sales ?? []).slice(0, 5),
      recentPurchases: (demo.purchases ?? []).slice(0, 5),
      lowStockList: lowStockList.slice(0, 6).map((product: any) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        stockQuantity: product.stockQuantity,
        reorderLevel: product.reorderLevel,
        price: product.price,
      })),
      categoryDistribution: (demo.categories ?? []).map((category: any) => {
        const categoryProducts = productsList.filter((product: any) => Number(product.categoryId ?? 0) === Number(category.id));
        return {
          categoryId: category.id,
          categoryName: category.name,
          productCount: categoryProducts.length,
          totalStock: categoryProducts.reduce((sum: number, product: any) => sum + Number(product.stockQuantity ?? 0), 0),
          inventoryValue: categoryProducts.reduce((sum: number, product: any) => sum + Number(product.stockQuantity ?? 0) * Number(product.price ?? 0), 0).toFixed(2),
        };
      }),
      recentTransactions: (demo.transactions ?? []).slice(0, 6),
    });
  }
}

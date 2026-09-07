import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories, stockTransactions } from "@/db/schema";
import { loadDemoData } from "@/lib/demo-data";
import { eq, ilike, or, and, lte, desc, asc, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const categoryId = searchParams.get("categoryId");
    const lowStockOnly = searchParams.get("lowStock") === "true";
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.sku, `%${search}%`),
          ilike(products.description, `%${search}%`)
        )
      );
    }

    if (categoryId && categoryId !== "all") {
      const catId = parseInt(categoryId, 10);
      if (!isNaN(catId)) {
        conditions.push(eq(products.categoryId, catId));
      }
    }

    if (lowStockOnly) {
      conditions.push(lte(products.stockQuantity, products.reorderLevel));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

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
        description: products.description,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause)
      .orderBy(
        sortBy === "stock"
          ? sortOrder === "desc"
            ? desc(products.stockQuantity)
            : asc(products.stockQuantity)
          : sortBy === "price"
          ? sortOrder === "desc"
            ? desc(products.price)
            : asc(products.price)
          : sortBy === "createdAt"
          ? sortOrder === "desc"
            ? desc(products.createdAt)
            : asc(products.createdAt)
          : sortOrder === "desc"
          ? desc(products.name)
          : asc(products.name)
      );

    return NextResponse.json(list);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    const demo = await loadDemoData();
    return NextResponse.json(demo.products ?? []);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      sku,
      categoryId,
      price,
      costPrice = "0.00",
      stockQuantity = 0,
      reorderLevel = 5,
      description,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    if (!sku || !sku.trim()) {
      return NextResponse.json({ error: "SKU is required" }, { status: 400 });
    }

    const cleanSku = sku.trim().toUpperCase();

    // Check SKU uniqueness
    const [existing] = await db.select().from(products).where(eq(products.sku, cleanSku));
    if (existing) {
      return NextResponse.json({ error: `SKU '${cleanSku}' already exists. Please use a unique SKU.` }, { status: 400 });
    }

    const initStock = Math.max(0, parseInt(stockQuantity, 10) || 0);
    const reorder = Math.max(0, parseInt(reorderLevel, 10) || 5);
    const parsedPrice = parseFloat(price) || 0;
    const parsedCost = parseFloat(costPrice) || 0;

    const [createdProduct] = await db
      .insert(products)
      .values({
        name: name.trim(),
        sku: cleanSku,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        price: parsedPrice.toFixed(2),
        costPrice: parsedCost.toFixed(2),
        stockQuantity: initStock,
        reorderLevel: reorder,
        description: description?.trim() || null,
      })
      .returning();

    // If initial stock is greater than 0, create stock transaction
    if (initStock > 0) {
      await db.insert(stockTransactions).values({
        productId: createdProduct.id,
        transactionType: "INITIAL",
        quantityChange: initStock,
        previousStock: 0,
        newStock: initStock,
        referenceId: "INITIAL-SETUP",
        notes: "Initial inventory onboarding",
      });
    }

    return NextResponse.json(createdProduct, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories, stockTransactions, saleItems, purchaseItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const prodId = parseInt(id, 10);
    if (isNaN(prodId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const [product] = await db
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
      .where(eq(products.id, prodId));

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get recent 10 transactions for this product
    const transactions = await db
      .select()
      .from(stockTransactions)
      .where(eq(stockTransactions.productId, prodId))
      .orderBy(desc(stockTransactions.createdAt))
      .limit(10);

    return NextResponse.json({ ...product, recentTransactions: transactions });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const prodId = parseInt(id, 10);
    if (isNaN(prodId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, sku, categoryId, price, costPrice, reorderLevel, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    if (!sku || !sku.trim()) {
      return NextResponse.json({ error: "SKU is required" }, { status: 400 });
    }

    const cleanSku = sku.trim().toUpperCase();

    // Check SKU collision with other products
    const [existingWithSku] = await db
      .select()
      .from(products)
      .where(eq(products.sku, cleanSku));

    if (existingWithSku && existingWithSku.id !== prodId) {
      return NextResponse.json({ error: `SKU '${cleanSku}' is already used by another product` }, { status: 400 });
    }

    const [updated] = await db
      .update(products)
      .set({
        name: name.trim(),
        sku: cleanSku,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        price: parseFloat(price || 0).toFixed(2),
        costPrice: parseFloat(costPrice || 0).toFixed(2),
        reorderLevel: Math.max(0, parseInt(reorderLevel, 10) || 0),
        description: description?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(products.id, prodId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const prodId = parseInt(id, 10);
    if (isNaN(prodId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Safety check: Has this product been involved in sales or purchases?
    const [hasSale] = await db.select().from(saleItems).where(eq(saleItems.productId, prodId)).limit(1);
    if (hasSale) {
      return NextResponse.json(
        { error: "Cannot delete this product because historical sales transactions reference it. Keep it for audit logs or adjust stock to 0." },
        { status: 400 }
      );
    }

    const [hasPurchase] = await db.select().from(purchaseItems).where(eq(purchaseItems.productId, prodId)).limit(1);
    if (hasPurchase) {
      return NextResponse.json(
        { error: "Cannot delete this product because historical purchase records reference it." },
        { status: 400 }
      );
    }

    // Delete stock transactions
    await db.delete(stockTransactions).where(eq(stockTransactions.productId, prodId));

    const [deleted] = await db.delete(products).where(eq(products.id, prodId)).returning();
    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully", id: prodId });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

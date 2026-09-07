import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { loadDemoData } from "@/lib/demo-data";
import { eq, sql, desc, asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        createdAt: categories.createdAt,
        productCount: sql<number>`count(${products.id})::int`,
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .groupBy(categories.id)
      .orderBy(asc(categories.name));

    return NextResponse.json(list);
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    const demo = await loadDemoData();
    const categoryCounts: Record<number, number> = {};
    for (const product of demo.products ?? []) {
      const categoryId = Number(product.categoryId ?? 0);
      if (!categoryId) continue;
      categoryCounts[categoryId] = (categoryCounts[categoryId] ?? 0) + 1;
    }

    return NextResponse.json(
      (demo.categories ?? []).map((category: any) => ({
        ...category,
        productCount: categoryCounts[Number(category.id)] ?? 0,
      }))
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const [created] = await db
      .insert(categories)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
    }
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

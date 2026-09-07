import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const catId = parseInt(id, 10);
    if (isNaN(catId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [category] = await db.select().from(categories).where(eq(categories.id, catId));
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const catId = parseInt(id, 10);
    if (isNaN(catId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [updated] = await db
      .update(categories)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .where(eq(categories.id, catId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const catId = parseInt(id, 10);
    if (isNaN(catId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Check if category is used by products
    const [associated] = await db.select().from(products).where(eq(products.categoryId, catId)).limit(1);
    if (associated) {
      // Rather than hard failing or cascading delete products, unassign products or return warning
      await db.update(products).set({ categoryId: null }).where(eq(products.categoryId, catId));
    }

    const [deleted] = await db.delete(categories).where(eq(categories.id, catId)).returning();
    if (!deleted) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted successfully", id: catId });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

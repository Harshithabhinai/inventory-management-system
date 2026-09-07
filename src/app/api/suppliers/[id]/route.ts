import { NextResponse } from "next/server";
import { db } from "@/db";
import { suppliers, purchases } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supId = parseInt(id, 10);
    if (isNaN(supId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, supId));
    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json(supplier);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch supplier" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supId = parseInt(id, 10);
    if (isNaN(supId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, contactPerson, email, phone, address } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Supplier name is required" }, { status: 400 });
    }

    const [updated] = await db
      .update(suppliers)
      .set({
        name: name.trim(),
        contactPerson: contactPerson?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
      })
      .where(eq(suppliers.id, supId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supId = parseInt(id, 10);
    if (isNaN(supId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Check if supplier has purchases
    const [existingPurchase] = await db.select().from(purchases).where(eq(purchases.supplierId, supId)).limit(1);
    if (existingPurchase) {
      return NextResponse.json(
        { error: "Cannot delete supplier with existing purchase records. Consider archiving instead." },
        { status: 400 }
      );
    }

    const [deleted] = await db.delete(suppliers).where(eq(suppliers.id, supId)).returning();
    if (!deleted) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Supplier deleted successfully", id: supId });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
  }
}

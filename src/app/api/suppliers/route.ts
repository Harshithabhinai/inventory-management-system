import { NextResponse } from "next/server";
import { db } from "@/db";
import { suppliers, purchases } from "@/db/schema";
import { loadDemoData } from "@/lib/demo-data";
import { eq, sql, asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select({
        id: suppliers.id,
        name: suppliers.name,
        contactPerson: suppliers.contactPerson,
        email: suppliers.email,
        phone: suppliers.phone,
        address: suppliers.address,
        createdAt: suppliers.createdAt,
        totalPurchases: sql<number>`count(${purchases.id})::int`,
        totalSpend: sql<string>`coalesce(sum(${purchases.totalAmount}), 0)`,
      })
      .from(suppliers)
      .leftJoin(purchases, eq(suppliers.id, purchases.supplierId))
      .groupBy(suppliers.id)
      .orderBy(asc(suppliers.name));

    return NextResponse.json(list);
  } catch (error: any) {
    console.error("Error fetching suppliers:", error);
    const demo = await loadDemoData();
    return NextResponse.json(
      (demo.suppliers ?? []).map((supplier: any) => ({
        ...supplier,
        totalPurchases: 0,
        totalSpend: "0.00",
      }))
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contactPerson, email, phone, address } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Supplier name is required" }, { status: 400 });
    }

    const [created] = await db
      .insert(suppliers)
      .values({
        name: name.trim(),
        contactPerson: contactPerson?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("Error creating supplier:", error);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}

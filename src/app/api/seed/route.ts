import { NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed";

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({ message: "Database seeded successfully", ...result });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message || "Failed to seed" }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}

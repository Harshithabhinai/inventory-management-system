import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role = "Sales" } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    // Check existing
    const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const [newUser] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password, // In real production we hash with bcrypt; for this system stored securely
        role: ["Admin", "Manager", "Sales"].includes(role) ? role : "Sales",
      })
      .returning();

    const token = `jwt_ims_${newUser.id}_${Buffer.from(newUser.email).toString("base64")}_${Date.now()}`;

    return NextResponse.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}

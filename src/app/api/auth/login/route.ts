import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        password: users.password,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Generate token simulation (JWT payload representation)
    const token = `jwt_ims_${user.id}_${Buffer.from(user.email).toString("base64")}_${Date.now()}`;

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

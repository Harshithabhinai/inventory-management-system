import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/db";
import { users, employees, activityLogs } from "@/db/schema";
import { getAuthUser, hashPassword } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    if (!isDbConfigured) {
      return NextResponse.json({ message: "DATABASE_URL is required" }, { status: 500 });
    }
    await ensureSeeded();
    const currentUser = await getAuthUser(req);
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        employeeId: users.employeeId,
        createdAt: users.createdAt,
      })
      .from(users);

    return NextResponse.json(allUsers);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!isDbConfigured) {
      return NextResponse.json({ message: "DATABASE_URL is required" }, { status: 500 });
    }
    const currentUser = await getAuthUser(req);
    if (!currentUser || currentUser.role !== "Admin") {
      return NextResponse.json(
        { message: "Admin access required to change user roles." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !["Admin", "Employee"].includes(role)) {
      return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
    }

    const [updatedUser] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
      });

    await db.insert(activityLogs).values({
      userName: currentUser.username,
      userRole: currentUser.role,
      action: "Role Change",
      details: `Changed role of user ${updatedUser.username} to ${role}.`,
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

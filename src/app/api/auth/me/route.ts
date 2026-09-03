import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";
import { isDbConfigured } from "@/db";
import * as devStore from "@/db/devStore";

export async function GET(req: NextRequest) {
  try {
    if (!isDbConfigured) {
      await ensureSeeded();
      const user = await getAuthUser(req);
      if (!user) {
        return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
      }

      const devUsers = devStore.getUsers();
      const found = devUsers.find((u: any) => u.email === user.email || u.username === user.username || u.id === user.userId);
      if (!found) {
        return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
      }
      const payload = { userId: found.id, email: found.email, username: found.username, role: found.role, employeeId: found.employeeId };
      return NextResponse.json({ user: payload });
    }
    await ensureSeeded();
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );

    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to retrieve user session." },
      { status: 500 }
    );
  }
}

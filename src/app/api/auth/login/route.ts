import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/db";
import { users, employees, activityLogs } from "@/db/schema";
import { comparePassword, signToken } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";
import { eq, or } from "drizzle-orm";
import * as devStore from "@/db/devStore";

export async function POST(req: NextRequest) {
  try {
    if (!isDbConfigured) {
      await ensureSeeded();
      const body = await req.json();
      const { email, username, password } = body;

      const identifier = email || username;
      if (!identifier || !password) {
        return NextResponse.json({ message: "Username/Email and Password are required." }, { status: 400 });
      }

      const usersList = devStore.getUsers();
      const user = usersList.find((u: any) => u.email === identifier || u.username === identifier);
      if (!user) return NextResponse.json({ message: "Invalid credentials. User not found." }, { status: 401 });

      const isMatch = await comparePassword(password, user.passwordHash || user.password || '');
      if (!isMatch) return NextResponse.json({ message: "Invalid credentials. Password incorrect." }, { status: 401 });

      const tokenPayload = { userId: user.id, email: user.email, username: user.username, role: user.role as "Admin" | "Employee", employeeId: user.employeeId };
      const token = signToken(tokenPayload);

      // append activity
      const act = { id: Date.now(), userName: user.username, userRole: user.role, action: 'User Login', details: `User ${user.email} logged in successfully as ${user.role}.`, createdAt: new Date().toISOString() };
      const p = require('path').join(process.cwd(),'src','db','devData.json');
      const fs = require('fs');
      const dataFile = fs.readFileSync(p,'utf8');
      const json = JSON.parse(dataFile);
      json.activityLogs = json.activityLogs || [];
      json.activityLogs.push(act);
      fs.writeFileSync(p, JSON.stringify(json,null,2),'utf8');

      const response = NextResponse.json({ message: 'Login successful', token, user: tokenPayload });
      response.cookies.set({ name: 'emp_token', value: token, httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 7 * 24 * 60 * 60 });
      return response;
    }
    await ensureSeeded();

    const body = await req.json();
    const { email, username, password } = body;

    const identifier = email || username;
    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Username/Email and Password are required." },
        { status: 400 }
      );

    }

    const foundUsers = await db
      .select()
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.username, identifier)));

    const user = foundUsers[0];
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials. User not found." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials. Password incorrect." },
        { status: 401 }
      );
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role as "Admin" | "Employee",
      employeeId: user.employeeId,
    };

    const token = signToken(tokenPayload);

    // Record login in activity log
    await db.insert(activityLogs).values({
      userName: user.username,
      userRole: user.role,
      action: "User Login",
      details: `User ${user.email} logged in successfully as ${user.role}.`,
    });

    const response = NextResponse.json({
      message: "Login successful",
      token,
      user: tokenPayload,
    });

    response.cookies.set({
      name: "emp_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error during login." },
      { status: 500 }
    );
  }
}

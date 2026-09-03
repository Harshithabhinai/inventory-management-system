import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/db";
import { employees, activityLogs } from "@/db/schema";
import * as devStore from "@/db/devStore";
import { getAuthUser } from "@/lib/auth";
import { eq, ne, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isDbConfigured) {
      await ensureSeeded();
      const { id } = await params;
      const empId = parseInt(id, 10);
      if (isNaN(empId)) {
        return NextResponse.json({ message: "Invalid Employee ID" }, { status: 400 });
      }
      const emp = devStore.getEmployeeById(empId);
      if (!emp) return NextResponse.json({ message: "Employee not found" }, { status: 404 });
      return NextResponse.json(emp);
    }
    const { id } = await params;
    const empId = parseInt(id, 10);
    if (isNaN(empId)) {
      return NextResponse.json({ message: "Invalid Employee ID" }, { status: 400 });
    }

    const result = await db
      .select()
      .from(employees)
      .where(eq(employees.id, empId));

    if (result.length === 0) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch employee details." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isDbConfigured) {
      await ensureSeeded();
      const currentUser = await getAuthUser(req);
      if (!currentUser) {
        return NextResponse.json({ message: "Unauthorized. Log in required." }, { status: 401 });
      }

      const { id } = await params;
      const empId = parseInt(id, 10);
      if (isNaN(empId)) {
        return NextResponse.json({ message: "Invalid Employee ID" }, { status: 400 });
      }

      // Role check: Admin can update any employee. Non-admin can only update their matching profile if applicable.
      if (currentUser.role !== "Admin" && currentUser.employeeId !== empId) {
        return NextResponse.json(
          { message: "Access denied. Only Admins can edit other employees' information." },
          { status: 403 }
        );
      }

      const body = await req.json();
      const {
        firstName,
        lastName,
        email,
        phone,
        department,
        designation,
        salary,
        joiningDate,
        isActive,
        location,
        avatarUrl,
        notes,
      } = body;

      const existing = devStore.getEmployeeById(empId);
      if (!existing) return NextResponse.json({ message: "Employee not found" }, { status: 404 });

      if (email) {
        const all = devStore.getEmployees({}).employees;
        const conflict = all.find((e: any) => e.email === email.trim().toLowerCase() && e.id !== empId);
        if (conflict) return NextResponse.json({ message: `Email ${email} is already used by another employee.` }, { status: 409 });
      }

      const updates: any = {};
      if (firstName !== undefined) updates.firstName = firstName.trim();
      if (lastName !== undefined) updates.lastName = lastName.trim();
      if (email !== undefined) updates.email = email.trim().toLowerCase();
      if (phone !== undefined) updates.phone = phone.trim();
      if (department !== undefined) updates.department = department.trim();
      if (designation !== undefined) updates.designation = designation.trim();
      if (salary !== undefined) updates.salary = String(salary);
      if (joiningDate !== undefined) updates.joiningDate = joiningDate.trim();
      if (isActive !== undefined) updates.isActive = Boolean(isActive);
      if (location !== undefined) updates.location = location.trim();
      if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl.trim();
      if (notes !== undefined) updates.notes = notes.trim();

      const updated = devStore.updateEmployee(empId, updates);

      // Log action
      const act = { id: Date.now(), userName: currentUser.username, userRole: currentUser.role, action: 'Updated Employee', details: `Updated details for ${updated.firstName} ${updated.lastName} (ID: ${updated.id}).`, createdAt: new Date().toISOString() };
      const p = require('path').join(process.cwd(),'src','db','devData.json');
      const fs = require('fs');
      const dataFile = fs.readFileSync(p,'utf8');
      const json = JSON.parse(dataFile);
      json.activityLogs = json.activityLogs || [];
      json.activityLogs.push(act);
      fs.writeFileSync(p, JSON.stringify(json,null,2),'utf8');

      return NextResponse.json(updated);
    }
    const currentUser = await getAuthUser(req);
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized. Log in required." }, { status: 401 });
    }

    const { id } = await params;
    const empId = parseInt(id, 10);
    if (isNaN(empId)) {
      return NextResponse.json({ message: "Invalid Employee ID" }, { status: 400 });
    }

    // Role check: Admin can update any employee. Non-admin can only update their matching profile if applicable.
    if (currentUser.role !== "Admin" && currentUser.employeeId !== empId) {
      return NextResponse.json(
        { message: "Access denied. Only Admins can edit other employees' information." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      salary,
      joiningDate,
      isActive,
      location,
      avatarUrl,
      notes,
    } = body;

    // Check existing
    const existing = await db
      .select()
      .from(employees)
      .where(eq(employees.id, empId));

    if (existing.length === 0) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    if (email) {
      const emailConflict = await db
        .select()
        .from(employees)
        .where(and(eq(employees.email, email.trim().toLowerCase()), ne(employees.id, empId)));

      if (emailConflict.length > 0) {
        return NextResponse.json(
          { message: `Email ${email} is already used by another employee.` },
          { status: 409 }
        );
      }
    }

    const updatedData: any = {
      updatedAt: new Date(),
    };

    if (firstName !== undefined) updatedData.firstName = firstName.trim();
    if (lastName !== undefined) updatedData.lastName = lastName.trim();
    if (email !== undefined) updatedData.email = email.trim().toLowerCase();
    if (phone !== undefined) updatedData.phone = phone.trim();
    if (department !== undefined) updatedData.department = department.trim();
    if (designation !== undefined) updatedData.designation = designation.trim();
    if (salary !== undefined) updatedData.salary = String(salary);
    if (joiningDate !== undefined) updatedData.joiningDate = joiningDate.trim();
    if (isActive !== undefined) updatedData.isActive = Boolean(isActive);
    if (location !== undefined) updatedData.location = location.trim();
    if (avatarUrl !== undefined) updatedData.avatarUrl = avatarUrl.trim();
    if (notes !== undefined) updatedData.notes = notes.trim();

    const [updatedEmp] = await db
      .update(employees)
      .set(updatedData)
      .where(eq(employees.id, empId))
      .returning();

    // Log action
    await db.insert(activityLogs).values({
      userName: currentUser.username,
      userRole: currentUser.role,
      action: "Updated Employee",
      details: `Updated details for ${updatedEmp.firstName} ${updatedEmp.lastName} (ID: ${updatedEmp.id}).`,
    });

    return NextResponse.json(updatedEmp);
  } catch (error: any) {
    console.error("PUT Employee Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update employee." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isDbConfigured) {
      await ensureSeeded();
      const currentUser = await getAuthUser(req);
      if (!currentUser) {
        return NextResponse.json({ message: "Unauthorized. Log in required." }, { status: 401 });
      }

      if (currentUser.role !== "Admin") {
        return NextResponse.json(
          { message: "Access denied. Admin permission required to delete employees." },
          { status: 403 }
        );
      }

      const { id } = await params;
      const empId = parseInt(id, 10);
      if (isNaN(empId)) {
        return NextResponse.json({ message: "Invalid Employee ID" }, { status: 400 });
      }

      const existing = devStore.getEmployeeById(empId);
      if (!existing) return NextResponse.json({ message: "Employee not found" }, { status: 404 });

      devStore.deleteEmployee(empId);

      // Log action
      const act = { id: Date.now(), userName: currentUser.username, userRole: currentUser.role, action: 'Deleted Employee', details: `Deleted employee ${existing.firstName} ${existing.lastName} (${existing.email}).`, createdAt: new Date().toISOString() };
      const p = require('path').join(process.cwd(),'src','db','devData.json');
      const fs = require('fs');
      const dataFile = fs.readFileSync(p,'utf8');
      const json = JSON.parse(dataFile);
      json.activityLogs = json.activityLogs || [];
      json.activityLogs.push(act);
      fs.writeFileSync(p, JSON.stringify(json,null,2),'utf8');

      return NextResponse.json({ message: "Employee deleted successfully", id: empId });
    }
    const currentUser = await getAuthUser(req);
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized. Log in required." }, { status: 401 });
    }

    if (currentUser.role !== "Admin") {
      return NextResponse.json(
        { message: "Access denied. Admin permission required to delete employees." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const empId = parseInt(id, 10);
    if (isNaN(empId)) {
      return NextResponse.json({ message: "Invalid Employee ID" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(employees)
      .where(eq(employees.id, empId));

    if (existing.length === 0) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    const empToDelete = existing[0];

    await db.delete(employees).where(eq(employees.id, empId));

    // Log action
    await db.insert(activityLogs).values({
      userName: currentUser.username,
      userRole: currentUser.role,
      action: "Deleted Employee",
      details: `Deleted employee ${empToDelete.firstName} ${empToDelete.lastName} (${empToDelete.email}).`,
    });

    return NextResponse.json({ message: "Employee deleted successfully", id: empId });
  } catch (error: any) {
    console.error("DELETE Employee Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete employee." },
      { status: 500 }
    );
  }
}

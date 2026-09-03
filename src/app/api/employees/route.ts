import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/db";
import * as devStore from "@/db/devStore";
import { employees, activityLogs } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";
import { eq, like, or, sql, asc, desc, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    if (!isDbConfigured) {
      await ensureSeeded();
      const { searchParams } = new URL(req.url);
      const params = {
        search: searchParams.get("search") || "",
        department: searchParams.get("department") || "",
        isActive: searchParams.get("isActive"),
        sortBy: searchParams.get("sortBy") || "createdAt",
        sortOrder: searchParams.get("sortOrder") || "desc",
        page: parseInt(searchParams.get("page") || "1", 10),
        limit: parseInt(searchParams.get("limit") || "10", 10),
      };
      const data = devStore.getEmployees(params);
      return NextResponse.json(data);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const isActiveParam = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const conditions = [];

    if (search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      conditions.push(
        or(
          sql`LOWER(${employees.firstName}) LIKE ${q}`,
          sql`LOWER(${employees.lastName}) LIKE ${q}`,
          sql`LOWER(${employees.email}) LIKE ${q}`,
          sql`LOWER(${employees.department}) LIKE ${q}`,
          sql`LOWER(${employees.designation}) LIKE ${q}`,
          sql`LOWER(${employees.location}) LIKE ${q}`
        )
      );
    }

    if (department.trim() && department !== "All") {
      conditions.push(eq(employees.department, department.trim()));
    }

    if (isActiveParam === "true") {
      conditions.push(eq(employees.isActive, true));
    } else if (isActiveParam === "false") {
      conditions.push(eq(employees.isActive, false));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Sorting map
    let sortColumn: any = employees.createdAt;
    if (sortBy === "firstName") sortColumn = employees.firstName;
    else if (sortBy === "lastName") sortColumn = employees.lastName;
    else if (sortBy === "email") sortColumn = employees.email;
    else if (sortBy === "department") sortColumn = employees.department;
    else if (sortBy === "designation") sortColumn = employees.designation;
    else if (sortBy === "salary") sortColumn = employees.salary;
    else if (sortBy === "joiningDate") sortColumn = employees.joiningDate;
    else if (sortBy === "isActive") sortColumn = employees.isActive;

    const sortFn = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

    // Get Total Count
    const countQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(whereClause);

    const total = Number(countQuery[0]?.count || 0);

    const offset = (page - 1) * limit;

    const result = await db
      .select()
      .from(employees)
      .where(whereClause)
      .orderBy(sortFn)
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      employees: result,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error("GET Employees Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch employees." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isDbConfigured) {
      await ensureSeeded();
      const currentUser = await getAuthUser(req);
      if (!currentUser) {
        return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
      }

      if (currentUser.role !== "Admin") {
        return NextResponse.json(
          { message: "Access denied. Admin permission required to add employees." },
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
        isActive = true,
        location = "Remote",
        avatarUrl = "",
        notes = "",
      } = body;

      if (!firstName || !lastName || !email || !phone || !department || !designation || !salary || !joiningDate) {
        return NextResponse.json(
          { message: "All required fields (Name, Email, Phone, Department, Designation, Salary, Joining Date) must be provided." },
          { status: 400 }
        );
      }

      // Check email uniqueness
      const existing = devStore.getEmployees({}).employees.filter((e: any) => e.email === email.trim());
      if (existing.length > 0) {
        return NextResponse.json({ message: `Employee with email ${email} already exists.` }, { status: 409 });
      }

      const newEmp = devStore.createEmployee({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        department: department.trim(),
        designation: designation.trim(),
        salary: String(salary),
        joiningDate: joiningDate.trim(),
        isActive: Boolean(isActive),
        location: location.trim() || "Remote",
        avatarUrl: avatarUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      // Log action
      const act = {
        id: Date.now(),
        userName: currentUser.username,
        userRole: currentUser.role,
        action: 'Created Employee',
        details: `Added new employee ${newEmp.firstName} ${newEmp.lastName} (${newEmp.email}) in ${newEmp.department}.`,
        createdAt: new Date().toISOString(),
      };
      const dataFile = require('fs').readFileSync(require('path').join(process.cwd(),'src','db','devData.json'),'utf8');
      const json = JSON.parse(dataFile);
      json.activityLogs = json.activityLogs || [];
      json.activityLogs.push(act);
      require('fs').writeFileSync(require('path').join(process.cwd(),'src','db','devData.json'), JSON.stringify(json,null,2),'utf8');

      return NextResponse.json(newEmp, { status: 201 });
    }

    const currentUser = await getAuthUser(req);
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    if (currentUser.role !== "Admin") {
      return NextResponse.json(
        { message: "Access denied. Admin permission required to add employees." },
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
      isActive = true,
      location = "Remote",
      avatarUrl = "",
      notes = "",
    } = body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !department || !designation || !salary || !joiningDate) {
      return NextResponse.json(
        { message: "All required fields (Name, Email, Phone, Department, Designation, Salary, Joining Date) must be provided." },
        { status: 400 }
      );
    }

    // Check email uniqueness
    const existing = await db
      .select()
      .from(employees)
      .where(eq(employees.email, email.trim()));

    if (existing.length > 0) {
      return NextResponse.json(
        { message: `Employee with email ${email} already exists.` },
        { status: 409 }
      );
    }

    const [newEmp] = await db
      .insert(employees)
      .values({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        department: department.trim(),
        designation: designation.trim(),
        salary: String(salary),
        joiningDate: joiningDate.trim(),
        isActive: Boolean(isActive),
        location: location.trim() || "Remote",
        avatarUrl: avatarUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      .returning();

    // Log action
    await db.insert(activityLogs).values({
      userName: currentUser.username,
      userRole: currentUser.role,
      action: "Created Employee",
      details: `Added new employee ${newEmp.firstName} ${newEmp.lastName} (${newEmp.email}) in ${newEmp.department}.`,
    });

    return NextResponse.json(newEmp, { status: 201 });
  } catch (error: any) {
    console.error("POST Employee Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create employee." },
      { status: 500 }
    );
  }
}

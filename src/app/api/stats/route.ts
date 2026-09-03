import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/db";
import { employees, activityLogs } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import * as devStore from "@/db/devStore";
import { desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    if (!isDbConfigured) {
      await ensureSeeded();
      const stats = devStore.getStats();
      return NextResponse.json(stats);
    }
    await ensureSeeded();

    const allEmps = await db.select().from(employees);

    const totalEmployees = allEmps.length;
    const activeEmployees = allEmps.filter((e) => e.isActive).length;
    const inactiveEmployees = totalEmployees - activeEmployees;

    let totalPayroll = 0;
    const deptMap: Record<
      string,
      { count: number; active: number; inactive: number; totalSalary: number }
    > = {};

    const locationMap: Record<string, number> = {};

    const salaryTiers = {
      under70k: 0,
      tier70to95k: 0,
      tier95to120k: 0,
      over120k: 0,
    };

    allEmps.forEach((e) => {
      const sal = parseFloat(e.salary || "0") || 0;
      totalPayroll += sal;

      // Dept stats
      const dept = e.department || "Unassigned";
      if (!deptMap[dept]) {
        deptMap[dept] = { count: 0, active: 0, inactive: 0, totalSalary: 0 };
      }
      deptMap[dept].count += 1;
      if (e.isActive) deptMap[dept].active += 1;
      else deptMap[dept].inactive += 1;
      deptMap[dept].totalSalary += sal;

      // Location stats
      const loc = e.location || "Remote";
      locationMap[loc] = (locationMap[loc] || 0) + 1;

      // Salary tier stats
      if (sal < 70000) salaryTiers.under70k += 1;
      else if (sal < 95000) salaryTiers.tier70to95k += 1;
      else if (sal < 120000) salaryTiers.tier95to120k += 1;
      else salaryTiers.over120k += 1;
    });

    const averageSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;

    const departmentBreakdown = Object.keys(deptMap).map((dept) => ({
      name: dept,
      count: deptMap[dept].count,
      active: deptMap[dept].active,
      inactive: deptMap[dept].inactive,
      totalSalary: deptMap[dept].totalSalary,
      avgSalary: Math.round(deptMap[dept].totalSalary / deptMap[dept].count),
    }));

    const locationBreakdown = Object.keys(locationMap).map((loc) => ({
      location: loc,
      count: locationMap[loc],
    }));

    // Recent activity log
    const recentActivities = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(10);

    return NextResponse.json({
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalPayroll,
      averageSalary: Math.round(averageSalary),
      departmentCount: departmentBreakdown.length,
      departmentBreakdown,
      locationBreakdown,
      salaryTiers,
      recentActivities,
    });
  } catch (error: any) {
    console.error("GET Stats Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch stats." },
      { status: 500 }
    );
  }
}

import { db, isDbConfigured } from "./index";
import { users, employees, activityLogs } from "./schema";
import bcrypt from "bcryptjs";
import { count } from "drizzle-orm";
import { ensureDevSeeded } from "./devStore";

export async function ensureSeeded() {
  try {
    if (!isDbConfigured) {
      // create dev JSON seed using the same initial data below
      console.log('Seeding local JSON dev data...');
      // Password hash for 'admin123' and 'employee123' will be created in devStore
      const initialEmployees = [
        // copy of initial employees defined below - use a smaller subset to speed dev
        { firstName: "John", lastName: "Doe", email: "john.doe@company.com", phone: "+1 (555) 019-2834", department: "Engineering", designation: "Senior Full-Stack Engineer", salary: "115000.00", joiningDate: "2022-03-15", isActive: true, location: "San Francisco, CA", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", notes: "Key contributor to core cloud migration." },
        { firstName: "Jane", lastName: "Smith", email: "jane.smith@company.com", phone: "+1 (555) 018-9921", department: "Human Resources", designation: "HR Manager", salary: "92000.00", joiningDate: "2021-06-01", isActive: true, location: "New York, NY", avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", notes: "Oversees employee relations and hiring strategy." },
      ];

      const initialUsers = [
        { id: 1, username: 'admin', email: 'admin@company.com', plainPassword: 'admin123', role: 'Admin', employeeId: 1 },
        { id: 2, username: 'johndoe', email: 'john.doe@company.com', plainPassword: 'employee123', role: 'Employee', employeeId: 1 },
      ];

      const initialActivity = [
        { id: 1, userName: 'System Admin', userRole: 'Admin', action: 'Initial Setup', details: 'System initialized with sample database records and admin account.', createdAt: new Date().toISOString() }
      ];

      ensureDevSeeded({ employees: initialEmployees.map((e,i)=>({ id: i+1, ...e })), users: initialUsers, activityLogs: initialActivity });
      return;
    }

    const userCountResult = await db.select({ value: count() }).from(users);
    const userCount = userCountResult[0]?.value || 0;

    if (userCount > 0) {
      return; // Already seeded
    }

    console.log("Seeding initial database...");

    // Password hash for 'admin123' and 'employee123'
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const employeePasswordHash = await bcrypt.hash("employee123", 10);

    // 1. Seed Employees
    const initialEmployees = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@company.com",
        phone: "+1 (555) 019-2834",
        department: "Engineering",
        designation: "Senior Full-Stack Engineer",
        salary: "115000.00",
        joiningDate: "2022-03-15",
        isActive: true,
        location: "San Francisco, CA",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        notes: "Key contributor to core cloud migration.",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@company.com",
        phone: "+1 (555) 018-9921",
        department: "Human Resources",
        designation: "HR Manager",
        salary: "92000.00",
        joiningDate: "2021-06-01",
        isActive: true,
        location: "New York, NY",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        notes: "Oversees employee relations and hiring strategy.",
      },
      {
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.brown@company.com",
        phone: "+1 (555) 014-4432",
        department: "Finance",
        designation: "Chief Financial Officer",
        salary: "165000.00",
        joiningDate: "2019-11-10",
        isActive: true,
        location: "Chicago, IL",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        notes: "Manages financial planning, budget and investor relations.",
      },
      {
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@company.com",
        phone: "+1 (555) 017-8820",
        department: "Marketing",
        designation: "VP of Marketing",
        salary: "130000.00",
        joiningDate: "2020-02-14",
        isActive: true,
        location: "Austin, TX",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        notes: "Leads global brand identity and digital campaigns.",
      },
      {
        firstName: "David",
        lastName: "Wilson",
        email: "david.wilson@company.com",
        phone: "+1 (555) 013-1123",
        department: "Engineering",
        designation: "DevOps Specialist",
        salary: "108000.00",
        joiningDate: "2023-01-20",
        isActive: true,
        location: "Remote",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        notes: "Maintains CI/CD pipelines and AWS cloud architecture.",
      },
      {
        firstName: "Sarah",
        lastName: "Connor",
        email: "sarah.connor@company.com",
        phone: "+1 (555) 012-7744",
        department: "Engineering",
        designation: "Frontend Tech Lead",
        salary: "125000.00",
        joiningDate: "2021-09-01",
        isActive: true,
        location: "Seattle, WA",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        notes: "Architect for Next.js and Design System platform.",
      },
      {
        firstName: "Robert",
        lastName: "Taylor",
        email: "robert.taylor@company.com",
        phone: "+1 (555) 016-5590",
        department: "Sales",
        designation: "Senior Account Executive",
        salary: "98000.00",
        joiningDate: "2022-08-12",
        isActive: true,
        location: "New York, NY",
        avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
        notes: "Top performer in enterprise deal closing Q3.",
      },
      {
        firstName: "Lisa",
        lastName: "Anderson",
        email: "lisa.anderson@company.com",
        phone: "+1 (555) 011-3388",
        department: "Product",
        designation: "Lead UI/UX Designer",
        salary: "105000.00",
        joiningDate: "2022-11-05",
        isActive: true,
        location: "Austin, TX",
        avatarUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
        notes: "Drives user research and accessibility compliance.",
      },
      {
        firstName: "James",
        lastName: "Martin",
        email: "james.martin@company.com",
        phone: "+1 (555) 015-9944",
        department: "Finance",
        designation: "Financial Analyst",
        salary: "78000.00",
        joiningDate: "2023-04-18",
        isActive: true,
        location: "Chicago, IL",
        avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
        notes: "Prepares quarterly audit reports and forecasting models.",
      },
      {
        firstName: "Amanda",
        lastName: "White",
        email: "amanda.white@company.com",
        phone: "+1 (555) 010-6677",
        department: "Human Resources",
        designation: "Talent Acquisition Lead",
        salary: "84000.00",
        joiningDate: "2022-01-10",
        isActive: true,
        location: "Remote",
        avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
        notes: "Coordinates tech engineering candidate pipeline.",
      },
      {
        firstName: "Thomas",
        lastName: "Harris",
        email: "thomas.harris@company.com",
        phone: "+1 (555) 019-4411",
        department: "Engineering",
        designation: "Backend Engineer",
        salary: "95000.00",
        joiningDate: "2023-07-01",
        isActive: true,
        location: "San Francisco, CA",
        avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
        notes: "Microservices & GraphQL integration specialist.",
      },
      {
        firstName: "Jessica",
        lastName: "Clark",
        email: "jessica.clark@company.com",
        phone: "+1 (555) 018-2233",
        department: "Marketing",
        designation: "Content Strategist",
        salary: "72000.00",
        joiningDate: "2023-03-15",
        isActive: true,
        location: "Remote",
        avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        notes: "Manages technical blogs and developer newsletter.",
      },
      {
        firstName: "Daniel",
        lastName: "Lewis",
        email: "daniel.lewis@company.com",
        phone: "+1 (555) 017-3344",
        department: "Operations",
        designation: "Operations Director",
        salary: "120000.00",
        joiningDate: "2020-05-19",
        isActive: true,
        location: "Chicago, IL",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
        notes: "Coordinates office facilities and vendor contracts.",
      },
      {
        firstName: "Karen",
        lastName: "Walker",
        email: "karen.walker@company.com",
        phone: "+1 (555) 016-8877",
        department: "Operations",
        designation: "Logistics Coordinator",
        salary: "62000.00",
        joiningDate: "2023-09-01",
        isActive: true,
        location: "New York, NY",
        avatarUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80",
        notes: "Manages hardware procurement and employee onboarding assets.",
      },
      {
        firstName: "Paul",
        lastName: "Hall",
        email: "paul.hall@company.com",
        phone: "+1 (555) 015-1199",
        department: "Engineering",
        designation: "QA Automation Specialist",
        salary: "88000.00",
        joiningDate: "2022-10-10",
        isActive: false,
        location: "Remote",
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
        notes: "Currently on sabbatical break.",
      },
      {
        firstName: "Nancy",
        lastName: "Allen",
        email: "nancy.allen@company.com",
        phone: "+1 (555) 014-7766",
        department: "Sales",
        designation: "Sales Representative",
        salary: "68000.00",
        joiningDate: "2023-02-01",
        isActive: true,
        location: "Austin, TX",
        avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
        notes: "Focuses on SMB inbound lead conversions.",
      },
      {
        firstName: "Steven",
        lastName: "Young",
        email: "steven.young@company.com",
        phone: "+1 (555) 013-4455",
        department: "Product",
        designation: "Senior Product Manager",
        salary: "112000.00",
        joiningDate: "2021-12-01",
        isActive: true,
        location: "San Francisco, CA",
        avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
        notes: "Owns core dashboard roadmap & analytics integrations.",
      },
      {
        firstName: "Betty",
        lastName: "King",
        email: "betty.king@company.com",
        phone: "+1 (555) 012-9988",
        department: "Marketing",
        designation: "SEO & Growth Lead",
        salary: "82000.00",
        joiningDate: "2022-04-15",
        isActive: true,
        location: "Remote",
        avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80",
        notes: "Increased organic search traffic by 140% in 2023.",
      },
      {
        firstName: "Mark",
        lastName: "Wright",
        email: "mark.wright@company.com",
        phone: "+1 (555) 011-2244",
        department: "Engineering",
        designation: "Junior Developer",
        salary: "65000.00",
        joiningDate: "2024-01-15",
        isActive: true,
        location: "Chicago, IL",
        avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        notes: "New team member under mentorship program.",
      },
      {
        firstName: "Sandra",
        lastName: "Scott",
        email: "sandra.scott@company.com",
        phone: "+1 (555) 010-9911",
        department: "Human Resources",
        designation: "HR Specialist",
        salary: "58000.00",
        joiningDate: "2023-11-01",
        isActive: false,
        location: "New York, NY",
        avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
        notes: "Resigned in Nov 2024.",
      },
      {
        firstName: "Kevin",
        lastName: "Green",
        email: "kevin.green@company.com",
        phone: "+1 (555) 019-3388",
        department: "Finance",
        designation: "Senior Accountant",
        salary: "86000.00",
        joiningDate: "2021-04-10",
        isActive: true,
        location: "Seattle, WA",
        avatarUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
        notes: "Payroll, tax filings, and ledger compliance.",
      },
      {
        firstName: "Donna",
        lastName: "Baker",
        email: "donna.baker@company.com",
        phone: "+1 (555) 018-7711",
        department: "Sales",
        designation: "Regional Sales Manager",
        salary: "118000.00",
        joiningDate: "2020-08-01",
        isActive: true,
        location: "Chicago, IL",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        notes: "Directs Midwest sales expansion strategy.",
      },
      {
        firstName: "Brian",
        lastName: "Adams",
        email: "brian.adams@company.com",
        phone: "+1 (555) 017-6655",
        department: "Operations",
        designation: "Facilities Manager",
        salary: "70000.00",
        joiningDate: "2022-05-01",
        isActive: false,
        location: "Austin, TX",
        avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
        notes: "On extended personal leave.",
      },
      {
        firstName: "Carol",
        lastName: "Nelson",
        email: "carol.nelson@company.com",
        phone: "+1 (555) 016-2233",
        department: "Product",
        designation: "Technical Writer",
        salary: "74000.00",
        joiningDate: "2023-08-15",
        isActive: true,
        location: "Remote",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        notes: "Maintains API docs and internal engineering wiki.",
      },
    ];

    const insertedEmployees = await db.insert(employees).values(initialEmployees).returning();

    // 2. Seed Users
    // Admin user
    const adminUser = {
      username: "admin",
      email: "admin@company.com",
      passwordHash: adminPasswordHash,
      role: "Admin",
      employeeId: insertedEmployees[0]?.id || null,
    };

    // Employee user
    const johnUser = {
      username: "johndoe",
      email: "john.doe@company.com",
      passwordHash: employeePasswordHash,
      role: "Employee",
      employeeId: insertedEmployees[0]?.id || null,
    };

    const janeUser = {
      username: "janesmith",
      email: "jane.smith@company.com",
      passwordHash: adminPasswordHash,
      role: "Admin",
      employeeId: insertedEmployees[1]?.id || null,
    };

    await db.insert(users).values([adminUser, johnUser, janeUser]);

    // 3. Seed Activity Logs
    await db.insert(activityLogs).values([
      {
        userName: "System Admin",
        userRole: "Admin",
        action: "Initial Setup",
        details: "System initialized with sample database records and admin account.",
      },
      {
        userName: "Jane Smith",
        userRole: "Admin",
        action: "Onboarding",
        details: "Added 24 initial employee profiles across 6 departments.",
      },
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

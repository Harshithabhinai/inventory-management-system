import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const dataPath = path.join(process.cwd(), 'src', 'db', 'devData.json');

function readData() {
  if (!fs.existsSync(dataPath)) return { employees: [], users: [], activityLogs: [] };
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function writeData(data: any) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
}

export function ensureDevSeeded(initial: { employees: any[]; users: any[]; activityLogs: any[] }) {
  if (!fs.existsSync(dataPath)) {
    // make sure password hashes exist for users
    const users = initial.users.map((u) => ({ ...u }));
    users.forEach((u) => {
      if (!u.passwordHash) {
        u.passwordHash = bcrypt.hashSync(u.plainPassword || 'password', 10);
        delete u.plainPassword;
      }
    });
    const data = { employees: initial.employees, users, activityLogs: initial.activityLogs };
    writeData(data);
  }
}

export function getEmployees({ search = '', department = '', isActive, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 }: any) {
  const data = readData();
  let rows = data.employees || [];
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter((e: any) =>
      [e.firstName, e.lastName, e.email, e.department, e.designation, e.location]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }
  if (department && department !== 'All') rows = rows.filter((e: any) => e.department === department);
  if (isActive === 'true') rows = rows.filter((e: any) => e.isActive === true);
  if (isActive === 'false') rows = rows.filter((e: any) => e.isActive === false);

  const total = rows.length;
  // simple sort
  rows = rows.sort((a: any, b: any) => {
    const aVal = a[sortBy] ?? '';
    const bVal = b[sortBy] ?? '';
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const offset = (page - 1) * limit;
  const paged = rows.slice(offset, offset + limit);
  return { employees: paged, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export function getEmployeeById(id: number) {
  const data = readData();
  return data.employees.find((e: any) => e.id === id);
}

export function createEmployee(emp: any) {
  const data = readData();
  const id = (data.employees.map((e: any) => e.id).sort((a: any, b: any) => b - a)[0] || 0) + 1;
  const now = new Date().toISOString();
  const newEmp = { id, createdAt: now, updatedAt: now, ...emp };
  data.employees.push(newEmp);
  writeData(data);
  return newEmp;
}

export function updateEmployee(id: number, updates: any) {
  const data = readData();
  const idx = data.employees.findIndex((e: any) => e.id === id);
  if (idx === -1) return null;
  const updated = { ...data.employees[idx], ...updates, updatedAt: new Date().toISOString() };
  data.employees[idx] = updated;
  writeData(data);
  return updated;
}

export function deleteEmployee(id: number) {
  const data = readData();
  const idx = data.employees.findIndex((e: any) => e.id === id);
  if (idx === -1) return false;
  data.employees.splice(idx, 1);
  writeData(data);
  return true;
}

export function getStats() {
  const data = readData();
  const allEmps = data.employees || [];
  const totalEmployees = allEmps.length;
  const activeEmployees = allEmps.filter((e: any) => e.isActive).length;
  const inactiveEmployees = totalEmployees - activeEmployees;
  const totalPayroll = allEmps.reduce((s: number, e: any) => s + (parseFloat(e.salary || '0') || 0), 0);
  const averageSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;

  const deptMap: any = {};
  const locationMap: any = {};
  const salaryTiers = { under70k: 0, tier70to95k: 0, tier95to120k: 0, over120k: 0 };

  allEmps.forEach((e: any) => {
    const sal = parseFloat(e.salary || '0') || 0;
    const dept = e.department || 'Unassigned';
    if (!deptMap[dept]) deptMap[dept] = { count: 0, active: 0, inactive: 0, totalSalary: 0 };
    deptMap[dept].count += 1;
    if (e.isActive) deptMap[dept].active += 1; else deptMap[dept].inactive += 1;
    deptMap[dept].totalSalary += sal;
    const loc = e.location || 'Remote';
    locationMap[loc] = (locationMap[loc] || 0) + 1;
    if (sal < 70000) salaryTiers.under70k += 1;
    else if (sal < 95000) salaryTiers.tier70to95k += 1;
    else if (sal < 120000) salaryTiers.tier95to120k += 1;
    else salaryTiers.over120k += 1;
  });

  const departmentBreakdown = Object.keys(deptMap).map((dept) => ({
    name: dept,
    count: deptMap[dept].count,
    active: deptMap[dept].active,
    inactive: deptMap[dept].inactive,
    totalSalary: deptMap[dept].totalSalary,
    avgSalary: Math.round(deptMap[dept].totalSalary / deptMap[dept].count),
  }));
  const locationBreakdown = Object.keys(locationMap).map((loc) => ({ location: loc, count: locationMap[loc] }));

  const recentActivities = (data.activityLogs || []).slice(-10).reverse();

  return {
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
  };
}

export function getUsers() {
  const data = readData();
  return data.users || [];
}

export function updateUserRole(userId: number, role: string) {
  const data = readData();
  const idx = data.users.findIndex((u: any) => u.id === userId);
  if (idx === -1) return null;
  data.users[idx].role = role;
  writeData(data);
  return { id: data.users[idx].id, username: data.users[idx].username, email: data.users[idx].email, role };
}

export function findUserByIdentifier(identifier: string) {
  const data = readData();
  const users = data.users || [];
  return users.find((u: any) => u.email === identifier || u.username === identifier);
}

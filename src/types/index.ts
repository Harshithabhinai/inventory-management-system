export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: string; // numeric string
  joiningDate: string;
  isActive: boolean;
  location?: string | null;
  avatarUrl?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: "Admin" | "Employee";
  employeeId?: number | null;
  createdAt?: string;
}

export interface ActivityLog {
  id: number;
  userName: string;
  userRole: string;
  action: string;
  details?: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalPayroll: number;
  averageSalary: number;
  departmentCount: number;
  departmentBreakdown: Array<{
    name: string;
    count: number;
    active: number;
    inactive: number;
    totalSalary: number;
    avgSalary: number;
  }>;
  locationBreakdown: Array<{
    location: string;
    count: number;
  }>;
  salaryTiers: {
    under70k: number;
    tier70to95k: number;
    tier95to120k: number;
    over120k: number;
  };
  recentActivities: ActivityLog[];
}

export interface EmployeeFilterParams {
  search: string;
  department: string;
  isActive: string; // 'all' | 'true' | 'false'
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Employee, DashboardStats, EmployeeFilterParams } from "@/types";
import { useAuth } from "./AuthContext";
import { parseJSONResponse } from "@/lib/fetchUtils";

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface EmployeeContextType {
  employees: Employee[];
  totalEmployees: number;
  totalPages: number;
  loading: boolean;
  stats: DashboardStats | null;
  statsLoading: boolean;
  filterParams: EmployeeFilterParams;
  setFilterParams: React.Dispatch<React.SetStateAction<EmployeeFilterParams>>;
  selectedEmployee: Employee | null;
  setSelectedEmployee: (emp: Employee | null) => void;
  isFormModalOpen: boolean;
  setIsFormModalOpen: (open: boolean) => void;
  formMode: "create" | "edit";
  openCreateModal: () => void;
  openEditModal: (emp: Employee) => void;
  isDetailModalOpen: boolean;
  openDetailModal: (emp: Employee) => void;
  closeDetailModal: () => void;
  fetchEmployees: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createEmployee: (data: Partial<Employee>) => Promise<boolean>;
  updateEmployee: (id: number, data: Partial<Employee>) => Promise<boolean>;
  deleteEmployee: (id: number) => Promise<boolean>;
  toggleActiveStatus: (emp: Employee) => Promise<boolean>;
  toasts: ToastMessage[];
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
  departmentsList: string[];
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
}

const defaultFilterParams: EmployeeFilterParams = {
  search: "",
  department: "All",
  isActive: "all",
  sortBy: "firstName",
  sortOrder: "asc",
  page: 1,
  limit: 10,
};

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const [filterParams, setFilterParams] = useState<EmployeeFilterParams>(defaultFilterParams);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterParams.search) params.append("search", filterParams.search);
      if (filterParams.department && filterParams.department !== "All") {
        params.append("department", filterParams.department);
      }
      if (filterParams.isActive !== "all") {
        params.append("isActive", filterParams.isActive);
      }
      params.append("sortBy", filterParams.sortBy);
      params.append("sortOrder", filterParams.sortOrder);
      params.append("page", filterParams.page.toString());
      params.append("limit", filterParams.limit.toString());

      const res = await fetch(`/api/employees?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      try {
        const data = await parseJSONResponse(res);
        if (res.ok) {
          setEmployees(data.employees || []);
          setTotalEmployees(data.total || 0);
          setTotalPages(data.totalPages || 1);
        } else {
          addToast(data?.message || "Failed to load employees", "error");
        }
      } catch (e: any) {
        addToast(e.message || "Network error loading employees", "error");
      }
    } catch (e: any) {
      addToast(e.message || "Network error loading employees", "error");
    } finally {
      setLoading(false);
    }
  }, [filterParams, token]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetch("/api/stats", {
        headers: getAuthHeaders(),
      });
      try {
        const data = await parseJSONResponse(res);
        if (res.ok) {
          setStats(data);
        }
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const openCreateModal = () => {
    setSelectedEmployee(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  const openDetailModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEmployee(null);
  };

  const createEmployee = async (data: Partial<Employee>): Promise<boolean> => {
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      try {
        const resData = await parseJSONResponse(res);
        if (!res.ok) {
          addToast(resData?.message || "Failed to create employee", "error");
          return false;
        }
      } catch (e: any) {
        addToast(e.message || "Error creating employee", "error");
        return false;
      }

      addToast(`Employee ${data.firstName} ${data.lastName} created successfully!`, "success");
      setIsFormModalOpen(false);
      fetchEmployees();
      fetchStats();
      return true;
    } catch (err: any) {
      addToast(err.message || "Error creating employee", "error");
      return false;
    }
  };

  const updateEmployee = async (id: number, data: Partial<Employee>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      let resData: any = null;
      try {
        resData = await parseJSONResponse(res);
        if (!res.ok) {
          addToast(resData?.message || "Failed to update employee", "error");
          return false;
        }
      } catch (e: any) {
        addToast(e.message || "Error updating employee", "error");
        return false;
      }

      addToast(`Employee updated successfully!`, "success");
      setIsFormModalOpen(false);
      if (selectedEmployee && selectedEmployee.id === id) {
        setSelectedEmployee(resData);
      }
      fetchEmployees();
      fetchStats();
      return true;
    } catch (err: any) {
      addToast(err.message || "Error updating employee", "error");
      return false;
    }
  };

  const deleteEmployee = async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      try {
        const resData = await parseJSONResponse(res);
        if (!res.ok) {
          addToast(resData?.message || "Failed to delete employee", "error");
          return false;
        }
      } catch (e: any) {
        addToast(e.message || "Error deleting employee", "error");
        return false;
      }

      addToast("Employee deleted successfully", "success");
      if (selectedEmployee && selectedEmployee.id === id) {
        setIsDetailModalOpen(false);
        setSelectedEmployee(null);
      }
      fetchEmployees();
      fetchStats();
      return true;
    } catch (err: any) {
      addToast(err.message || "Error deleting employee", "error");
      return false;
    }
  };

  const toggleActiveStatus = async (emp: Employee): Promise<boolean> => {
    const newStatus = !emp.isActive;
    return updateEmployee(emp.id, { isActive: newStatus });
  };

  const departmentsList = [
    "Engineering",
    "Human Resources",
    "Finance",
    "Marketing",
    "Operations",
    "Product",
    "Sales",
  ];

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        totalEmployees,
        totalPages,
        loading,
        stats,
        statsLoading,
        filterParams,
        setFilterParams,
        selectedEmployee,
        setSelectedEmployee,
        isFormModalOpen,
        setIsFormModalOpen,
        formMode,
        openCreateModal,
        openEditModal,
        isDetailModalOpen,
        openDetailModal,
        closeDetailModal,
        fetchEmployees,
        fetchStats,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        toggleActiveStatus,
        toasts,
        addToast,
        removeToast,
        departmentsList,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("useEmployees must be used within an EmployeeProvider");
  }
  return context;
}

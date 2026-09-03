"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { EmployeeView } from "@/components/employees/EmployeeView";
import { DepartmentView } from "@/components/departments/DepartmentView";
import { UserManagementView } from "@/components/users/UserManagementView";
import { SettingsView } from "@/components/settings/SettingsView";
import { EmployeeFormModal } from "@/components/employees/EmployeeFormModal";
import { EmployeeDetailModal } from "@/components/employees/EmployeeDetailModal";
import { ToastContainer } from "@/components/shared/ToastContainer";

export function LayoutWrapper() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-300">Initializing Employee Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {currentTab === "dashboard" && <DashboardView setCurrentTab={setCurrentTab} />}
          {currentTab === "employees" && <EmployeeView />}
          {currentTab === "departments" && <DepartmentView setCurrentTab={setCurrentTab} />}
          {currentTab === "users" && <UserManagementView />}
          {currentTab === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Modals & Reactive Floating Toast Notifications */}
      <EmployeeFormModal />
      <EmployeeDetailModal />
      <ToastContainer />
    </div>
  );
}

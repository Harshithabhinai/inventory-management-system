"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/types";
import { parseJSONResponse } from "@/lib/fetchUtils";
import { ShieldCheck, UserCheck, Shield, CheckCircle2, XCircle, Sparkles } from "lucide-react";

export function UserManagementView() {
  const { isAdmin, token, switchRoleDemo, user: currentUser } = useAuth();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      try {
        const data = await parseJSONResponse(res);
        if (res.ok) {
          setUsersList(data);
        }
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: "Admin" | "Employee") => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      try {
        const data = await parseJSONResponse(res);
        if (res.ok) {
          fetchUsers();
        } else {
          console.error(data?.message || "Failed to update user role");
        }
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const permissionMatrix = [
    { feature: "View Dashboard & Metrics", admin: true, employee: true },
    { feature: "Search & Filter Employees", admin: true, employee: true },
    { feature: "Export Employee Data (CSV)", admin: true, employee: true },
    { feature: "Create New Employees", admin: true, employee: false },
    { feature: "Edit Employee Details & Salaries", admin: true, employee: false },
    { feature: "Toggle Active/Inactive Status", admin: true, employee: false },
    { feature: "Delete Employee Profiles", admin: true, employee: false },
    { feature: "User Role Assignment & Security", admin: true, employee: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span>User Access Control & RBAC Permissions</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage system user accounts, grant Admin access, and review authorization policies.
        </p>
      </div>

      {/* Demo Switcher Quick Banner */}
      <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Testing Role-Based Access Control?
          </span>
          <p className="text-xs text-slate-300 mt-1">
            You can instantly toggle your current session role between <strong>Admin</strong> and{" "}
            <strong>Employee</strong> using the sidebar toggle button to test protected routes and action guards.
          </p>
        </div>
        <button
          onClick={() => switchRoleDemo(isAdmin ? "Employee" : "Admin")}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition shrink-0"
        >
          Switch to {isAdmin ? "Employee" : "Admin"} Mode
        </button>
      </div>

      {/* Registered Users Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
          Registered User Accounts
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 uppercase text-[10px] font-semibold text-slate-400">
                <th className="p-3">User ID</th>
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : (
                usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono text-slate-400">#{u.id}</td>
                    <td className="p-3 font-semibold text-slate-200">{u.username}</td>
                    <td className="p-3 text-slate-300">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === "Admin"
                            ? "bg-indigo-950 text-indigo-300 border border-indigo-700/50"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-700/50"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {isAdmin ? (
                        <button
                          onClick={() => handleRoleChange(u.id, u.role === "Admin" ? "Employee" : "Admin")}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition"
                        >
                          Change to {u.role === "Admin" ? "Employee" : "Admin"}
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Admin permissions required</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
          Permission Control Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 uppercase text-[10px] font-semibold text-slate-400">
                <th className="p-3">Feature Capability</th>
                <th className="p-3 text-center">Admin Role</th>
                <th className="p-3 text-center">Employee Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {permissionMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="p-3 font-medium text-slate-200">{item.feature}</td>
                  <td className="p-3 text-center">
                    {item.admin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {item.employee ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

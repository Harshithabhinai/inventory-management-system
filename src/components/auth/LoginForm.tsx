"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Briefcase, Shield, User, Lock, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

export function LoginForm() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Please enter both username/email and password.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    const result = await login({ identifier, password });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message || "Login failed.");
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setIdentifier(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">EmpManager Dashboard</h1>
          <p className="text-xs text-slate-400">
            Enterprise Employee Management System
          </p>
        </div>

        {/* Quick Demo Logins Box */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              Quick Demo Logins:
            </span>
            <span className="text-[10px] text-slate-500">1-Click Auto-fill</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@company.com", "admin123")}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/50 transition text-left group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                <span>Admin User</span>
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">admin@company.com</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("john.doe@company.com", "employee123")}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 transition text-left group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-200 group-hover:text-emerald-300">
                <span>Employee User</span>
                <User className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">john.doe@company.com</p>
            </button>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@company.com or john.doe@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123 or employee123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                "Authenticating..."
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { parseJSONResponse } from "@/lib/fetchUtils";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { identifier: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  switchRoleDemo: (role: "Admin" | "Employee") => void;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        try {
          const data = await parseJSONResponse(res);
          setUser(data.user);
        } catch (err) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (savedToken) {
      setToken(savedToken);
    }
    fetchSession();
  }, []);

  const login = async ({ identifier, password }: { identifier: string; password: string }) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier, password }),
      });
      let data: any = null;
      try {
        data = await parseJSONResponse(res);
      } catch (e: any) {
        return { success: false, message: e.message || "Login failed" };
      }

      if (!res.ok) {
        return { success: false, message: data?.message || "Login failed" };
      }

      setUser(data.user);
      setToken(data.token);
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || "Network error" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    }
  };

  const switchRoleDemo = (role: "Admin" | "Employee") => {
    if (!user) return;
    const updatedUser = { ...user, role };
    setUser(updatedUser);
  };

  const isAdmin = user?.role === "Admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        switchRoleDemo,
        isAdmin,
        refreshUser: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, role?: "Admin" | "Manager" | "Sales") => Promise<void>;
  logout: () => void;
  switchUser: (role: "Admin" | "Manager" | "Sales") => void;
}

const defaultAdmin: User = {
  id: 1,
  name: "Admin User",
  email: "admin@inventory.com",
  role: "Admin",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(defaultAdmin);
  const [token, setToken] = useState<string | null>("jwt_ims_admin_token");

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("ims_user");
      const savedToken = localStorage.getItem("ims_token");
      if (savedUser && savedToken) {
        const t = setTimeout(() => {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        }, 0);
        return () => clearTimeout(t);
      }
    } catch {
      // LocalStorage error fallback
    }
  }, []);

  const login = async (email: string, role: "Admin" | "Manager" | "Sales" = "Admin") => {
    const newUser: User = {
      id: role === "Admin" ? 1 : role === "Manager" ? 2 : 3,
      name: role === "Admin" ? "Admin User" : role === "Manager" ? "Sarah Manager" : "Alex Sales",
      email,
      role,
    };
    const newToken = `jwt_ims_${newUser.id}_${Date.now()}`;
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem("ims_user", JSON.stringify(newUser));
    localStorage.setItem("ims_token", newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("ims_user");
    localStorage.removeItem("ims_token");
  };

  const switchUser = (role: "Admin" | "Manager" | "Sales") => {
    login(`${role.toLowerCase()}@inventory.com`, role);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchUser }}>
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

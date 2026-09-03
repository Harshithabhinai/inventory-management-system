"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { EmployeeProvider } from "@/context/EmployeeContext";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

export default function Home() {
  return (
    <AuthProvider>
      <EmployeeProvider>
        <LayoutWrapper />
      </EmployeeProvider>
    </AuthProvider>
  );
}

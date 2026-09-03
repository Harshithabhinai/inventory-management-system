"use client";

import React, { useState, useEffect } from "react";
import { useEmployees } from "@/context/EmployeeContext";
import { Employee } from "@/types";
import { X, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

export function EmployeeFormModal() {
  const {
    isFormModalOpen,
    setIsFormModalOpen,
    formMode,
    selectedEmployee,
    createEmployee,
    updateEmployee,
    departmentsList,
  } = useEmployees();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "Engineering",
    designation: "",
    salary: "",
    joiningDate: "",
    isActive: true,
    location: "Remote",
    avatarUrl: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formMode === "edit" && selectedEmployee) {
      setFormData({
        firstName: selectedEmployee.firstName || "",
        lastName: selectedEmployee.lastName || "",
        email: selectedEmployee.email || "",
        phone: selectedEmployee.phone || "",
        department: selectedEmployee.department || "Engineering",
        designation: selectedEmployee.designation || "",
        salary: selectedEmployee.salary || "",
        joiningDate: selectedEmployee.joiningDate || "",
        isActive: selectedEmployee.isActive ?? true,
        location: selectedEmployee.location || "Remote",
        avatarUrl: selectedEmployee.avatarUrl || "",
        notes: selectedEmployee.notes || "",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "Engineering",
        designation: "",
        salary: "",
        joiningDate: new Date().toISOString().slice(0, 10),
        isActive: true,
        location: "Remote",
        avatarUrl: "",
        notes: "",
      });
    }
    setErrors({});
    setTouched({});
  }, [formMode, selectedEmployee, isFormModalOpen]);

  if (!isFormModalOpen) return null;

  // Custom Reactive Validators
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case "firstName":
        if (!value || !value.trim()) return "First name is required.";
        if (value.trim().length < 2) return "Must be at least 2 characters.";
        return "";
      case "lastName":
        if (!value || !value.trim()) return "Last name is required.";
        if (value.trim().length < 2) return "Must be at least 2 characters.";
        return "";
      case "email":
        if (!value || !value.trim()) return "Email address is required.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return "Invalid email address format.";
        return "";
      case "phone":
        if (!value || !value.trim()) return "Phone number is required.";
        if (value.trim().length < 7) return "Phone number is too short.";
        return "";
      case "department":
        if (!value) return "Department selection is required.";
        return "";
      case "designation":
        if (!value || !value.trim()) return "Designation/Job Title is required.";
        return "";
      case "salary":
        if (!value || value === "") return "Salary is required.";
        const num = parseFloat(value);
        if (isNaN(num) || num < 20000) return "Salary must be a number >= $20,000.";
        return "";
      case "joiningDate":
        if (!value) return "Joining date is required.";
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, (formData as any)[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));

    if (touched[name]) {
      const err = validateField(name, val);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    const fields = ["firstName", "lastName", "email", "phone", "department", "designation", "salary", "joiningDate"];

    fields.forEach((f) => {
      const err = validateField(f, (formData as any)[f]);
      if (err) {
        newErrors[f] = err;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      fields.reduce((acc, f) => {
        acc[f] = true;
        return acc;
      }, {} as Record<string, boolean>)
    );

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsSubmitting(true);
    let success = false;

    if (formMode === "create") {
      success = await createEmployee(formData);
    } else if (selectedEmployee) {
      success = await updateEmployee(selectedEmployee.id, formData);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {formMode === "create" ? "Add New Employee" : "Edit Employee Record"}
              </h3>
              <p className="text-xs text-slate-400">
                {formMode === "create"
                  ? "Enter employee details and compensation profile"
                  : `Update record for ID #${selectedEmployee?.id}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFormModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                First Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={() => handleBlur("firstName")}
                placeholder="John"
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition ${
                  touched.firstName && errors.firstName
                    ? "border-rose-500/80 focus:border-rose-500"
                    : "border-slate-800 focus:border-indigo-500"
                }`}
              />
              {touched.firstName && errors.firstName && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Last Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={() => handleBlur("lastName")}
                placeholder="Doe"
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition ${
                  touched.lastName && errors.lastName
                    ? "border-rose-500/80 focus:border-rose-500"
                    : "border-slate-800 focus:border-indigo-500"
                }`}
              />
              {touched.lastName && errors.lastName && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                placeholder="john.doe@company.com"
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition ${
                  touched.email && errors.email
                    ? "border-rose-500/80 focus:border-rose-500"
                    : "border-slate-800 focus:border-indigo-500"
                }`}
              />
              {touched.email && errors.email && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur("phone")}
                placeholder="+1 (555) 019-2834"
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition ${
                  touched.phone && errors.phone
                    ? "border-rose-500/80 focus:border-rose-500"
                    : "border-slate-800 focus:border-indigo-500"
                }`}
              />
              {touched.phone && errors.phone && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Row 3: Department & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Department <span className="text-rose-400">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                onBlur={() => handleBlur("department")}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Designation / Job Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                onBlur={() => handleBlur("designation")}
                placeholder="Senior Software Engineer"
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition ${
                  touched.designation && errors.designation
                    ? "border-rose-500/80 focus:border-rose-500"
                    : "border-slate-800 focus:border-indigo-500"
                }`}
              />
              {touched.designation && errors.designation && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.designation}
                </p>
              )}
            </div>
          </div>

          {/* Row 4: Salary & Joining Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Annual Salary ($) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                onBlur={() => handleBlur("salary")}
                placeholder="95000"
                step="1000"
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-mono transition ${
                  touched.salary && errors.salary
                    ? "border-rose-500/80 focus:border-rose-500"
                    : "border-slate-800 focus:border-indigo-500"
                }`}
              />
              {touched.salary && errors.salary && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.salary}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Joining Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                onBlur={() => handleBlur("joiningDate")}
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none transition ${
                  touched.joiningDate && errors.joiningDate
                    ? "border-rose-500/80 focus:border-rose-500"
                    : "border-slate-800 focus:border-indigo-500"
                }`}
              />
              {touched.joiningDate && errors.joiningDate && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.joiningDate}
                </p>
              )}
            </div>
          </div>

          {/* Row 5: Location & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Location / Office
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="San Francisco, CA or Remote"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-300">Active Employee</span>
              </label>
            </div>
          </div>

          {/* Row 6: Avatar URL & Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Avatar Image URL (Optional)
            </label>
            <input
              type="text"
              name="avatarUrl"
              value={formData.avatarUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Internal Notes / Bio
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add internal performance notes or specialization..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Footer Submit Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              {isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{formMode === "create" ? "Create Employee" : "Save Changes"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

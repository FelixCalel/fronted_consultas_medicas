import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "doctor") return <Navigate to="/doctor" replace />;
    if (user.role === "paciente") return <Navigate to="/patient" replace />;
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

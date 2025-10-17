// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getSession } from "../services/auth";

export default function ProtectedRoute() {
  const { token, user } = getSession();

  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si el token existe pero no hay información del usuario, también redirigir
  if (!user || !user.email) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // Si todo está bien, mostrar el contenido protegido
  return <Outlet />;
}

// src/components/PublicRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getSession } from "../services/auth";

export default function PublicRoute() {
  const { token } = getSession();

  // Si ya está logueado, redirigir al home
  if (token) {
    return <Navigate to="/home" replace />;
  }

  // Si no está logueado, mostrar el contenido público (login/register)
  return <Outlet />;
}

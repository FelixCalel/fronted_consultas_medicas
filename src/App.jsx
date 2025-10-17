import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./components/Auth.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Home from "./components/Home.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* Rutas públicas - redirigen a /home si ya está logueado */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
      </Route>

      {/* Rutas privadas - requieren autenticación */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Fallback - redirige según el estado de autenticación */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

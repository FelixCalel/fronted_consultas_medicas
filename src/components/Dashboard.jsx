import React from "react";
import { useNavigate } from "react-router-dom";
import { clearSession } from "../services/auth";

export default function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <div className="page page-dashboard">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">+</div>
          <div className="brand-text">
            <strong>Salud</strong>Agenda
          </div>
        </div>
        <nav className="top-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/home")}
          >
            Volver al Home
          </button>
          <button className="btn btn-ghost" onClick={logout}>
            Cerrar sesión
          </button>
        </nav>
      </header>

      <main className="content">
        <section className="card hero">
          <h1>Bienvenido/a</h1>
          <p>
            Gestiona tus citas médicas con una experiencia moderna, rápida y
            segura.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary">Agendar cita</button>
            <button className="btn btn-outline">Ver calendario</button>
          </div>
        </section>

        <section className="grid">
          <div className="card kpi">
            <div className="kpi-value">12</div>
            <div className="kpi-label">Citas de hoy</div>
          </div>
          <div className="card kpi">
            <div className="kpi-value">4</div>
            <div className="kpi-label">Pendientes</div>
          </div>
          <div className="card kpi">
            <div className="kpi-value">8.9</div>
            <div className="kpi-label">Satisfacción</div>
          </div>
        </section>
      </main>
    </div>
  );
}

// src/components/Home.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSession, getSession } from '../services/auth'

export default function Home(){
  const navigate = useNavigate()
  const { user } = getSession()

  const logout = () => {
    clearSession()
    navigate('/login')
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">+</div>
          <div className="brand-text"><strong>Salud</strong>Agenda</div>
        </div>
        <nav className="top-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Ir al Dashboard</button>
          <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
        </nav>
      </header>

      <main className="content">
        <section className="card hero">
          <h1>Hola {user?.name || '👋'}</h1>
          <p>Esta es tu página de inicio. Desde aquí puedes agendar y gestionar citas.</p>
          <div className="hero-actions">
            <button className="btn btn-primary">Agendar cita</button>
            <button className="btn btn-outline">Ver calendario</button>
          </div>
        </section>

        <section className="grid">
          <div className="card kpi">
            <div className="kpi-value">2</div>
            <div className="kpi-label">Tus próximas citas</div>
          </div>
          <div className="card kpi">
            <div className="kpi-value">1</div>
            <div className="kpi-label">Reagendadas</div>
          </div>
          <div className="card kpi">
            <div className="kpi-value">0</div>
            <div className="kpi-label">Canceladas</div>
          </div>
        </section>
      </main>
    </div>
  )
}

// src/components/Home.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSession, getSession } from '../services/auth'
import PatientDashboard from './PatientDashboard'
import DoctorDashboard from './DoctorDashboard'
import AdminDashboard from './AdminDashboard'

export default function Home(){
  const navigate = useNavigate()
  const { user } = getSession()
  const role = (user?.role || 'paciente').toLowerCase()

  const logout = () => { clearSession(); navigate('/login') }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">+</div>
          <div className="brand-text"><strong>Salud</strong>Agenda</div>
        </div>
        <nav className="top-actions">
          {/* <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Ir al Dashboard</button> */}
          <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
        </nav>
      </header>

      {role === 'paciente' && <PatientDashboard />}
      {role === 'doctor'   && <DoctorDashboard />}
      {role === 'medico'   && <DoctorDashboard />}
      {role === 'admin'    && <AdminDashboard />}
    </div>
  )
}

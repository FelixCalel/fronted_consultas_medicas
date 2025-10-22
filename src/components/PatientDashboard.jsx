// src/components/PatientDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { getSession, saveSession } from '../services/auth'
import {
  listPatientAppointments,
  listSpecialties,
  listDoctors,
  createAppointment,
  cancelAppointment,
} from '../services/appointments'

export default function PatientDashboard() {
  const { user } = getSession()
  const [loading, setLoading] = useState(true)
  const [appts, setAppts] = useState([])
  const [err, setErr] = useState('')

  const [specialties, setSpecialties] = useState([])
  const [doctors, setDoctors] = useState([])
  const [form, setForm] = useState({
    specialty: '',
    doctorId: '',
    date: '',
    time: '',
    reason: '',
  })

  // Modal perfil
  const [showProfile, setShowProfile] = useState(false)
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  // Helpers
  const now = new Date()
  const toDate = (a) => new Date(`${a.date}T${a.time || '00:00'}:00`)
  const fmt = (d) =>
    d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

  const upcoming = useMemo(
    () =>
      appts
        .filter((a) => a.status !== 'cancelada' && toDate(a) >= now)
        .sort((a, b) => toDate(a) - toDate(b)),
    [appts]
  )
  const history = useMemo(
    () =>
      appts
        .filter((a) => toDate(a) < now)
        .sort((a, b) => toDate(b) - toDate(a)),
    [appts]
  )

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const [list, specs] = await Promise.all([
          listPatientAppointments(),
          listSpecialties(),
        ])
        setAppts(list)
        setSpecialties(specs)
      } catch (e) {
        setErr(e?.message || 'No se pudo cargar tus citas.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSelectSpecialty = async (e) => {
    const specialty = e.target.value
    setForm({ ...form, specialty, doctorId: '' })
    const docs = await listDoctors(specialty)
    setDoctors(docs)
  }

  const reservar = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const doc = doctors.find((d) => String(d.id) === String(form.doctorId))
      const payload = {
        specialty: form.specialty,
        doctorId: Number(form.doctorId),
        doctorName: doc?.name,
        date: form.date,
        time: form.time,
        reason: form.reason,
        patientName: user?.name,
        status: 'pendiente',
      }
      const created = await createAppointment(payload)
      setAppts((prev) => [...prev, created])
      setForm({ specialty: '', doctorId: '', date: '', time: '', reason: '' })
    } catch (e) {
      setErr(e?.message || 'No se pudo reservar la cita')
    }
  }

  const cancelar = async (id) => {
    await cancelAppointment(id)
    setAppts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'cancelada' } : a)))
  }

  const saveProfileLocal = (e) => {
    e.preventDefault()
    const current = getSession()
    const updated = { ...(current.user || {}), ...profile }
    saveSession({ token: current.token, user: updated })
    setShowProfile(false)
  }

  return (
    <div className="content content--patient">
      {/* HERO */}
      <section className="card hero hero--patient">
        <div>
          <h1>Hola <span className="highlight">{user?.name}</span></h1>
          <p className="muted">Gestiona tus citas médicas desde aquí.</p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-outline" onClick={() => setShowProfile(true)}>
            Editar perfil
          </button>
        </div>
      </section>

      {err && <div className="alert">{err}</div>}
      {loading ? (
        <div className="card">Cargando…</div>
      ) : (
        <>
          {/* GRID PRINCIPAL: Próximas + Reservar */}
          <section className="grid grid--patient">
            {/* Próximas citas */}
            <div className="card card--block">
              <div className="card-header">
                <h3>Próximas citas</h3>
              </div>

              {upcoming.length === 0 ? (
                <div className="empty">
                  <p className="muted">No tienes próximas citas.</p>
                </div>
              ) : (
                <ul className="appt-list">
                  {upcoming.map((a) => (
                    <li key={a.id} className="appt-item">
                      <div className="appt-time">
                        <div className="appt-date">{fmt(toDate(a))}</div>
                        <span className={`chip chip--${a.status}`}>{a.status}</span>
                      </div>

                      <div className="appt-info">
                        <div className="appt-title">
                          {a.specialty} <span className="sep">•</span> {a.doctorName}
                        </div>
                        {a.reason ? <div className="appt-reason">{a.reason}</div> : null}
                      </div>

                      <div className="appt-actions">
                        {/* (placeholder) <button className="btn btn-secondary btn-sm">Reprogramar</button> */}
                        <button className="btn btn-danger btn-sm" onClick={() => cancelar(a.id)}>
                          Cancelar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Reservar cita */}
            <div className="card card--block">
              <div className="card-header">
                <h3>Reservar nueva cita</h3>
              </div>

              <form className="form form--compact" onSubmit={reservar}>
                <div className="form-row">
                  <label>
                    <span>Especialidad</span>
                    <select name="specialty" value={form.specialty} onChange={onSelectSpecialty} required>
                      <option value="">Selecciona…</option>
                      {specialties.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Doctor</span>
                    <select name="doctorId" value={form.doctorId} onChange={onChange} required>
                      <option value="">Selecciona…</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    <span>Fecha</span>
                    <input type="date" name="date" value={form.date} onChange={onChange} required />
                  </label>
                  <label>
                    <span>Hora</span>
                    <input type="time" name="time" value={form.time} onChange={onChange} required />
                  </label>
                </div>

                <label>
                  <span>Motivo de la cita</span>
                  <input
                    type="text"
                    name="reason"
                    placeholder="Describe brevemente el motivo"
                    value={form.reason}
                    onChange={onChange}
                    required
                  />
                </label>

                <div className="row-actions row-actions--end">
                  <button className="btn btn-primary" type="submit">
                    Reservar
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Historial */}
          <section className="card card--block">
            <div className="card-header">
              <h3>Historial de citas</h3>
            </div>

            {history.length === 0 ? (
              <div className="empty">
                <p className="muted">Aún no tienes historial.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="table table--zebra table--sticky">
                  <thead>
                    <tr>
                      <th>Fecha y hora</th>
                      <th>Especialidad</th>
                      <th>Doctor</th>
                      <th>Motivo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((a) => (
                      <tr key={a.id}>
                        <td>{fmt(toDate(a))}</td>
                        <td>{a.specialty}</td>
                        <td>{a.doctorName}</td>
                        <td className="truncate">{a.reason}</td>
                        <td>
                          <span className={`chip chip--${a.status}`}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* MODAL PERFIL */}
      {showProfile && (
        <div className="modal-backdrop" onClick={() => setShowProfile(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar perfil</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowProfile(false)}>✕</button>
            </div>
            <form className="form" onSubmit={saveProfileLocal}>
              <label>
                <span>Nombre</span>
                <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
              </label>
              <label>
                <span>Correo</span>
                <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
              </label>
              <label>
                <span>Teléfono</span>
                <input value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </label>
              <div className="row-actions row-actions--end">
                <button type="button" className="btn btn-ghost" onClick={() => setShowProfile(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

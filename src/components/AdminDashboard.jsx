// src/components/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react"
import {
  listAllAppointments,
  updateAppointmentStatus,
  listDoctors,
  addSpecialty as svcAddSpecialty,
  addBlockedSlot,
} from "../services/appointments"

export default function AdminDashboard() {
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")

  // Filtros
  const [q, setQ] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [status, setStatus] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [doctor, setDoctor] = useState("")

  // Modales
  const [showUser, setShowUser] = useState(false)
  const [showSpec, setShowSpec] = useState(false)
  const [showSched, setShowSched] = useState(false)

  // Datos auxiliares para modales
  const [doctors, setDoctors] = useState([])
  useEffect(() => { (async () => setDoctors(await listDoctors()))() }, [])

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const data = await listAllAppointments()
        setAppts(data)
      } catch (e) {
        setErr(e?.message || "No se pudieron cargar las citas.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Catálogos a partir de los datos
  const catalogs = useMemo(() => {
    const doctors = Array.from(new Set(appts.map(a => a.doctorName).filter(Boolean))).sort()
    const specialties = Array.from(new Set(appts.map(a => a.specialty).filter(Boolean))).sort()
    const statuses = Array.from(new Set(appts.map(a => a.status).filter(Boolean)))
    return { doctors, specialties, statuses }
  }, [appts])

  // Filtro
  const inRange = (a) => {
    if (dateFrom && a.date < dateFrom) return false
    if (dateTo && a.date > dateTo) return false
    return true
  }
  const matchesQ = (a) => {
    if (!q) return true
    const t = `${a.patientName} ${a.doctorName} ${a.specialty} ${a.reason} ${a.status}`.toLowerCase()
    return t.includes(q.toLowerCase())
  }
  const filtered = appts
    .filter(a => (status ? a.status === status : true))
    .filter(a => (specialty ? a.specialty === specialty : true))
    .filter(a => (doctor ? a.doctorName === doctor : true))
    .filter(inRange)
    .filter(matchesQ)
    .sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time))

  // KPIs / Totales sobre lo filtrado
  const totals = useMemo(() => {
    const init = { byDoctor:{}, bySpecialty:{}, byStatus:{}, total:0 }
    for (const a of filtered) {
      init.byDoctor[a.doctorName] = (init.byDoctor[a.doctorName] || 0) + 1
      init.bySpecialty[a.specialty] = (init.bySpecialty[a.specialty] || 0) + 1
      init.byStatus[a.status] = (init.byStatus[a.status] || 0) + 1
      init.total++
    }
    return init
  }, [filtered])

  // Acciones Admin (estado)
  const updateStatus = async (id, newStatus) => {
    const updated = await updateAppointmentStatus(id, newStatus)
    setAppts(prev => prev.map(a => a.id === id ? updated : a))
  }

  // Export CSV (filtrado)
  const quoteCSV = (s) => `"${String(s).replaceAll('"','""')}"` // helper
  const exportCSV = () => {
    const header = ["Fecha","Hora","Paciente","Doctor","Especialidad","Motivo","Estado"]
    const rows = filtered.map(a => [a.date,a.time,a.patientName,a.doctorName,a.specialty,quoteCSV(a.reason||""),a.status])
    const csv = [header, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `citas_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ====== Modal: Crear usuario (mock en localStorage) ======
  const [userForm, setUserForm] = useState({ name:"", email:"", phone:"", role:"paciente" })
  const saveUser = (e) => {
    e.preventDefault()
    const key = "admin_mock_users"
    const list = JSON.parse(localStorage.getItem(key) || "[]")
    list.push({ id: Date.now(), ...userForm })
    localStorage.setItem(key, JSON.stringify(list))
    setShowUser(false)
    setUserForm({ name:"", email:"", phone:"", role:"paciente" })
    alert("Usuario guardado (mock).")
  }

  // ====== Modal: Alta especialidad ======
  const [specName, setSpecName] = useState("")
  const addSpecialty = async (e) => {
    e.preventDefault()
    if (!specName.trim()) return
    await svcAddSpecialty(specName.trim())
    setSpecName("")
    setShowSpec(false)
    alert("Especialidad agregada (mock). Puedes usarla en formularios.")
  }

  // ====== Modal: Configurar horarios (bloqueos) ======
  const [schedForm, setSchedForm] = useState({ doctorId:"", date:"", start:"", end:"", note:"" })
  const saveSchedule = async (e) => {
    e.preventDefault()
    const { doctorId, date, start, end, note } = schedForm
    if (!doctorId || !date || !start || !end) return
    if (end <= start) { alert("Fin debe ser mayor a inicio."); return }
    await addBlockedSlot({ doctorId: Number(doctorId), date, start, end, note })
    setShowSched(false)
    setSchedForm({ doctorId:"", date:"", start:"", end:"", note:"" })
    alert("Horario bloqueado (mock).")
  }

  return (
    <div className="content content--admin">
      {/* HERO */}
      <section className="card hero hero--admin">
        <div>
          <h1>Panel de Administración</h1>
        <p className="muted">Gestiona usuarios, doctores, especialidades y todas las citas.</p>
        </div>
        <div className="hero-actions hero-actions--stack">
          <button className="btn btn-secondary" onClick={() => setShowUser(true)}>Crear usuario</button>
          <button className="btn btn-secondary" onClick={() => setShowSpec(true)}>Alta especialidad</button>
          <button className="btn btn-secondary" onClick={() => setShowSched(true)}>Config. horarios</button>
        </div>
      </section>

      {err && <div className="alert">{err}</div>}

      {/* KPIs */}
      <section className="grid grid--kpi-3">
        <div className="card kpi kpi--tile">
          <div className="kpi-value">{totals.total}</div>
          <div className="kpi-label">Total citas</div>
        </div>
        <div className="card">
          <h3>Por estado</h3>
          <ul className="list list--kv">
            {Object.entries(totals.byStatus).map(([k,v]) => (
              <li key={k} className="list-row"><strong>{k}</strong><span className="badge">{v}</span></li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>Por especialidad</h3>
          <ul className="list list--kv">
            {Object.entries(totals.bySpecialty).map(([k,v]) => (
              <li key={k} className="list-row"><strong>{k}</strong><span className="badge">{v}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* Filtros */}
      <section className="card card--block">
        <div className="filters">
          <div className="filters-row">
            <label>
              <span>Desde</span>
              <input className="input" type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
            </label>
            <label>
              <span>Hasta</span>
              <input className="input" type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} />
            </label>
            <label>
              <span>Estado</span>
              <select className="input" value={status} onChange={e=>setStatus(e.target.value)}>
                <option value="">Todos</option>
                {catalogs.statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>
              <span>Especialidad</span>
              <select className="input" value={specialty} onChange={e=>setSpecialty(e.target.value)}>
                <option value="">Todas</option>
                {catalogs.specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>
              <span>Doctor</span>
              <select className="input" value={doctor} onChange={e=>setDoctor(e.target.value)}>
                <option value="">Todos</option>
                {catalogs.doctors.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label className="grow">
              <span>Buscar</span>
              <input className="input" type="search" placeholder="Paciente / motivo / etc." value={q} onChange={e=>setQ(e.target.value)} />
            </label>
          </div>
          <div className="row-actions">
            <button className="btn btn-outline" onClick={() => { setQ(""); setDateFrom(""); setDateTo(""); setStatus(""); setSpecialty(""); setDoctor(""); }}>
              Limpiar filtros
            </button>
            <button className="btn btn-primary" onClick={exportCSV}>Exportar CSV</button>
          </div>
        </div>
      </section>

      {/* Por doctor */}
      <section className="card">
        <h3>Por doctor</h3>
        {Object.keys(totals.byDoctor).length === 0
          ? <p className="muted">Sin datos.</p>
          : (
            <ul className="list list--kv">
              {Object.entries(totals.byDoctor).map(([k,v]) => (
                <li key={k} className="list-row"><strong>{k}</strong><span className="badge">{v}</span></li>
              ))}
            </ul>
          )
        }
      </section>

      {/* Tabla principal */}
      <section className="card card--block">
        <div className="card-header">
          <h3>Todas las citas</h3>
          <div className="muted">{filtered.length} resultado(s)</div>
        </div>

        {loading ? (
          <p>Cargando…</p>
        ) : (
          <div className="table-wrap">
            <table className="table table--zebra table--sticky">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Doctor</th>
                  <th>Especialidad</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th style={{width:280}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>{a.date}</td>
                    <td><strong>{a.time}</strong></td>
                    <td>{a.patientName}</td>
                    <td>{a.doctorName}</td>
                    <td>{a.specialty}</td>
                    <td className="truncate">{a.reason}</td>
                    <td><span className={`chip chip--${a.status}`}>{a.status}</span></td>
                    <td className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(a.id, "cancelada")}>Forzar cancelación</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(a.id, "confirmada")}>Confirmar</button>
                      <button className="btn btn-primary btn-sm" onClick={() => updateStatus(a.id, "atendida")}>Marcar atendida</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ===== Modales ===== */}

      {/* Crear usuario */}
      {showUser && (
        <div className="modal-backdrop" onClick={() => setShowUser(false)}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear usuario</h3>
              <button className="btn btn-ghost btn-sm" onClick={()=>setShowUser(false)}>✕</button>
            </div>
            <form className="form" onSubmit={saveUser}>
              <div className="form-row">
                <label><span>Nombre</span><input required value={userForm.name} onChange={e=>setUserForm({...userForm, name:e.target.value})} /></label>
                <label><span>Email</span><input required type="email" value={userForm.email} onChange={e=>setUserForm({...userForm, email:e.target.value})} /></label>
              </div>
              <div className="form-row">
                <label><span>Teléfono</span><input value={userForm.phone} onChange={e=>setUserForm({...userForm, phone:e.target.value})} /></label>
                <label>
                  <span>Rol</span>
                  <select value={userForm.role} onChange={e=>setUserForm({...userForm, role:e.target.value})}>
                    <option value="paciente">Paciente</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </div>
              <div className="row-actions row-actions--end">
                <button type="button" className="btn btn-ghost" onClick={()=>setShowUser(false)}>Cancelar</button>
                <button className="btn btn-primary" type="submit">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alta especialidad */}
      {showSpec && (
        <div className="modal-backdrop" onClick={() => setShowSpec(false)}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Alta de especialidad</h3>
              <button className="btn btn-ghost btn-sm" onClick={()=>setShowSpec(false)}>✕</button>
            </div>
            <form className="form" onSubmit={addSpecialty}>
              <label><span>Nombre de la especialidad</span>
                <input autoFocus required value={specName} onChange={e=>setSpecName(e.target.value)} placeholder="Ej. Neurología" />
              </label>
              <div className="row-actions row-actions--end">
                <button type="button" className="btn btn-ghost" onClick={()=>setShowSpec(false)}>Cancelar</button>
                <button className="btn btn-primary" type="submit">Agregar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configurar horarios */}
      {showSched && (
        <div className="modal-backdrop" onClick={() => setShowSched(false)}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Configurar horarios (bloqueos)</h3>
              <button className="btn btn-ghost btn-sm" onClick={()=>setShowSched(false)}>✕</button>
            </div>
            <form className="form" onSubmit={saveSchedule}>
              <div className="form-row">
                <label>
                  <span>Doctor</span>
                  <select required value={schedForm.doctorId} onChange={e=>setSchedForm({...schedForm, doctorId:e.target.value})}>
                    <option value="">Selecciona…</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </label>
                <label>
                  <span>Fecha</span>
                  <input type="date" required value={schedForm.date} onChange={e=>setSchedForm({...schedForm, date:e.target.value})} />
                </label>
              </div>
              <div className="form-row">
                <label><span>Inicio</span><input type="time" required value={schedForm.start} onChange={e=>setSchedForm({...schedForm, start:e.target.value})} /></label>
                <label><span>Fin</span><input type="time" required value={schedForm.end} onChange={e=>setSchedForm({...schedForm, end:e.target.value})} /></label>
              </div>
              <label><span>Nota</span><input value={schedForm.note} onChange={e=>setSchedForm({...schedForm, note:e.target.value})} placeholder="Opcional" /></label>
              <div className="row-actions row-actions--end">
                <button type="button" className="btn btn-ghost" onClick={()=>setShowSched(false)}>Cancelar</button>
                <button className="btn btn-primary" type="submit">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

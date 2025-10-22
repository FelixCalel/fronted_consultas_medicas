// src/services/appointments.js
import http from './http'
import { getSession } from './auth'

const useMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

// ===== MOCK DATA =====
let MOCK_APPTS = [
  { id: 1, patientName: 'Demo User', patientId: 100, doctorId: 201, doctorName: 'Dra. Martínez', specialty: 'Dermatología', date: '2025-10-22', time: '10:30', reason: 'Chequeo', status: 'confirmada' },
  { id: 2, patientName: 'Demo User', patientId: 100, doctorId: 202, doctorName: 'Dr. Pérez',     specialty: 'Cardiología',  date: '2025-10-10', time: '14:00', reason: 'Dolor pecho', status: 'atendida' },
]
const MOCK_SPECIALTIES = ['Dermatología', 'Cardiología', 'Pediatría', 'Medicina General']
const MOCK_DOCTORS = [
  { id: 201, name: 'Dra. Martínez', specialty: 'Dermatología' },
  { id: 202, name: 'Dr. Pérez',     specialty: 'Cardiología'  },
  { id: 203, name: 'Dra. Gómez',    specialty: 'Pediatría'    },
]
// Bloqueos de horarios (por doctor)
let MOCK_BLOCKS = [
  // { id: 1, doctorId: 201, date: '2025-10-22', start: '09:00', end: '09:30', note: 'Reunión' }
]
const nextId = (arr) => Math.max(0, ...arr.map(a => a.id || 0)) + 1

// ===== PACIENTE =====
export async function listPatientAppointments() {
  if (useMock) {
    const { user } = getSession()
    return MOCK_APPTS.filter(a => a.patientName === (user?.name || ''))
  }
  const { data } = await http.get('/appointments/me')
  return data
}

export async function createAppointment(payload) {
  if (useMock) {
    const id = nextId(MOCK_APPTS)
    const item = { id, status: 'pendiente', ...payload }
    MOCK_APPTS.push(item)
    return item
  }
  const { data } = await http.post('/appointments', payload)
  return data
}

export async function cancelAppointment(id) {
  return updateAppointmentStatus(id, 'cancelada')
}

export async function listSpecialties() {
  if (useMock) return MOCK_SPECIALTIES
  const { data } = await http.get('/specialties')
  return data
}

export async function listDoctors(specialty) {
  if (useMock) return specialty ? MOCK_DOCTORS.filter(d => d.specialty === specialty) : MOCK_DOCTORS
  const { data } = await http.get('/doctors', { params: { specialty } })
  return data
}

// ===== DOCTOR =====
export async function listDoctorAppointments(dateISO) {
  if (useMock) {
    const date = dateISO || new Date().toISOString().slice(0,10)
    // (mock simple) Trae citas del día independientemente del doctorName
    return MOCK_APPTS.filter(a => a.date === date)
  }
  const { data } = await http.get('/appointments/doctor', { params: { date: dateISO } })
  return data
}

export async function updateAppointmentStatus(id, status) {
  if (useMock) {
    MOCK_APPTS = MOCK_APPTS.map(a => a.id === id ? { ...a, status } : a)
    return MOCK_APPTS.find(a => a.id === id)
  }
  const { data } = await http.patch(`/appointments/${id}/status`, { status })
  return data
}

// ===== ADMIN =====
export async function listAllAppointments(params = {}) {
  if (useMock) return MOCK_APPTS
  const { data } = await http.get('/appointments', { params })
  return data
}

// ===== BLOQUEOS (Doctor) =====
export async function listBlockedSlots(doctorId) {
  if (useMock) return MOCK_BLOCKS.filter(b => b.doctorId === doctorId)
  const { data } = await http.get(`/doctors/${doctorId}/blocks`)
  return data
}

export async function addBlockedSlot({ doctorId, date, start, end, note }) {
  if (useMock) {
    const item = { id: nextId(MOCK_BLOCKS), doctorId, date, start, end, note }
    MOCK_BLOCKS.push(item)
    return item
  }
  const { data } = await http.post(`/doctors/${doctorId}/blocks`, { date, start, end, note })
  return data
}

export async function removeBlockedSlot(id) {
  if (useMock) {
    MOCK_BLOCKS = MOCK_BLOCKS.filter(b => b.id !== id)
    return { ok: true }
  }
  const { data } = await http.delete(`/blocks/${id}`)
  return data
}

export async function addSpecialty(name) {
  const trimmed = String(name || "").trim()
  if (!trimmed) return { ok:false }
  if (useMock) {
    if (!MOCK_SPECIALTIES.includes(trimmed)) MOCK_SPECIALTIES.push(trimmed)
    return { ok:true }
  }
  // Backend real
  const { data } = await http.post('/specialties', { name: trimmed })
  return data
}
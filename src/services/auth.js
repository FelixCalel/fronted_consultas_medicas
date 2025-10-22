// src/services/auth.js
import axios from 'axios'

/**
 * Intenta login contra API: POST /api/auth/login
 * Si está activado el modo mock (VITE_USE_MOCK_AUTH=true),
 * valida contra credenciales de prueba y genera token local.
 */
export async function login({ email, password }) {
  const useMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

  if (useMock) {
    // 🔐 Credenciales demo
    const DEMO_EMAIL = 'demo@salud.agenda'
    const DEMO_PASS  = 'Demo1234!'
    if (email === DEMO_EMAIL && password === DEMO_PASS) {
      const token = 'mock-demo-token-' + Date.now()
      const user  = { name: 'Demo User', email, role: 'paciente' }
      return { token, user, isMock: true }
    }
    const err = new Error('Credenciales de prueba inválidas')
    err.code = 'MOCK_INVALID'
    throw err
  }

  // 👇 Producción / Backend real
  const { data } = await axios.post('/api/auth/login', { email, password })
  // Espera: { token, user } desde tu API
  return { token: data.token, user: data.user, isMock: false }
}

export function saveSession({ token, user }) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user || {}))
}

export function getSession() {
  const token = localStorage.getItem('token')
  const user  = JSON.parse(localStorage.getItem('user') || '{}')
  return { token, user }
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

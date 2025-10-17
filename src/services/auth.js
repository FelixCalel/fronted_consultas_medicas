import axios from "axios";

export async function login({ email, password }) {
  const useMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

  if (useMock) {
    const DEMO_EMAIL = "demo@salud.agenda";
    const DEMO_PASS = "Demo1234!";
    if (email === DEMO_EMAIL && password === DEMO_PASS) {
      const token = "mock-demo-token-" + Date.now();
      const user = { name: "Demo User", email, role: "paciente" };
      return { token, user, isMock: true };
    }
    const err = new Error("Credenciales de prueba inválidas");
    err.code = "MOCK_INVALID";
    throw err;
  }

  const { data } = await axios.post("/api/auth/login", { email, password });
  return { token: data.token, user: data.user, isMock: false };
}

export function saveSession({ token, user }) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user || {}));
}

export function getSession() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return { token, user };
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function logout() {
  clearSession();
}

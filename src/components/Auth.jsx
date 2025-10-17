import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { login as apiLogin, saveSession, getSession } from "../services/auth";
import VerificationAlert from "./VerificationAlert";

export default function Auth() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isLogin = !pathname.includes("/register");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showResendButton, setShowResendButton] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "PATIENT",
  });

  useEffect(() => {
    const { token } = getSession();
    if (token) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleResendVerification = async (email) => {
    setResendLoading(true);
    try {
      await axios.post("/api/auth/resend-verification", { email });
      setError(
        "Correo de verificación reenviado. Revisa tu bandeja de entrada."
      );
    } catch (err) {
      setError("❌ Error al reenviar el correo. Inténtalo de nuevo.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setShowResendButton(false);
    setLoading(true);
    try {
      const result = await apiLogin(loginForm);
      saveSession(result);
      navigate("/home");
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo iniciar sesión.";

      const errorData = err?.response?.data;

      if (
        errorData?.requiresEmailVerification ||
        errorMessage.toLowerCase().includes("verificar") ||
        errorMessage.toLowerCase().includes("verify") ||
        errorMessage.toLowerCase().includes("confirm") ||
        errorMessage.toLowerCase().includes("not verified") ||
        errorMessage.toLowerCase().includes("email verification")
      ) {
        setError(
          "⚠️ Debes verificar tu cuenta antes de iniciar sesión. " +
            "Revisa tu correo electrónico y haz clic en el enlace de verificación."
        );
        setShowResendButton(true);
        setRegisteredEmail(errorData?.userEmail || loginForm.email);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const registerData = {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        role: registerForm.role,
      };

      await axios.post("/api/auth/register", registerData);

      setRegisteredEmail(registerForm.email);
      setShowVerificationAlert(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo crear la cuenta. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseVerificationAlert = () => {
    setShowVerificationAlert(false);
    setRegisteredEmail("");
    navigate("/login");
  };

  return (
    <>
      {showVerificationAlert && (
        <VerificationAlert
          email={registeredEmail}
          onClose={handleCloseVerificationAlert}
        />
      )}
      <div className="auth-page">
        <div className="auth-card">
          <div
            className={`auth-panels ${
              isLogin ? "show-login" : "show-register"
            }`}
          >
            {/* Login */}
            <section className="panel panel-login">
              <div className="panel-content">
                <div className="brand">
                  <div className="brand-mark">+</div>
                  <div className="brand-text">
                    <strong>Salud</strong>Agenda
                  </div>
                </div>

                <h2>Inicia sesión</h2>
                <p className="muted">
                  Accede para gestionar tus citas médicas.
                </p>
                {error && <div className="alert">{error}</div>}

                <form onSubmit={handleLogin} className="form">
                  <label>
                    <span>Correo electrónico</span>
                    <input
                      type="email"
                      placeholder="tucorreo@dominio.com"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                      required
                    />
                  </label>
                  <label>
                    <span>Contraseña</span>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      required
                    />
                  </label>

                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Entrando…" : "Entrar"}
                  </button>
                </form>

                {showResendButton && (
                  <div style={{ marginTop: "1rem", textAlign: "center" }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleResendVerification(registeredEmail)}
                      disabled={resendLoading}
                      style={{
                        fontSize: "0.9rem",
                        padding: "0.5rem 1rem",
                        backgroundColor: "#17a2b8",
                        border: "none",
                        borderRadius: "4px",
                        color: "white",
                      }}
                    >
                      {resendLoading
                        ? "Reenviando..."
                        : "Reenviar correo de verificación"}
                    </button>
                  </div>
                )}

                <div className="ghost-cta">
                  ¿No tienes cuenta?
                  <button
                    type="button"
                    className="link"
                    onClick={() => navigate("/register")}
                  >
                    Crear cuenta
                  </button>
                </div>

                <p
                  className="muted"
                  style={{ marginTop: ".75rem", fontSize: ".9rem" }}
                >
                  <strong>Demo:</strong> demo@salud.agenda / Demo1234! &nbsp;
                  <code style={{ opacity: 0.8 }}>VITE_USE_MOCK_AUTH=true</code>
                </p>
              </div>

              <div className="panel-aside">
                <h3>Atención moderna</h3>
                <p>
                  Agenda, reprograma y gestiona tus citas con una interfaz
                  limpia y accesible.
                </p>
                <ul className="bullets">
                  <li>Recordatorios inteligentes</li>
                  <li>Calendario interactivo</li>
                  <li>Perfil de paciente y médico</li>
                </ul>
              </div>
            </section>

            {/* Register */}
            <section className="panel panel-register">
              <div className="panel-content">
                <div className="brand">
                  <div className="brand-mark">+</div>
                  <div className="brand-text">
                    <strong>Salud</strong>Agenda
                  </div>
                </div>

                <h2>Crea tu cuenta</h2>
                <p className="muted">
                  Empieza a gestionar tus citas en pocos segundos.
                </p>
                {error && <div className="alert">{error}</div>}

                <form onSubmit={handleRegister} className="form">
                  <label>
                    <span>Nombre completo</span>
                    <input
                      type="text"
                      placeholder="Ej. Ana López"
                      value={registerForm.name}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <label>
                    <span>Correo electrónico</span>
                    <input
                      type="email"
                      placeholder="tucorreo@dominio.com"
                      value={registerForm.email}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <label>
                    <span>Contraseña</span>
                    <input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Creando…" : "Crear cuenta"}
                  </button>
                </form>

                <div className="ghost-cta">
                  ¿Ya tienes cuenta?
                  <button
                    type="button"
                    className="link"
                    onClick={() => navigate("/login")}
                  >
                    Inicia sesión
                  </button>
                </div>
              </div>

              <div className="panel-aside">
                <h3>Experiencia fluida</h3>
                <p>
                  Unifica tu registro y acceso en una sola vista con transición
                  elegante.
                </p>
                <ul className="bullets">
                  <li>Validaciones rápidas</li>
                  <li>Diseño adaptable</li>
                  <li>Accesible y seguro</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

import { useState } from "react";
import "../styles/doctor_dashboard.css";

export default function DoctorDashboard() {
  const [mostrarBloqueo, setMostrarBloqueo] = useState(false);

  const doctor = {
    nombre: "Dr. Juan Pérez",
    especialidad: "Cardiología",
  };

  const citas = [
    { id: 1, paciente: "María López", motivo: "Chequeo general", estado: "Pendiente" },
    { id: 2, paciente: "Carlos Gómez", motivo: "Dolor de pecho", estado: "Confirmada" },
    { id: 3, paciente: "Ana Ruiz", motivo: "Control de presión", estado: "Atendida" },
  ];

  const estadisticas = {
    pendientes: 2,
    atendidas: 5,
    canceladas: 1,
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard del Doctor</h1>

      {/* Información principal */}
      <section className="info-section">
        <h2>Información principal</h2>
        <p><strong>Nombre del doctor:</strong> {doctor.nombre}</p>
        <p><strong>Especialidad:</strong> {doctor.especialidad}</p>
      </section>

      {/* Agenda del día */}
      <section className="appointments-section">
        <h2>Agenda del día</h2>
        <table>
          <thead>
            <tr>
              <th>Nombre del Paciente</th>
              <th>Motivo de Consulta</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {citas.map((cita) => (
              <tr key={cita.id}>
                <td>{cita.paciente}</td>
                <td>{cita.motivo}</td>
                <td>{cita.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Estadísticas */}
      <section className="stats-section">
        <h2>Estadísticas</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{estadisticas.pendientes}</h3>
            <p>Citas pendientes</p>
          </div>
          <div className="stat-card">
            <h3>{estadisticas.atendidas}</h3>
            <p>Citas atendidas</p>
          </div>
          <div className="stat-card">
            <h3>{estadisticas.canceladas}</h3>
            <p>Citas canceladas</p>
          </div>
        </div>
      </section>

      {/* Acciones */}
      <section className="actions-section">
        <h2>Acciones</h2>
        <button>Confirmar / Cancelar cita</button>
        <button>Marcar cita como atendida</button>
        <button onClick={() => setMostrarBloqueo(!mostrarBloqueo)}>
          Bloquear horarios no disponibles
        </button>
      </section>

      {/* Formulario de bloqueo */}
      {mostrarBloqueo && (
        <section className="form-section">
          <h2>Bloquear horarios no disponibles</h2>
          <form>
            <label>
              Fecha:
              <input type="date" />
            </label>
            <label>
              Hora de inicio:
              <input type="time" />
            </label>
            <label>
              Hora de fin:
              <input type="time" />
            </label>
            <button type="submit">Bloquear</button>
          </form>
        </section>
      )}
    </div>
  );
}

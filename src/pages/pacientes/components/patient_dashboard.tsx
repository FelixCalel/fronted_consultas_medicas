import { useState } from "react";
import "../styles/patient_dashboard.css";

export default function PatientDashboard() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard del Paciente</h1>

      {/* Información Del Paciente */}
      <section className="info-section">
        <h2>Información principal</h2>
        <p><strong>Nombre:</strong> {`{paciente.nombre}`}</p>
        <p><strong>Apellido:</strong> {`{paciente.apellido}`}</p>
        <p><strong>Edad:</strong> {`{paciente.edad}`}</p>
        <p><strong>Email:</strong> {`{paciente.email}`}</p>
      </section>

      {/* Historial de citas */}
      <section className="appointments-section">
        <h2>Historial de citas</h2>
        <ul>
          <li>{`{cita.especialidad} - {cita.fecha} - {cita.doctor}`}</li>
        </ul>
      </section>

      {/* Próximas citas */}
      <section className="appointments-section">
        <h2>Próximas citas</h2>
        <ul>
          <li>{`{cita.especialidad} - {cita.fecha} - {cita.doctor}`}</li>
        </ul>
      </section>

      {/* Acciones */}
      <section className="actions-section">
        <h2>Acciones</h2>
        <button onClick={() => setMostrarFormulario(!mostrarFormulario)}>Reservar nueva cita</button>
        <button>Cancelar cita</button>
        <button>Editar perfil</button>
      </section>

      {/* Formulario para reservar cita */}
      {mostrarFormulario && (
        <section className="form-section">
          <h2>Reservar nueva cita</h2>
          <form>
            <label>
              Especialidad:
              <input type="text" />
            </label>
            <label>
              Doctor:
              <input type="text" />
            </label>
            <label>
              Fecha:
              <input type="date" />
            </label>
            <label>
              Hora:
              <input type="time" />
            </label>
            <label>
              Motivo de la cita:
              <textarea></textarea>
            </label>
            <button type="submit">Confirmar</button>
          </form>
        </section>
      )}
    </div>
  );
}

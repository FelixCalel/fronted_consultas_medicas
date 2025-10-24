import React, { useEffect, useMemo, useState } from "react";
import { searchPatients } from "../services/patients";
import { getSession } from "../services/auth";
import {
  createAppointment,
  listDoctorAppointments,
  updateAppointmentStatus,
  listBlockedSlots,
  addBlockedSlot,
  removeBlockedSlot,
} from "../services/appointments";

export default function DoctorDashboard() {
  const { user } = getSession();
  const doctorId = user?.id || 201;
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const [blocks, setBlocks] = useState([]);
  const [blockForm, setBlockForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    start: "",
    end: "",
    note: "",
  });
  const [savingBlock, setSavingBlock] = useState(false);

  const [patientQuery, setPatientQuery] = useState("");
  const [patientOptions, setPatientOptions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [apptForm, setApptForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: "",
    reason: "",
  });
  const [savingAppt, setSavingAppt] = useState(false);
  const [apptMsg, setApptMsg] = useState("");

  const inDate = (a) => a.date === date;
  const matchesQ = (a) => {
    if (!q) return true;
    const t = `${a.patientName} ${a.reason} ${a.status}`.toLowerCase();
    return t.includes(q.toLowerCase());
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [appts, myBlocks] = await Promise.all([
          listDoctorAppointments(date),
          listBlockedSlots(doctorId),
        ]);
        setList(appts);
        setBlocks(myBlocks);
      } catch (e) {
        setErr(e?.message || "No se pudo cargar la agenda.");
      } finally {
        setLoading(false);
      }
    })();
  }, [date, doctorId]);

  // Asegurar que list siempre sea un array
  const safeList = Array.isArray(list) ? list : [];
  const stats = useMemo(
    () => ({
      pendientes: safeList.filter((a) => a.status === "pendiente").length,
      confirmadas: safeList.filter((a) => a.status === "confirmada").length,
      atendidas: safeList.filter((a) => a.status === "atendida").length,
      canceladas: safeList.filter((a) => a.status === "cancelada").length,
    }),
    [safeList]
  );

  const setStatus = async (id, status) => {
    const updated = await updateAppointmentStatus(id, status);
    setList((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  // Asegurar que blocks siempre sea un array
  const safeBlocks = Array.isArray(blocks) ? blocks : [];
  const sameDayBlocks = useMemo(
    () =>
      safeBlocks
        .filter((b) => b.date === blockForm.date)
        .sort((a, b) => a.start.localeCompare(b.start)),
    [safeBlocks, blockForm.date]
  );

  const addBlock = async (e) => {
    e.preventDefault();
    setErr("");

    const { date: d, start, end, note } = blockForm;
    if (!d || !start || !end) {
      setErr("Completa fecha, hora inicio y fin.");
      return;
    }
    if (end <= start) {
      setErr("La hora fin debe ser mayor a la hora inicio.");
      return;
    }
    const overlap = sameDayBlocks.some(
      (b) => !(end <= b.start || start >= b.end)
    );
    if (overlap) {
      setErr("El rango se solapa con un bloqueo existente.");
      return;
    }
    setSavingBlock(true);
    try {
      const created = await addBlockedSlot({
        doctorId,
        date: d,
        start,
        end,
        note,
      });
      setBlocks((prev) => [...prev, created]);
      setBlockForm({ date: d, start: "", end: "", note: "" });
    } catch (e) {
      setErr(e?.message || "No se pudo guardar el bloqueo.");
    } finally {
      setSavingBlock(false);
    }
  };

  const delBlock = async (id) => {
    await removeBlockedSlot(id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const fmtTime = (hhmm) => hhmm;
  const filtered = safeList.filter(inDate).filter(matchesQ);

  // Autocompletado de pacientes
  useEffect(() => {
    if (patientQuery.length < 2) {
      setPatientOptions([]);
      return;
    }
    setLoadingPatients(true);
    searchPatients(patientQuery)
      .then((res) => setPatientOptions(Array.isArray(res) ? res : []))
      .catch(() => setPatientOptions([]))
      .finally(() => setLoadingPatients(false));
  }, [patientQuery]);

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setApptMsg("");
    if (!selectedPatient) {
      setApptMsg("Selecciona un paciente");
      return;
    }
    if (!apptForm.date || !apptForm.time || !apptForm.reason) {
      setApptMsg("Completa todos los campos");
      return;
    }
    setSavingAppt(true);
    try {
      await createAppointment({
        patientId: selectedPatient.id,
        doctorId,
        date: apptForm.date,
        time: apptForm.time,
        reason: apptForm.reason,
      });
      setApptMsg("Cita agendada correctamente");
      setApptForm({
        date: new Date().toISOString().slice(0, 10),
        time: "",
        reason: "",
      });
      setSelectedPatient(null);
      setPatientQuery("");
    } catch (e) {
      setApptMsg(e?.message || "Error al agendar cita");
    } finally {
      setSavingAppt(false);
    }
  };

  return (
    <div className="content content--doctor">
      <section className="card hero hero--doctor">
        <div>
          <h1>Dr./Dra. {user?.name}</h1>
          <p className="muted">
            Gestiona tu agenda del día y el estado de tus citas.
          </p>
        </div>
        <div className="hero-actions hero-actions--stack">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />
          <div style={{ position: "relative", width: 260 }}>
            <input
              type="search"
              placeholder="Buscar paciente por nombre, correo o teléfono"
              value={patientQuery}
              onChange={(e) => {
                setPatientQuery(e.target.value);
                setSelectedPatient(null);
              }}
              className="input"
              autoComplete="off"
            />
            {loadingPatients && <div className="dropdown">Buscando…</div>}
            {patientQuery.length >= 2 &&
              Array.isArray(patientOptions) &&
              patientOptions.length > 0 && (
                <ul
                  className="dropdown"
                  style={{
                    position: "absolute",
                    zIndex: 10,
                    width: "100%",
                    background: "#222",
                    borderRadius: 4,
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                  }}
                >
                  {patientOptions.map((p) => (
                    <li
                      key={p.id}
                      style={{ padding: 8, cursor: "pointer" }}
                      onClick={() => {
                        setSelectedPatient(p);
                        setPatientQuery(
                          p.name + (p.user?.email ? ` (${p.user.email})` : "")
                        );
                        setPatientOptions([]);
                      }}
                    >
                      {p.name}{" "}
                      {p.user?.email && (
                        <span style={{ color: "#aaa" }}>({p.user.email})</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            {selectedPatient && (
              <div style={{ color: "#0f0", fontSize: 12, marginTop: 2 }}>
                Paciente seleccionado: {selectedPatient.name}
              </div>
            )}
          </div>
        </div>
      </section>

      {err && <div className="alert">{err}</div>}

      <section className="grid grid--kpi-4">
        <div className="card kpi kpi--tile">
          <div className="kpi-value">{stats.pendientes}</div>
          <div className="kpi-label">Pendientes</div>
        </div>
        <div className="card kpi kpi--tile">
          <div className="kpi-value">{stats.confirmadas}</div>
          <div className="kpi-label">Confirmadas</div>
        </div>
        <div className="card kpi kpi--tile">
          <div className="kpi-value">{stats.atendidas}</div>
          <div className="kpi-label">Atendidas</div>
        </div>
        <div className="card kpi kpi--tile">
          <div className="kpi-value">{stats.canceladas}</div>
          <div className="kpi-label">Canceladas</div>
        </div>
      </section>

      <section className="card card--block">
        <div className="card-header">
          <h3>Agenda del día</h3>
          <div className="segmented">
            <button className="seg-btn" onClick={() => setQ("")}>
              Todas
            </button>
            <button className="seg-btn" onClick={() => setQ("pendiente")}>
              Pendientes
            </button>
            <button className="seg-btn" onClick={() => setQ("confirmada")}>
              Confirmadas
            </button>
            <button className="seg-btn" onClick={() => setQ("atendida")}>
              Atendidas
            </button>
            <button className="seg-btn" onClick={() => setQ("cancelada")}>
              Canceladas
            </button>
          </div>
        </div>

        {loading ? (
          <p>Cargando…</p>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <p className="muted">Sin citas.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table table--zebra table--sticky">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th style={{ width: 260 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{fmtTime(a.time)}</strong>
                    </td>
                    <td>{a.patientName}</td>
                    <td className="truncate">{a.reason}</td>
                    <td>
                      <span className={`chip chip--${a.status}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="row-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setStatus(a.id, "confirmada")}
                      >
                        Confirmar
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setStatus(a.id, "cancelada")}
                      >
                        Cancelar
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setStatus(a.id, "atendida")}
                      >
                        Marcar atendida
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card card--block">
        <div className="card-header">
          <h3>Bloquear horarios no disponibles</h3>
        </div>

        <form className="form form--compact" onSubmit={addBlock}>
          <div className="form-row">
            <label>
              <span>Fecha</span>
              <input
                type="date"
                value={blockForm.date}
                onChange={(e) =>
                  setBlockForm({ ...blockForm, date: e.target.value })
                }
                required
              />
            </label>
            <label>
              <span>Hora inicio</span>
              <input
                type="time"
                value={blockForm.start}
                onChange={(e) =>
                  setBlockForm({ ...blockForm, start: e.target.value })
                }
                required
              />
            </label>
            <label>
              <span>Hora fin</span>
              <input
                type="time"
                value={blockForm.end}
                onChange={(e) =>
                  setBlockForm({ ...blockForm, end: e.target.value })
                }
                required
              />
            </label>
          </div>

          <label>
            <span>Nota (opcional)</span>
            <input
              type="text"
              placeholder="Ej. Reunión de equipo"
              value={blockForm.note}
              onChange={(e) =>
                setBlockForm({ ...blockForm, note: e.target.value })
              }
            />
          </label>

          <div className="row-actions row-actions--end">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={savingBlock}
            >
              {savingBlock ? "Guardando…" : "Agregar bloqueo"}
            </button>
          </div>
        </form>

        <div className="subsection">
          <h4>Bloqueos del {blockForm.date}</h4>
          {sameDayBlocks.length === 0 ? (
            <p className="muted">No hay bloqueos en esta fecha.</p>
          ) : (
            <ul className="block-list">
              {sameDayBlocks.map((b) => (
                <li key={b.id} className="block-item">
                  <div className="block-time">
                    <strong>{b.start}</strong> – <strong>{b.end}</strong>
                    {b.note ? <span className="muted"> · {b.note}</span> : null}
                  </div>
                  <div className="row-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => delBlock(b.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {selectedPatient && (
        <form
          onSubmit={handleCreateAppointment}
          style={{
            marginTop: 16,
            background: "#181c24",
            padding: 16,
            borderRadius: 8,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="date"
              value={apptForm.date}
              onChange={(e) =>
                setApptForm((f) => ({ ...f, date: e.target.value }))
              }
              required
              className="input"
              style={{ flex: 1 }}
            />
            <input
              type="time"
              value={apptForm.time}
              onChange={(e) =>
                setApptForm((f) => ({ ...f, time: e.target.value }))
              }
              required
              className="input"
              style={{ flex: 1 }}
            />
            <input
              type="text"
              placeholder="Motivo de la cita"
              value={apptForm.reason}
              onChange={(e) =>
                setApptForm((f) => ({ ...f, reason: e.target.value }))
              }
              required
              className="input"
              style={{ flex: 2 }}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={savingAppt}
              style={{ flex: 1 }}
            >
              {savingAppt ? "Agendando…" : "Agendar cita"}
            </button>
          </div>
          {apptMsg && (
            <div
              style={{
                color: apptMsg.includes("correctamente") ? "#0f0" : "#f44",
                marginTop: 8,
              }}
            >
              {apptMsg}
            </div>
          )}
        </form>
      )}
    </div>
  );
}

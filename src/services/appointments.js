import http from "./http";

export async function listPatientAppointments() {
  const { data } = await http.get("/appointments/me");
  return data;
}

export async function createAppointment(payload) {
  const { data } = await http.post("/appointments", payload);
  return data;
}

export async function cancelAppointment(id) {
  return updateAppointmentStatus(id, "cancelada");
}

export async function listSpecialties() {
  const { data } = await http.get("/specialties");
  return data;
}

export async function listDoctors(specialty) {
  const { data } = await http.get("/doctors", { params: { specialty } });
  return data;
}

export async function listDoctorAppointments(dateISO) {
  const { data } = await http.get("/appointments/doctor", {
    params: { date: dateISO },
  });
  return data;
}

export async function updateAppointmentStatus(id, status) {
  const { data } = await http.patch(`/appointments/${id}/status`, { status });
  return data;
}

export async function listAllAppointments(params = {}) {
  const { data } = await http.get("/appointments", { params });
  return data;
}

export async function listBlockedSlots(doctorId) {
  const { data } = await http.get(`/doctors/${doctorId}/blocks`);
  return data;
}

export async function addBlockedSlot({ doctorId, date, start, end, note }) {
  const { data } = await http.post(`/doctors/${doctorId}/blocks`, {
    date,
    start,
    end,
    note,
  });
  return data;
}

export async function removeBlockedSlot(id) {
  const { data } = await http.delete(`/blocks/${id}`);
  return data;
}

export async function addSpecialty(name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return { ok: false };
  const { data } = await http.post("/specialties", { name: trimmed });
  return data;
}

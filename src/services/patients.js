import http from "./http";

export async function searchPatients(query) {
  const res = await http.get("/patient", { params: { search: query } });
  return res.data.data;
}

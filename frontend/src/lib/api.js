import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND}/api`;

export const api = axios.create({ baseURL: API, timeout: 120000 });

export async function generatePlan(payload) {
  const { data } = await api.post("/plan/generate", payload);
  return data;
}

export async function randomTip(language = "en") {
  const { data } = await api.get("/tips/random", { params: { language } });
  return data;
}

export async function emailPlan(planId, email) {
  const { data } = await api.post("/plan/email", { plan_id: planId, email });
  return data;
}

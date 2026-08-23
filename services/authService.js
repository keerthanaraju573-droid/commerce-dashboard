import api from "@/lib/axios";

export async function login(email, password) {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data;
}

export async function logout() {
  const { data } = await api.post("/api/auth/logout");
  return data;
}

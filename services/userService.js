import api from "@/lib/axios";

export async function getUsers() {
  const { data } = await api.get("/api/users");
  return data.data;
}

export async function getUserById(id) {
  const { data } = await api.get(`/api/users/${id}`);
  return data.data;
}

export async function createUser(payload) {
  const { data } = await api.post("/api/users", payload);
  return data.data;
}

export async function updateUser(id, payload) {
  const { data } = await api.put(`/api/users/${id}`, payload);
  return data.data;
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/api/users/${id}`);
  return data.data;
}

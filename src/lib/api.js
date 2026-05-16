import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ── Todo API functions ── */

export const todoApi = {
  /** GET /todos */
  getAll: async () => {
    const { data } = await api.get("/todos");
    return data.data;
  },

  /** POST /todos */
  create: async (payload) => {
    const { data } = await api.post("/todos", payload);
    return data.data;
  },

  /** PATCH /todos/:id */
  update: async (id, updates) => {
    const { data } = await api.patch(`/todos/${id}`, updates);
    return data.data;
  },

  /** DELETE /todos/:id */
  remove: async (id) => {
    const { data } = await api.delete(`/todos/${id}`);
    return data.data;
  },

  /** PATCH /todos — reorder */
  reorder: async (orderedIds) => {
    const { data } = await api.patch("/todos", { orderedIds });
    return data.data;
  },
};

export default api;

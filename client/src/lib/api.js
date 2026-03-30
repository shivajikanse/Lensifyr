import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function formatApiError(error) {
  const detail = error?.response?.data?.detail;
  if (!detail) return error?.message || "Something went wrong";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => e?.msg || JSON.stringify(e))
      .filter(Boolean)
      .join(" ");
  if (detail?.msg) return detail.msg;
  return String(detail);
}

export const organizerApi = {
  register: (data) => api.post("/organizer/register", data),
  login: (data) => api.post("/organizer/login", data),
  getProfile: () => api.get("/organizer/profile"),
  updateProfile: (data) => api.patch("/organizer/update-profile", data),
  logout: () => api.post("/organizer/logout"),
  search: (q) => api.get(`/organizer/search?q=${encodeURIComponent(q)}`),
};

export const eventApi = {
  create: (data) => api.post("/event/create", data),
  getMyEvents: () => api.get("/event/my-events"),
  getEvent: (eventId) => api.get(`/event/${eventId}`),
  update: (eventId, data) => api.patch(`/event/update/${eventId}`, data),
  delete: (eventId) => api.delete(`/event/delete/${eventId}`),
  getOrganizerEvents: (organizerId) =>
    api.get(`/event/organizer/${organizerId}`),
  verify: (eventCode) => api.post("/event/verify", { eventCode }),
};

export const imageApi = {
  upload: (formData, onProgress) =>
    api.post("/image/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress,
    }),
  getEventImages: (eventId, page = 1, pageSize = 20) =>
    api.get(`/image/event/${eventId}?page=${page}&pageSize=${pageSize}`),
  delete: (imageId) => api.delete(`/image/delete/${imageId}`),
  findMatches: (formData) =>
    api.post("/image/find-matches", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "blob",
    }),
  previewMatches: (formData) =>
    api.post("/image/preview-matches", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const statsApi = {
  getStats: () => api.get("/stats"),
};

export default api;

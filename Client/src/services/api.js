const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("skillhire_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const registerUser = (body) =>
  apiRequest("/users/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const loginUser = (body) =>
  apiRequest("/users/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const getProfile = () => apiRequest("/users/profile");

export const createProject = (body) =>
  apiRequest("/projects", {
    method: "POST",
    body: JSON.stringify(body),
  });
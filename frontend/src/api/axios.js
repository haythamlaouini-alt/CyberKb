import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";

const instance = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 10000,
});

// Attach JWT on every request
instance.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});

instance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry
    ) {
      original._retry = true;

      try {
        const refresh =
          localStorage.getItem(
            "refresh_token"
          );

        const { data } = await axios.post(
          `${API_BASE_URL}/auth/token/refresh/`,
          {
            refresh,
          }
        );

        localStorage.setItem(
          "access_token",
          data.access
        );

        original.headers.Authorization =
          `Bearer ${data.access}`;

        return instance(original);
      } catch {
        localStorage.clear();

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response, // if successful, just return response
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized — redirecting to login...");
      localStorage.removeItem("userToken"); // clear old token
      window.location.replace("/signin"); // fast redirect without history clutter
    }

    return Promise.reject(error);
  }
);

export default API;

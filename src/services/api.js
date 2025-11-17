import axios from "axios";

const API = axios.create({
  // baseURL: "http://10.118.206.245:8000/",
  baseURL: import.meta.env.BACKEND_URL,
  // baseURL: "http://10.11.26.107:8000/",
  // baseURL: "http://127.0.0.1:8000/",
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

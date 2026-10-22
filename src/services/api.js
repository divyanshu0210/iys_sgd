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
      const requestUrl = error.config?.url || "";
      const isAuthRequest =
        requestUrl.includes("/api/auth/login/") ||
        requestUrl.includes("/api/auth/registration/social/login/");

      // A failed login should be handled by the sign-in form itself.
      if (!isAuthRequest && window.location.pathname !== "/signin") {
        const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        sessionStorage.setItem("authReturnTo", returnTo);
        sessionStorage.setItem("authReturnToAt", String(Date.now()));
        console.warn("Unauthorized — redirecting to login...");
        localStorage.removeItem("userToken"); // clear old token
        window.location.replace("/signin"); // preserve the original page across the hard redirect
      }
    }

    return Promise.reject(error);
  }
);

export default API;

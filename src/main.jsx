import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/source-serif-4/700.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  // </StrictMode>  
);

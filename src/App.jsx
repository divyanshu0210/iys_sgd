// src/App.jsx
import Navbar from "./components/Navbar";
import "./App.css";
import FullPageLoader from "./components/FullPageLoader";
import AppRoutes from "./routes/AppRoutes";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const {loading } = useAuth();
  return (
    <>
     {loading&&( <FullPageLoader />)}
      <Navbar />
      <main>
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <AppRoutes />
        </div>
      </main>
    </>
  );
}

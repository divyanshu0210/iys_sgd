// src/App.jsx
import Navbar from "./components/Navbar";
import "./App.css";
import FullPageLoader from "./components/FullPageLoader";
import AppRoutes from "./routes/AppRoutes";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { loading, donatePage } = useAuth();
  return (
    <>
      {loading && <FullPageLoader />}
      <Navbar />
      <main>
        <div className={donatePage ? "full-width-page" : "normal-page"}>
          <AppRoutes />
        </div>
      </main>
    </>
  );
}

// src/App.jsx
import Navbar from "./components/Navbar";
import "./App.css";
import FullPageLoader from "./components/FullPageLoader";
import AppRoutes from "./routes/AppRoutes";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";
import Modal from "./components/Modal";
import ProfileApprovalForm from "./pages/Profile/ProfileApprovalForm";

export default function App() {
  const { loading, donatePage, openApprovalModal, setOpenApprovalModal } = useAuth();
  useEffect(() => {
  const handleFocus = (e) => {
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.isContentEditable
    ) {
      setTimeout(() => {
        e.target.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300); // wait for keyboard
    }
  };

  document.addEventListener("focusin", handleFocus);
  return () => document.removeEventListener("focusin", handleFocus);
}, []);

  return (
    <>
      {loading && <FullPageLoader />}
      <Navbar />
      <main>
        <div className={donatePage ? "full-width-page" : "normal-page"}>
          <AppRoutes />
        </div>
      </main>
      <Modal open={openApprovalModal} onClose={() => setOpenApprovalModal(false)}>
        <ProfileApprovalForm onClose={() => setOpenApprovalModal(false)} />
      </Modal>
    </>
  );
}

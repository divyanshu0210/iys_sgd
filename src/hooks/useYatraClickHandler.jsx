import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function useYatraClickHandler() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleYatraClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate("/signin", {
        state: { from: `${location.pathname}${location.search}${location.hash}` },
      });
      return;
    }
  };

  return { handleYatraClick, modals: null };
}

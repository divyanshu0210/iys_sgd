import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function useYatraClickHandler() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleYatraClick = (e) => {
    if (!user) {
      e.preventDefault();
      const destination = new URL(e.currentTarget.href, window.location.origin);
      navigate("/signin", {
        state: { from: `${destination.pathname}${destination.search}${destination.hash}` },
      });
      return;
    }
  };

  return { handleYatraClick, modals: null };
}

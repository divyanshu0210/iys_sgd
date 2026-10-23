import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function useYatraClickHandler() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleYatraClick = (e, yatra) => {
    if (!user) {
      e.preventDefault();
      navigate("/signin", {
        state: { from: `${location.pathname}${location.search}${location.hash}` },
      });
      return;
    }
    const minRounds = yatra.registration_policy?.min_chanting_rounds || 0;
    if (minRounds > 0 && (profile?.no_of_chanting_rounds || 0) < minRounds) {
      e.preventDefault();
      alert(`You need a minimum of ${minRounds} chanting rounds to register for this Yatra. You currently have ${profile?.no_of_chanting_rounds || 0} rounds.`);
    }
  };

  return { handleYatraClick, modals: null };
}

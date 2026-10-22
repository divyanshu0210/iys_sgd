// YatraRegistrationLayout.jsx
import { Outlet } from "react-router-dom";
import { YatraRegistrationProvider } from "./YatraRegistrationContext";
import { useAuth } from "../../../context/AuthContext";
import FullPageLoader from "../../../components/FullPageLoader";

export default function YatraRegistrationLayout() {
  const { loading } = useAuth();

  if (loading) return <FullPageLoader />;

  return (
    <YatraRegistrationProvider>
      <Outlet />
    </YatraRegistrationProvider>
  );
}

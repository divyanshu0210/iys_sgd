// YatraRegistrationLayout.jsx
import { Outlet } from "react-router-dom";
import { YatraRegistrationProvider } from "./YatraRegistrationContext";

export default function YatraRegistrationLayout() {
  return (
    <YatraRegistrationProvider>
      <Outlet />
    </YatraRegistrationProvider>
  );
}

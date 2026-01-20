import { useSearchParams } from "react-router-dom";
import ResourceBrowser from "./ResourceBrowser";
import "./Resources.css";

export default function ResourcesPage() {
  const [params] = useSearchParams();

  const yatraId = params.get("yatra");
  const eventId = params.get("event");

  return (
    <div style={{ padding: "10px" }}>
      <ResourceBrowser
        yatraId={yatraId}
        eventId={eventId}
      />
    </div>
  );
}

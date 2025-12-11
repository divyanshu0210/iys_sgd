import { Bus, Train, Plane, Car, Ship, Bed } from "lucide-react";
import { formatDateTime } from "../../YatraList";

const getTravelIcon = (mode) => {
  if (!mode) return <Car size={16} />;

  switch (mode.toLowerCase().trim()) {
    case "bus":
      return <Bus size={16} />;
    case "train":
      return <Train size={16} />;
    case "flight":
    case "air":
    case "plane":
      return <Plane size={16} />;
    case "ship":
    case "boat":
      return <Ship size={16} />;
    default:
      return <Car size={16} />;
  }
};

const AccomodationTravelInfo = ({ profile }) => {
  const noTravelInfo =
    (!profile.accommodation || profile.accommodation.length === 0) &&
    (!profile.journey || profile.journey.length === 0) &&
    (!profile.custom_fields || profile.custom_fields.length === 0);

  return (
    <div className="extra-details-container">
      {/* Fallback Message */}
      {noTravelInfo && (
        <div
          className="uniform-box"
          style={{ textAlign: "center" }}
        >
          <h4 className="detail-heading">No Information Available</h4>
          <p style={{ fontSize: "13px", marginTop: "5px" }}>
            Accommodation, travel, or additional details will be added soon.
          </p>
        </div>
      )}

      {/* Accommodation */}
      {profile.accommodation?.length > 0 && (
        <div className="uniform-box">
          <h4 className="detail-heading">Accommodation</h4>

          {profile.accommodation.map((a, i) => (
            <div key={i} className="compact-row">
              <div>
                <span className="icon">
                  <Bed size={15} />
                </span>
                {a.accommodation.place_name}
                {a.room_number ? ` (Room ${a.room_number})` : ""}
                {a.bed_number ? ` (Bed ${a.bed_number})` : ""}
              </div>

              <small>
                Address: {a.accommodation.address || "—"} <br />
                Check-in:{" "}
                {formatDateTime(a.accommodation.checkin_datetime) || "—"}
                <br />
                Check-out:{" "}
                {formatDateTime(a.accommodation.checkout_datetime) || "—"}
              </small>
            </div>
          ))}
        </div>
      )}

      {/* Journey */}
      {profile.journey?.length > 0 && (
        <div className="uniform-box">
          <h4 className="detail-heading">Journey</h4>

          {profile.journey.map((j, i) => {
            const icon = getTravelIcon(j.journey.mode_of_travel);

            return (
              <div key={i} className="compact-row">
                <div>
                  <span className="icon">{icon}</span>
                  {j.journey.from_location} → {j.journey.to_location}
                  {j.journey.type ? ` (${j.journey.type})` : ""}
                </div>

                <small>
                  Vehicle: {j.vehicle_number || "—"}
                  {j.seat_number ? ` | Seat ${j.seat_number}` : ""}
                  <br />
                  Departure: {formatDateTime(j.journey.start_datetime) || "—"}
                </small>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Fields */}
      {profile.custom_fields?.length > 0 && (
        <div className="uniform-box">
          <h4 className="detail-heading">Details</h4>

          {profile.custom_fields.map((field, index) => (
            <div key={index} className="compact-row">
              <strong>{field.field}:</strong> {field.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccomodationTravelInfo;

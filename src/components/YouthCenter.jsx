import { MapPin, Phone, Mail } from "lucide-react";

const linkStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  color: "#1E40AF", // indigo-800
  fontSize: "15px",
  fontWeight: 500,
  textDecoration: "none",
  transition: "color 0.2s ease, text-decoration 0.2s ease",
};

const iconStyle = {
  color: "#475569", // slate-600
};

export default function YouthCenter({ name, note = "", location, contact, mail }) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>{note}</p>

      {(location || contact || mail) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            flexWrap: "wrap",
            // gap: "8px",
            marginTop: "6px",
          }}
        >
          {contact && <PhoneLink number={contact} />}
          {location && <LocationLink href={location} />}
          {/* {mail && <MailLink email={mail} />} */}
        </div>
      )}
    </div>
  );
}

export function LocationLink({ href, label = "Location" }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={linkStyle}
      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
    >
      <MapPin size={16} style={iconStyle} />
      {label}
    </a>
  );
}

export function PhoneLink({ number }) {
  return (
    <a
      href={`tel:${number}`}
      style={linkStyle}
      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
    >
      <Phone size={16} style={iconStyle} />
      {number}
    </a>
  );
}

export function MailLink({ email }) {
  return (
    <a
      href={`mailto:${email}`}
      style={linkStyle}
      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
    >
      <Mail size={16} style={iconStyle} />
      {email}
    </a>
  );
}

export default function SocialLink({ icon: Icon, href, label }) {
  return (
    <p
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        margin: "6px 0",
      }}
    >
      <Icon size={18} />
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "#2563EB",
          textDecoration: "none",
        }}
      >
        {label}
      </a>
    </p>
  );
}

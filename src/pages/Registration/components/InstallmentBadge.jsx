
export default function InstallmentBadge({ installment }) {
  if (!installment) return null;

  const { label, amount, tag } = installment;


  return (
    <span
      className="installment-badge"
      style={{
        background: '#f59e0b',
        color: "white",
        fontSize: "0.65rem",
        padding: "2px 6px",
        borderRadius: "4px",
        marginLeft: "8px",
        whiteSpace: "nowrap",
      }}
      title={amount ? `₹${amount}` : label}
    >
      {label}
    </span>
  );
}

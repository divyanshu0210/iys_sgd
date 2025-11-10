// src/components/InstallmentBadge.jsx
export default function InstallmentBadge({ installment }) {
  if (!installment) return null;

  // Extract amount from label like "Full Payment (₹6500)" → 6500
  const amountMatch = installment.match(/₹(\d+(?:\.\d+)?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  // Dynamic color logic
  const isFullPayment = installment.toLowerCase().includes("full");
  const color = isFullPayment ? "#10b981" : "#f59e0b"; // Green for full, Amber for partial

  return (
    <span
      className="installment-badge"
      style={{
        background: color,
        color: "white",
        fontSize: "0.65rem",
        padding: "2px 6px",
        borderRadius: "4px",
        marginLeft: "8px",
        whiteSpace: "nowrap",
      }}
    >
      {installment}
    </span>
  );
}
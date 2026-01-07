

export const BreakdownToggle = ({ show, onClick }) => (
  <span
    className="sub-breakdown-toggle"
    style={{ marginBottom: show ? "10px" : "0px" }}
    onClick={onClick}
  >
    {show ? "Hide" : "Breakdown"}
  </span>
);

export const BreakdownSection = ({ amount_paid, cancellation_fee }) => (
  <div className="sub-breakdown-section">
    <div className="sub-breakdown-row">
      <span>Registration Charges Paid</span>
      <strong>₹{amount_paid}</strong>
    </div>

    <div className="sub-breakdown-row">
      <span>Deducted Cancellation Fee</span>
      <strong style={{ color: "#b91c1c" }}>- ₹{cancellation_fee}</strong>
    </div>

    <div className="sub-breakdown-net">
      <span>Net Amount</span>
      <strong>
        ₹{Number(amount_paid) - Number(cancellation_fee)}
      </strong>
    </div>
  </div>
);

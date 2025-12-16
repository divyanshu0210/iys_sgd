// src/components/UpiPaymentSection.jsx
import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";

const AMOUNT_LIMIT = 2000;

const generateUpiUrl = ({ upiId, name, amount, note }) => {
  const params = new URLSearchParams({
    pa: upiId,
    pn: name,
    cu: "INR",
    tn: note,
  });

  if (amount < AMOUNT_LIMIT) {
      params.append("am", amount.toString());
  }
  return `upi://pay?${params.toString()}`;
};

const isMobileDevice = () =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const UpiPaymentSection = ({
  upiId,
  amount,
  payeeName = "ISKCON Yatra",
  note = "Yatra Payment",
  onBeforeRedirect, // optional callback (navigation lock handling)
}) => {
  const [qrSrc, setQrSrc] = useState("");
  const [qrLoading, setQrLoading] = useState(true);

  const upiUrlRef = useRef("");

  useEffect(() => {
    if (!upiId || !amount) return;

    const upiUrl = generateUpiUrl({
      upiId,
      name: payeeName,
      amount,
      note,
    });

    upiUrlRef.current = upiUrl;

    QRCode.toDataURL(upiUrl, { width: 260 })
      .then((url) => {
        setQrSrc(url);
        setQrLoading(false);
      })
      .catch(console.error);
  }, [upiId, amount, payeeName, note]);



  const handleUpiIntent = () => {
    if (onBeforeRedirect) onBeforeRedirect();
    window.location.href = upiUrlRef.current;
  };

  return (
    <div className="qr-section">
      <h4>Scan & Pay</h4>

      {qrLoading && <p>Generating QR…</p>}

      {qrSrc && (
        <img
          src={qrSrc}
          alt="UPI QR"
          className="qr-code"
        />
      )}

      {isMobileDevice() && (
        <>
          <p>OR</p>
          <button
            type="button"
            onClick={handleUpiIntent}
            style={{
              marginTop: "10px",
              background: "#0077cc",
              color: "#fff",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Pay with any UPI App
          </button>
        </>
      )}
    </div>
  );
};

export default UpiPaymentSection;



{/*           
          <UpiPaymentSection
            upiId={(yatra || registerData.yatra)?.payment_upi_id}
            amount={totalAmount}
            payeeName="ISKCON Yatra"
            note="Yatra Payment"
            onBeforeRedirect={() => {
              ignoreLeaveWarning.current = true;
              setTimeout(() => {
                ignoreLeaveWarning.current = false;
              }, 1000);
            }}
          /> */}

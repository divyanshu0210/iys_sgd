import { useEffect, useRef, useState } from "react";
import {
  STORAGE_KEY,
  useYatraRegistration,
} from "../context/YatraRegistrationContext";
import API from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import FullPageLoader from "../../../components/FullPageLoader";
import Tesseract from "tesseract.js";
import QRCode from "qrcode";
import { AccountDetail } from "../../Donate/DonatePage";
import UpiPaymentSection from "../../Payments/UpiPaymentSection";

const CheckoutStep = () => {
  const { setIsNavigationLocked } = useAuth();
  const navigate = useNavigate();

  const [screenshot, setScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState("");

  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const ignoreLeaveWarning = useRef(false);

  // OCR & verification states
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [utrMatchStatus, setUtrMatchStatus] = useState("pending"); // pending | valid | invalid
  const [utrMessage, setUtrMessage] = useState("");
  const [ocrText, setOcrText] = useState("");

  // Checkout & QR state
  const [checkoutData, setCheckoutData] = useState(null);

  const { setSelected, setRegistrations, setActiveTab, setCurrentStep } =
    useYatraRegistration();

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      alert("No checkout session found. Redirecting back...");
      navigate(-1);
      return;
    }

    try {
      const data = JSON.parse(raw);
      setCheckoutData(data);
    } catch (err) {
      console.error("Failed to parse checkout session", err);
      alert("Invalid session data.");
      navigate(-1);
    }
  }, []);

  //lock navigation
  useEffect(() => {
    // Only block if there is actual data (selected profiles, etc.)
    if (!checkoutData || checkoutData?.selected.length === 0) return;
    setIsNavigationLocked(true);

    const blockMessage =
      "You have unsaved payment data. Are you sure you want to leave?";

    // 1. Block browser back/forward navigation
    const handlePopState = (e) => {
      console.log("popstate event", ignoreLeaveWarning.current);
      if (ignoreLeaveWarning.current) {
        // clearCheckoutSession();
        return;
      }
      // Ask user
      const confirmLeave = window.confirm(blockMessage);

      if (confirmLeave) {
        // Allow navigation: go back one more time to actually leave
        clearCheckoutSession();
      } else {
        // Stay: push the current state back (restore the URL)
        window.history.pushState(null, "", window.location.href);
      }
    };

    // 2. Block page refresh/close
    const handleBeforeUnload = (e) => {
      console.log("unload event", ignoreLeaveWarning.current);
      if (ignoreLeaveWarning.current) return; // allow unload if ignoring warnings
      // Standard message
      e.preventDefault();
      e.returnValue = blockMessage; // Some browsers require this
      return blockMessage;
    };

    // Add initial history entry only if not already blocked
    if (window.history.state !== "blocker") {
      window.history.pushState("blocker", "", window.location.href);
    }

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      setIsNavigationLocked(false);
    };
  }, [checkoutData, setIsNavigationLocked, ignoreLeaveWarning]);

  if (!checkoutData) {
    return (
      <div className="checkout-full">
        <p>Loading checkout details...</p>
      </div>
    );
  }

  const { selected, registrations, yatra, registerData, yatra_id } =
    checkoutData;

  // ---- Calculate total
  const registrationInstallments = selected
    .map((profileId) => {
      const regData = registrations[profileId];
      if (regData?.installments_selected?.length > 0) {
        const dueOrPending = regData.installments_selected.filter((label) => {
          const inst = regData.installments_info?.find(
            (i) => i.label === label
          );
          return inst && ["due", "rejected"].includes(inst.tag.toLowerCase());
        });

        if (dueOrPending.length > 0) {
          return {
            profile_id: profileId,
            installments: dueOrPending,
          };
        }
      }
      return null;
    })
    .filter(Boolean);

  const totalAmount = selected.reduce((sum, profileId) => {
    const regData = registrations[profileId];
    return sum + (regData?.amount || 0);
  }, 0);

  // =====================================================
  // OCR Extraction Helpers
  // =====================================================
  const extractRawNumbers = (txt) => {
    const matches = txt.match(/\d[\d,]*/g) || [];
    return matches.map((m) => m.replace(/,/g, ""));
  };

  const generateVariants = (numStr) => {
    const variants = [];

    variants.push(Number(numStr));

    if (numStr.length > 1) {
      const truncated = numStr.substring(1);
      if (/^\d+$/.test(truncated)) variants.push(Number(truncated));
    }

    return variants.filter((v) => v > 0);
  };

  // =====================================================
  // Tesseract OCR Verification
  // =====================================================
  const verifyScreenshotOCR = async (file) => {
    setVerifying(true);
    setVerificationStatus("pending");
    setUtrMatchStatus("pending");
    setMessage("Reading payment screenshot...");
    setUtrMessage("");

    try {
      const {
        data: { text },
      } = await Tesseract.recognize(file, "eng");
      setOcrText(text);

      // extract numbers
      const raw = extractRawNumbers(text);

      let variants = [];
      raw.forEach((n) => {
        variants = [...variants, ...generateVariants(n)];
      });

      variants = [...new Set(variants)];

      // check for match
      if (variants.includes(totalAmount)) {
        setVerificationStatus("valid");
        setMessage(`✔ Amount valid. Amount detected: ₹${totalAmount}`);
      } else {
        setVerificationStatus("invalid");
        setMessage("Amount mismatch. Expected ₹" + totalAmount);
      }

      /* ---------- TRANSACTION ID VERIFICATION ---------- */
      if (transactionId) {
        verifyTransactionIdFromText(text, transactionId);
      }
      // ------------------------------------------
    } catch (err) {
      // console.error("OCR error", err);
      setVerificationStatus("invalid");
      setUtrMatchStatus("invalid");
      setMessage("OCR failed.");
      setUtrMessage("Unable to verify Transaction ID");
    } finally {
      setVerifying(false);
    }
  };

  const verifyTransactionIdFromText = (ocrText, value) => {
    const extractedUTRs = ocrText.match(/\b\d{12,18}\b/g) || [];

    console.log("Extracted UTRs:", extractedUTRs);

    const normalizedInput = value.replace(/\s/g, "");

    const utrMatched = extractedUTRs.some(
      (utr) => utr.replace(/\s/g, "") === normalizedInput
    );

    if (utrMatched) {
      setUtrMatchStatus("valid");
      setUtrMessage("✔ Transaction ID verified from screenshot");
    } else {
      setUtrMatchStatus("invalid");
      setUtrMessage(
        "Transaction ID mismatch. Verify UTR No. OR Retry uploading a clear screenshot."
      );
    }
  };

  // Automatically trigger verification when user selects screenshot
  const handleScreenshotChange = (file) => {
    setScreenshot(file);
    if (file) {
      // verifyPaymentScreenshot(file);
      verifyScreenshotOCR(file);
      // setVerificationStatus("valid");
    }
  };

  // ==========================
  // SUBMISSION (unchanged)
  // ==========================
  const submitBatchProof = async () => {
    const payload = {
      registration_installments: registrationInstallments,
      transaction_id: transactionId,
      total_amount: totalAmount,
    };

    const res = await API.post(
      `/payments/${yatra_id}/batch-payment-proof/`,
      payload
    );
    return res.data.payment_id;
  };

  const uploadScreenshot = async (paymentId) => {
    const formData = new FormData();
    formData.append("screenshot", screenshot);

    await API.post(`/payments/${paymentId}/upload-screenshot/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();

    if (verificationStatus !== "valid") {
      alert("❌ Screenshot is invalid. Cannot submit.");
      return;
    }

    setLoadingCheckout(true);
    try {
      await API.post(`/yatras/${yatra_id}/register/`, registrations);
      const paymentId = await submitBatchProof();
      await uploadScreenshot(paymentId);

      // Success → Clear everything
      clearCheckoutSession();

      alert("✅ Payment proof submitted successfully!");
    } catch (err) {
      console.error("Checkout error:", err);
      alert(
        err.response?.data?.error || "Submission failed. Please try again."
      );
    } finally {
      setLoadingCheckout(false);
    }
  };
  const clearCheckoutSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSelected([]);
    setRegistrations({});
    setTransactionId("");
    setScreenshot(null);
    setActiveTab("registered");
    setCurrentStep(1);
    setIsNavigationLocked(false);
    navigate(`/yatra/${yatra_id}/register`);
  };
  return (
    <>
      {loadingCheckout && <FullPageLoader />}
      <div className="checkout-full">
        <h3>Step 3: Checkout & Payment</h3>

        <div className="checkout-summary">
          <p>
            <strong>Total Amount:</strong> ₹{totalAmount}
          </p>
        </div>

        <div className="qr-section">
          <AccountDetail />

          <form
            onSubmit={handleSubmitProof}
            className="proof-form"
            style={{ marginTop: "20px" }}
          >
            <div className="form-group">
              <label>Payment Screenshot *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleScreenshotChange(e.target.files[0])}
                required
              />
              {/* OCR Status */}
              {verifying && (
                <p style={{ color: "blue", fontSize: "12px" }}>
                  ⏳ Verifying screenshot…
                </p>
              )}

              {verificationStatus === "valid" && (
                <p style={{ color: "green", fontSize: "12px" }}>{message}</p>
              )}

              {verificationStatus === "invalid" && (
                <p style={{ color: "red", fontSize: "12px" }}>{message}</p>
              )}
            </div>

            <div className="form-group">
              <label>UTR / UPI Ref. No. / Transaction ID *</label>
              <input
                type="number"
                value={transactionId}
                onChange={(e) => {
                  const value = e.target.value;
                  setTransactionId(value);

                  if (ocrText) {
                    verifyTransactionIdFromText(ocrText, value);
                  }
                }}
                required
              />

              {utrMatchStatus === "valid" && (
                <p style={{ color: "green", fontSize: "12px" }}>{utrMessage}</p>
              )}

              {utrMatchStatus === "invalid" && (
                <p style={{ color: "red", fontSize: "12px" }}>{utrMessage}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn-next"
              disabled={
                loadingCheckout ||
                verifying ||
                verificationStatus !== "valid" ||
                utrMatchStatus !== "valid" ||
                !transactionId
              }
            >
              {loadingCheckout ? "Submitting..." : "Submit All & Pay"}
            </button>
          </form>
          <button
            onClick={() => {
              if (confirm("Cancel payment? All data will be lost.")) {
                clearCheckoutSession();
              }
            }}
            style={{
              marginTop: "16px",
              color: "#e63946",
              background: "none",
              border: "1px solid #aaa",
              fontSize: "14px",
            }}
          >
            Cancel Payment
          </button>
        </div>
      </div>
    </>
  );
};

export default CheckoutStep;

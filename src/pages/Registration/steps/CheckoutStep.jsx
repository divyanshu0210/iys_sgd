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

const CheckoutStep = () => {
  const { setIsNavigationLocked } = useAuth();
  const navigate = useNavigate();
  const [screenshot, setScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState("");

  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [qrLoading, setQrLoading] = useState(true);
  const ignoreLeaveWarning = useRef(false);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // 🔵 NEW: status of screenshot verification
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");

  // Data loaded from localStorage
  const [checkoutData, setCheckoutData] = useState(null);

  const {
    fetchRegistrationData,
    setSelected,
    setRegistrations,
    setActiveTab,
    setCurrentStep,
    currentStep,
  } = useYatraRegistration();

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

  const upiId = (yatra || registerData.yatra)?.payment_upi_id || "";
  const qrUrl = `${API.defaults.baseURL}payments/qr/?amount=${totalAmount}&upi_id=${upiId}&note=Yatra+Payment`;

  // ================================
  // 🔵 NEW: Verify Screenshot via API
  // ================================
  const verifyPaymentScreenshot = async (file) => {
    setVerifying(true);
    setVerificationStatus("pending");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("amount", totalAmount);

      const res = await fetch(
        `${API.defaults.baseURL}payments/verify-payment/`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      setMessage(data.message);
      if (data.success === true) {
        setVerificationStatus("valid");
      } else {
        setVerificationStatus("invalid");
      }
    } catch (err) {
      console.error("Verification failed", err);
      setVerificationStatus("invalid");
    } finally {
      setVerifying(false);
    }
  };


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
    setMessage("Reading payment screenshot...");

    try {
      const { data: { text } } = await Tesseract.recognize(file, "eng");

      // extract numbers
      const raw = extractRawNumbers(text);  

      let variants = [];
      raw.forEach((n) => {
        variants = [...variants, ...generateVariants(n)];
      });

      variants = [...new Set(variants)];

      console.log("OCR extracted:", variants);

      // check for match
      if (variants.includes(totalAmount)) {
        setVerificationStatus("valid");
        setMessage(`✔ Screenshot valid. Amount detected: ₹${totalAmount}`);
      } else {
        setVerificationStatus("invalid");
        setMessage("Amount mismatch. Expected ₹" + totalAmount);
      }
    } catch (err) {
      console.error("OCR error", err);
      setVerificationStatus("invalid");
      setMessage("OCR failed.");
    } finally {
      setVerifying(false);
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
      {(loadingCheckout || qrLoading) && <FullPageLoader />}
      <div className="checkout-full">
        <h3>Step 3: Checkout & Payment</h3>

        <div className="checkout-summary">
          <p>
            <strong>Total Amount:</strong> ₹{totalAmount}
          </p>
        </div>

        <div className="qr-section">
          <h4>Scan & Pay</h4>

          <img
            src={qrUrl}
            alt="UPI QR"
            className="qr-code"
            onLoad={() => setQrLoading(false)}
          />

          {isMobile && (
            <>
              <p>OR</p>
              <button
                type="button"
                onClick={() => {
                  ignoreLeaveWarning.current = true;

                  window.location.href = `upi://pay?pa=${upiId}&pn=Yatra&am=${totalAmount}&tn=Yatra+Payment`;
                  setTimeout(() => {
                    ignoreLeaveWarning.current = false;
                  }, 1000);
                }}
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

          <form
            onSubmit={handleSubmitProof}
            className="proof-form"
            style={{ marginTop: "20px" }}
          >
            <div className="form-group">
              <label>Transaction ID *</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required
              />
            </div>

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

            <button
              type="submit"
              className="btn-next"
              disabled={
                loadingCheckout ||
                verifying ||
                verificationStatus !== "valid" ||
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

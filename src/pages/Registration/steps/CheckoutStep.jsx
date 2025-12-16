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

const Spinner = () => (
  <>
    <div
      style={{
        width: 18,
        height: 18,
        border: "2px solid #ccc",
        borderTop: "2px solid #333",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
    <style>
      {`@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}`}
    </style>
  </>
);

const CheckoutStep = () => {
  const { setIsNavigationLocked } = useAuth();
  const navigate = useNavigate();

  const [screenshot, setScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState("");

  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const ignoreLeaveWarning = useRef(false);

  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");

  // Checkout & QR state
  const [checkoutData, setCheckoutData] = useState(null);

  const [stepsVisible, setStepsVisible] = useState(false);

  const [steps, setSteps] = useState({
    amount: "idle", // idle | loading | success | error
    utr: "idle",
    payment: "idle",
  });

  const [stepMessages, setStepMessages] = useState({
    amount: "",
    utr: "",
    payment: "",
  });

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
      "You have not submitted the Payment Proof. Are you sure you want to leave?";
    //  If you have made the payment on account number and cancel without submitting screenshot, your payment wll not be tracked . You wont get chance to resubmit the payment.

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

  const verifyAmount = async (text) => {
    const raw = extractRawNumbers(text);
    let variants = [];

    raw.forEach((n) => {
      variants.push(...generateVariants(n));
    });

    variants = [...new Set(variants)];

    return variants.includes(totalAmount);
  };

  const verifyUTR = async (text) => {
    const extractedUTRs = text.match(/\b\d{12,18}\b/g) || [];
    const normalizedInput = transactionId.replace(/\s/g, "");

    return extractedUTRs.some(
      (utr) => utr.replace(/\s/g, "") === normalizedInput
    );
  };
  const sleep = (ms = 300) => new Promise((res) => setTimeout(res, ms));

  const handleScreenshotChange = (file) => {
    setScreenshot(file);
    setTransactionId("");
    setStepsVisible(false);
    setSteps({ amount: "idle", utr: "idle", payment: "idle" });
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
    if (!screenshot || !transactionId) {
      alert("❌ Screenshot and Transaction ID are required");
      return;
    }

    setStepsVisible(true);
    setSteps({ amount: "loading", utr: "idle", payment: "idle" });
    await sleep();

    try {
      const {
        data: { text },
      } = await Tesseract.recognize(screenshot, "eng");

      /* ---------- STEP 1: AMOUNT ---------- */
      const amountValid = await verifyAmount(text);
      if (!amountValid) {
        setSteps({ amount: "error", utr: "idle", payment: "idle" });
        setStepMessages({
          amount: `Amount mismatch. Expected ₹${totalAmount}`,
          utr: "",
          payment: "",
        });
        await sleep();
        alert(`❌ Payment failed`);
        return;
      }

      setSteps({ amount: "success", utr: "loading", payment: "idle" });
      setStepMessages({
        amount: `Amount ₹${totalAmount} verified successfully`,
        utr: "",
        payment: "",
      });
      await sleep();

      /* ---------- STEP 2: UTR ---------- */
      const utrValid = await verifyUTR(text);

      if (!utrValid) {
        setSteps({ amount: "success", utr: "error", payment: "idle" });
        setStepMessages((prev) => ({
          ...prev,
          utr: "Transaction ID not found in screenshot",
        }));
        await sleep();
        alert(`❌ Payment failed`);
        return;
      }

      setSteps({ amount: "success", utr: "success", payment: "loading" });
      setStepMessages((prev) => ({
        ...prev,
        utr: "Transaction ID verified successfully",
      }));
      await sleep();

      setLoadingCheckout(true);
      await API.post(`/yatras/${yatra_id}/register/`, registrations);
      const paymentId = await submitBatchProof();
      await uploadScreenshot(paymentId);
      setSteps({ amount: "success", utr: "success", payment: "success" });
      setStepMessages((prev) => ({
        ...prev,
        payment: "Payment proof submitted successfully",
      }));
      await sleep();

      // Success → Clear everything
      clearCheckoutSession();

      alert("✅ Payment submitted successfully!");
    } catch (err) {
      console.error("Checkout error:", err);
      setSteps((s) => ({ ...s, payment: "error" }));
      setStepMessages((prev) => ({
        ...prev,
        payment:
          err.response?.data?.error || "Payment failed. Please try again.",
      }));
      await sleep();

      alert("Payment failed. Please try again.");
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

  const resetCheckoutState = () => {
    setScreenshot(null);
    setTransactionId("");

    setStepsVisible(false);
    setSteps({
      amount: "idle",
      utr: "idle",
      payment: "idle",
    });

    setStepMessages({
      amount: "",
      utr: "",
      payment: "",
    });

    setVerifying(false);
    setLoadingCheckout(false);
    setMessage("");
  };

  return (
    <>
      {loadingCheckout && <FullPageLoader />}
      <div className="checkout-full">
        <h3>Step 3: Checkout & Payment</h3>

        <div className="checkout-summary">
          <p>
            <strong>Total Amount:</strong> <span style={{color:"#047857" , fontWeight:700}}>₹{totalAmount}</span>
          </p>
        </div>

        <div className="qr-section">
          <AccountDetail />

          <form onSubmit={handleSubmitProof} className="proof-form">
            <div className="form-group">
              <label>Payment Screenshot *</label>
              <input
                type="file"
                accept="image/*"
                onClick={resetCheckoutState}
                onChange={(e) => handleScreenshotChange(e.target.files[0])}
                required
              />
            </div>

            <div className="form-group">
              <label>UTR / UPI Ref. No. / Transaction ID *</label>
              <input
                type="number"
                value={transactionId}
                onChange={(e) => {
                  const value = e.target.value;
                  setTransactionId(value);
                }}
                required
              />
            </div>
            {stepsVisible && (
              <div style={{ marginTop: "24px" }}>
                {[
                  { key: "amount", label: "Amount Verification" },
                  { key: "utr", label: "Transaction ID Verification" },
                  { key: "payment", label: "Payment Submission" },
                ].map((step) => (
                  <div key={step.key} style={{ marginBottom: "14px" }}>
                    {/* Step Row */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        opacity: steps[step.key] === "idle" ? 0.5 : 1,
                        fontSize: "14px",
                      }}
                    >
                      <span>{step.label}</span>

                      {steps[step.key] === "loading" && <Spinner />}
                      {steps[step.key] === "success" && (
                        <span style={{ color: "green" }}>✔</span>
                      )}
                      {steps[step.key] === "error" && (
                        <span style={{ color: "red" }}>✖</span>
                      )}
                    </div>

                    {/* Step Message */}
                    {stepMessages[step.key] && (
                      <div
                        style={{
                          fontSize: "12px",
                          textAlign: "left",
                          color:
                            steps[step.key] === "success"
                              ? "green"
                              : steps[step.key] === "error"
                              ? "red"
                              : "#555",
                        }}
                      >
                        {stepMessages[step.key]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* NOTE / WARNING */}
            {!stepsVisible && (
              <div
                style={{
                  marginBottom: "12px",
                  fontSize: "13px",
                  color: "#b45309",
                  textAlign: "justify",
                }}
              >
                <p>
                  ⚠️ <strong>Important:</strong> If you do{" "}
                  <strong>not</strong> submit the payment screenshot after payment, your
                  payment <strong>will not be recorded</strong>.
                </p>
                <br />
                {/* <p>
                  ⚠️ If you <strong>cancel without submitting</strong>, you{" "}
                  <strong>will not get another chance</strong> to submit again & your payment will get lost.
                </p> */}
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "15px",
                marginTop: "18px",
                justifyContent: "center",
              }}
            >
              <button
                type="submit"
                className="btn-next"
                disabled={loadingCheckout || verifying}
              >
                <span>
                  {verifying
                    ? "Verifying..."
                    : loadingCheckout
                    ? "Submitting..."
                    : "Submit All & Pay"}
                </span>
              </button>
              <button
                onClick={() => {
                  if (confirm("Cancel payment?Your payment can be lost if screenshot not submitted.")) {
                    clearCheckoutSession();
                  }
                }}
                style={{
                  color: "#e63946",
                  background: "none",
                  border: "1px solid #aaa",
                  fontSize: "14px",
                }}
                disabled={loadingCheckout || verifying}
              >
                Cancel Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CheckoutStep;

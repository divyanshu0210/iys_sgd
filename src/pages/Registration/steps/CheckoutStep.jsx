import { useEffect, useRef, useState } from "react";
import {
  STORAGE_KEY,
  useYatraRegistration,
} from "../context/YatraRegistrationContext";
import API from "../../../services/api";
import { getApiErrorMessage } from "../../../utils/apiErrors";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import FullPageLoader from "../../../components/FullPageLoader";
import { extractScreenshotText, matchesAccountName, matchesAmount, matchesTransactionId } from "../../../utils/paymentScreenshot";
import QRCode from "qrcode";
import { AccountDetail, PAYMENT_ACCOUNT_NAME } from "../../Donate/DonatePage";
import UpiPaymentSection from "../../Payments/UpiPaymentSection";
import "../css/registrationTab.css";


const PAYMENT_STEPS = [
  { key: "amount", label: "Amount", loading: "Checking amount…" },
  { key: "utr", label: "Trans. ID", loading: "Checking transaction ID…" },
  { key: "recipient", label: "Account", loading: "Checking account name…" },
  { key: "payment", label: "Pay", loading: "Submitting payment…" },
];

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
    recipient: "idle",
    payment: "idle",
  });

  const [stepMessages, setStepMessages] = useState({
    amount: "",
    utr: "",
    recipient: "",
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

  const sleep = (ms = 300) => new Promise((res) => setTimeout(res, ms));

  const handleScreenshotChange = (file) => {
    setScreenshot(file);
    setTransactionId("");
    setStepsVisible(false);
    setSteps({ amount: "idle", utr: "idle", recipient: "idle", payment: "idle" });
  };

  const verifyAmountFromText = (text) => matchesAmount(text, totalAmount);
  const verifyUTRFromText = (text) => matchesTransactionId(text, transactionId);
  const containsPaymentAccountName = (text) => matchesAccountName(text, PAYMENT_ACCOUNT_NAME);
  const extractAllOCRText = extractScreenshotText;

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
    setVerifying(true);
    setStepsVisible(true);
    setSteps({ amount: "loading", utr: "idle", recipient: "idle", payment: "idle" });
    await sleep();

    let createdPaymentId = null;
    try {
      const { tesseractText, getOCRSpaceText } = await extractAllOCRText(
        screenshot
      );
      let amountValid = await verifyAmountFromText(tesseractText);

      if (!amountValid) {
        const ocrSpaceText = await getOCRSpaceText();
        amountValid = await verifyAmountFromText(ocrSpaceText);
      }

      if (!amountValid) {
        setSteps({ amount: "error", utr: "idle", recipient: "idle", payment: "idle" });
        setStepMessages({
          amount: `Amount mismatch. Expected ₹${totalAmount}`,
          utr: "",
          recipient: "",
          payment: "",
        });
        await sleep();
        alert(`Amount mismatch. Expected ₹${totalAmount}.`);
        return;
      }

      setSteps({ amount: "success", utr: "loading", recipient: "idle", payment: "idle" });
      setStepMessages({
        amount: `Amount ₹${totalAmount} verified successfully`,
        utr: "",
        recipient: "",
        payment: "",
      });
      await sleep();

      /* ---------- STEP 2: UTR ---------- */
      let utrValid = verifyUTRFromText(tesseractText);

      if (!utrValid) {
        const ocrSpaceText = await getOCRSpaceText();
        utrValid = verifyUTRFromText(ocrSpaceText);
      }

      if (!utrValid) {
        setSteps({ amount: "success", utr: "error", recipient: "idle", payment: "idle" });
        setStepMessages((prev) => ({
          ...prev,
          utr: "Transaction ID not found in screenshot",
        }));
        await sleep();
        alert("Transaction ID not found in the screenshot.");
        return;
      }

      setSteps({ amount: "success", utr: "success", recipient: "loading", payment: "idle" });
      setStepMessages((prev) => ({
        ...prev,
        utr: "Transaction ID verified successfully",
      }));
      await sleep();

      let nameFound = containsPaymentAccountName(tesseractText);
      if (!nameFound) {
        nameFound = containsPaymentAccountName(await getOCRSpaceText());
      }
      if (!nameFound) {
        setSteps({ amount: "success", utr: "success", recipient: "error", payment: "idle" });
        setStepMessages((prev) => ({
          ...prev,
          recipient: `Account name not found in the screenshot. Please upload a screenshot showing the recipient's account name.`,
        }));
        await sleep();
        alert(`Account name ${PAYMENT_ACCOUNT_NAME} was not found in the screenshot.`);
        return;
      }

      setSteps({ amount: "success", utr: "success", recipient: "success", payment: "loading" });
      setStepMessages((prev) => ({
        ...prev,
        recipient: `Account name found in screenshot.`,
      }));
      await sleep();

      setLoadingCheckout(true);
      const registrationResponse = await API.post(`/yatras/${yatra_id}/register/`, registrations);
      if (registrationResponse.data?.errors?.length) {
        throw new Error(
          `Some registrations could not be saved. Other successful registrations were saved; payment was not submitted.\n${registrationResponse.data.errors.join("\n")}`
        );
      }
      createdPaymentId = await submitBatchProof();
      await uploadScreenshot(createdPaymentId);
      setSteps((prev) => ({ ...prev, payment: "success" }));
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
      const detail = getApiErrorMessage(err, "Payment failed. Please try again.");
      const errorMessage = createdPaymentId
        ? `${detail}\nThe payment record was created, but the screenshot was not uploaded. Please contact the Yatra team with your transaction ID before submitting another payment.`
        : detail;
      setSteps((s) => ({ ...s, payment: "error" }));
      setStepMessages((prev) => ({
        ...prev,
        payment: errorMessage,
      }));
      await sleep();

      alert(errorMessage);
    } finally {
      setLoadingCheckout(false);
      setVerifying(false);
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
      recipient: "idle",
      payment: "idle",
    });

    setStepMessages({
      amount: "",
      utr: "",
      recipient: "",
      payment: "",
    });

    setVerifying(false);
    setLoadingCheckout(false);
    setMessage("");
  };

  const currentStep = PAYMENT_STEPS.find((step) => steps[step.key] === "error") ||
    PAYMENT_STEPS.find((step) => steps[step.key] === "loading") ||
    [...PAYMENT_STEPS].reverse().find((step) => stepMessages[step.key]);
  const currentStepMessage = currentStep && (steps[currentStep.key] === "loading"
    ? currentStep.loading
    : stepMessages[currentStep.key]);

  return (
    <>
      {loadingCheckout && <FullPageLoader />}
      <div className="checkout-full">
        <h3>Step 3: Checkout & Payment</h3>

        <div className="checkout-summary">
          <p>
            <strong>Total Amount:</strong>{" "}
            <span style={{ color: "#047857", fontWeight: 700 }}>
              ₹{totalAmount}
            </span>
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
              <div className="payment-progress" aria-live="polite">
                <div className="payment-progress-steps">
                  {PAYMENT_STEPS.map((step, index) => (
                    <div className={`payment-progress-step is-${steps[step.key]} ${index > 0 && steps[PAYMENT_STEPS[index - 1].key] === "success" ? "previous-complete" : ""}`} key={step.key}>
                      <span className="payment-progress-icon" aria-hidden="true">
                        {steps[step.key] === "loading" ? <span className="payment-progress-spinner" /> :
                          steps[step.key] === "success" ? "✓" :
                          steps[step.key] === "error" ? "×" : index + 1}
                      </span>
                      <span>{step.label}</span>
                      <span className="payment-progress-sr-only">: {steps[step.key]}</span>
                    </div>
                  ))}
                </div>
                {currentStepMessage && (
                  <div className={`payment-progress-message is-${steps[currentStep.key]}`}>
                    {currentStepMessage}
                  </div>
                )}
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
                  ⚠️ <strong>Important:</strong> If you do <strong>not</strong>{" "}
                  submit the payment screenshot after payment, your payment{" "}
                  <strong>will not be recorded</strong>.
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
                  if (
                    confirm(
                      "Cancel payment?Your payment can be lost if screenshot not submitted."
                    )
                  ) {
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

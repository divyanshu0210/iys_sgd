// src/pages/components/CheckoutStep.jsx
import { useEffect, useState } from "react";
import { useYatraRegistration } from "../context/YatraRegistrationContext";
import API from "../../../services/api";

const CheckoutStep = ({ onBack,setCurrentStep }) => {
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const {
    selected,
    registrations,
    yatra,
    registerData,
    yatra_id,
    fetchRegistrationData,
    setSelected,
    setRegistrations,
    setActiveTab,
  } = useYatraRegistration();

   // 🧭 --- PREVENT accidental refresh or navigation ---
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue =
        "Your payment data will be lost if you leave this page. Are you sure you want to exit?";
    };

    const handlePopState = (e) => {
      const confirmLeave = window.confirm(
        "You have unsaved payment data. Are you sure you want to go back?"
      );
      if (!confirmLeave) {
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Warn if switching tabs inside the app
    const handleTabSwitch = (e) => {
      if (
        e.target.closest(".tab-button") ||
        e.target.closest(".nav-item") ||
        e.target.closest(".sidebar-link")
      ) {
        const confirmLeave = window.confirm(
          "You have unsaved payment data. Do you really want to leave Checkout?"
        );
        if (!confirmLeave) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleTabSwitch, true);

    // push state so back button triggers popstate handler
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleTabSwitch, true);
    };
  }, []);

  // ---- Calculate total and prepare registration_installments ----
const registrationInstallments = selected
  .map((profileId) => {
    const regData = registrations[profileId];
    if (regData?.installments_selected?.length > 0) {
      // keep only selected installments that are still due or pending
      const dueOrPending = regData.installments_selected.filter((label) => {
        const inst = regData.installments_info?.find((i) => i.label === label);
        return inst && ["due"].includes(inst.tag.toLowerCase());
      });

      if (dueOrPending.length > 0) {
        return {
          profile_id:  profileId,
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

// ---- STEP 1: Submit batch proof (create payment entry) ----
const submitBatchProof = async () => {
  const payload = {
    registration_installments: registrationInstallments,
    transaction_id: transactionId,
    total_amount: totalAmount,
  };

  const res = await API.post(`/payments/${yatra_id}/batch-payment-proof/`, payload);
  return res.data.payment_id;
};

// ---- STEP 2: Upload screenshot ----
const uploadScreenshot = async (paymentId) => {
  const formData = new FormData();
  formData.append("screenshot", screenshot);

  await API.post(`/payments/${paymentId}/upload-screenshot/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ---- Master handler ----
const handleSubmitProof = async (e) => {
  e.preventDefault();

  if (!transactionId || !screenshot) {
    alert("Please fill all fields.");
    return;
  }
  if (registrationInstallments.length === 0) {
    alert("No installments selected for payment.");
    return;
  }

  setLoadingCheckout(true);
  try {
    // Step A: Register devotees
    await API.post(`/yatras/${yatra_id}/register/`, registrations);

    // Step B: Create batch payment (get payment_id)
    const paymentId = await submitBatchProof();

    // Step C: Upload screenshot for that payment
    await uploadScreenshot(paymentId);

    alert("✅ All registrations and payment proof submitted successfully!");
    setCurrentStep(1);
    setSelected([]);
    setRegistrations({});
    setTransactionId("");
    setScreenshot(null);
    fetchRegistrationData();
    setActiveTab("registered");
  } catch (err) {
    console.error("Checkout error:", err);
    alert(err.response?.data?.error || "Submission failed. Please check details & try again.");
  } finally {
    setLoadingCheckout(false);
  }
};

  return (
    <div className="checkout-full">
      <h3>Step 3: Checkout & Payment</h3>

      <div className="checkout-summary">
        <p>
          <strong>Yatra:</strong> {(yatra || registerData.yatra)?.title}
        </p>
        <p>
          <strong>Devotees:</strong> {selected.length}
        </p>
        <p>
          <strong>Total Amount:</strong> ₹{totalAmount}
        </p>
      </div>

      <div className="payment-flow">
        <div className="qr-section">
          <h4>Scan & Pay</h4>
          <img src={qrUrl} alt="UPI QR" className="qr-code" />
          <p>
            <strong>Amount to Pay:</strong> ₹{totalAmount}
          </p>

          <form onSubmit={handleSubmitProof} className="proof-form">
            <div className="form-group">
              <label>Transaction ID *</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g., T241108123456789"
                required
              />
            </div>

            <div className="form-group">
              <label>Payment Screenshot *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files[0])}
                required
              />
              {screenshot && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "14px",
                    color: "#047857",
                  }}
                >
                  ✓ File selected: {screenshot.name}
                </div>
              )}
            </div>

            <div className="step-actions">
              <button
                onClick={onBack}
                className="btn-back"
                type="button"
                disabled={loadingCheckout}
              >
                Back to Review
              </button>

              <button
                type="submit"
                disabled={loadingCheckout || !screenshot || !transactionId}
                className="btn-next"
              >
                {loadingCheckout ? "Submitting..." : "Submit All & Pay"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutStep;

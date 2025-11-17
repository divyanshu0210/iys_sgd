// // src/pages/components/CheckoutStep.jsx
// import { useEffect, useState } from "react";
// import { useYatraRegistration } from "../context/YatraRegistrationContext";
// import API from "../../../services/api";

// const CheckoutStep = ({ onBack, setCurrentStep }) => {
//   const [transactionId, setTransactionId] = useState("");
//   const [screenshot, setScreenshot] = useState(null);
//   const [loadingCheckout, setLoadingCheckout] = useState(false);

//     const [loading, setLoading] = useState(false);

//   const {
//     selected,
//     registrations,
//     yatra,
//     registerData,
//     yatra_id,
//     fetchRegistrationData,
//     setSelected,
//     setRegistrations,
//     setActiveTab,
//   } = useYatraRegistration();

//   // 🧭 --- PREVENT accidental refresh or navigation ---
//   useEffect(() => {

//     //     if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
//     //   window.location.href = "/yatra";
//     //   return;
//     // }

//     const handleBeforeUnload = (e) => {
//       e.preventDefault();
//       e.returnValue =
//         "Your payment data will be lost if you leave this page. Are you sure you want to exit?";
//     };

//     const handlePopState = (e) => {
//       const confirmLeave = window.confirm(
//         "You have unsaved payment data. Are you sure you want to go back?"
//       );
//       if (confirmLeave) {
//         // ⬅️ user confirmed → redirect to /yatra
//         window.location.href = `/yatras`;
//         // window.location.href = `/yatra/${yatra_id}/register`;
//       }
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);
//     window.addEventListener("popstate", handlePopState);

//     // push state so back button triggers popstate handler
//     window.history.pushState(null, "", window.location.href);
  

//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//       window.removeEventListener("popstate", handlePopState);
//     };
//   }, []);

//   // ---- Calculate total and prepare registration_installments ----
//   const registrationInstallments = selected
//     .map((profileId) => {
//       const regData = registrations[profileId];
//       if (regData?.installments_selected?.length > 0) {
//         // keep only selected installments that are still due or pending
//         const dueOrPending = regData.installments_selected.filter((label) => {
//           const inst = regData.installments_info?.find(
//             (i) => i.label === label
//           );
//           return inst && ["due"].includes(inst.tag.toLowerCase());
//         });

//         if (dueOrPending.length > 0) {
//           return {
//             profile_id: profileId,
//             installments: dueOrPending,
//           };
//         }
//       }
//       return null;
//     })
//     .filter(Boolean);

//   const totalAmount = selected.reduce((sum, profileId) => {
//     const regData = registrations[profileId];
//     return sum + (regData?.amount || 0);
//   }, 0);

//   const upiId = (yatra || registerData.yatra)?.payment_upi_id || "";
//   const qrUrl = `${API.defaults.baseURL}payments/qr/?amount=${totalAmount}&upi_id=${upiId}&note=Yatra+Payment`;

//   // ---- STEP 1: Submit batch proof (create payment entry) ----
//   const submitBatchProof = async () => {
//     const payload = {
//       registration_installments: registrationInstallments,
//       transaction_id: transactionId,
//       total_amount: totalAmount,
//     };

//     const res = await API.post(
//       `/payments/${yatra_id}/batch-payment-proof/`,
//       payload
//     );
//     return res.data.payment_id;
//   };

//   // ---- STEP 2: Upload screenshot ----
//   const uploadScreenshot = async (paymentId) => {
//     const formData = new FormData();
//     formData.append("screenshot", screenshot);

//     await API.post(`/payments/${paymentId}/upload-screenshot/`, formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//   };

//   // ---- Master handler ----
//   const handleSubmitProof = async (e) => {
//     e.preventDefault();

//     if (!transactionId || !screenshot) {
//       alert("Please fill all fields.");
//       return;
//     }
//     if (registrationInstallments.length === 0) {
//       alert("No installments selected for payment.");
//       return;
//     }

//     setLoadingCheckout(true);
//     try {
//       // Step A: Register devotees
//       await API.post(`/yatras/${yatra_id}/register/`, registrations);

//       // Step B: Create batch payment (get payment_id)
//       const paymentId = await submitBatchProof();

//       // Step C: Upload screenshot for that payment
//       await uploadScreenshot(paymentId);

//       alert("✅ All registrations and payment proof submitted successfully!");
//       setCurrentStep(1);
//       setSelected([]);
//       setRegistrations({});
//       setTransactionId("");
//       setScreenshot(null);
//       fetchRegistrationData();
//       setActiveTab("registered");
//     } catch (err) {
//       console.error("Checkout error:", err);
//       alert(
//         err.response?.data?.error ||
//           "Submission failed. Please check details & try again."
//       );
//     } finally {
//       setLoadingCheckout(false);
//     }
//   };

//   return (
//     <div className="checkout-full">
//       <h3>Step 3: Checkout & Payment</h3>

//       <div className="checkout-summary">
//         <p>
//           <strong>Yatra:</strong> {(yatra || registerData.yatra)?.title}
//         </p>
//         <p>
//           <strong>Devotees:</strong> {selected.length}
//         </p>
//         <p>
//           <strong>Total Amount:</strong> ₹{totalAmount}
//         </p>
//       </div>

//       <div className="payment-flow">
//         <div className="qr-section">
//           <h4>Scan & Pay</h4>
//           <img src={qrUrl} alt="UPI QR" className="qr-code" />
//           <p>
//             <strong>Amount to Pay:</strong> ₹{totalAmount}
//           </p>

//           <form onSubmit={handleSubmitProof} className="proof-form">
//             <div className="form-group">
//               <label>Transaction ID *</label>
//               <input
//                 type="text"
//                 value={transactionId}
//                 onChange={(e) => setTransactionId(e.target.value)}
//                 placeholder="e.g., T241108123456789"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label>Payment Screenshot *</label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => setScreenshot(e.target.files[0])}
//                 required
//               />
//               {screenshot && (
//                 <div
//                   style={{
//                     marginTop: "8px",
//                     fontSize: "14px",
//                     color: "#047857",
//                   }}
//                 >
//                   ✓ File selected: {screenshot.name}
//                 </div>
//               )}
//             </div>

//             <div className="step-actions">
//               <div></div>
//               {/* <button
//                 onClick={onBack}
//                 className="btn-back"
//                 type="button"
//                 disabled={loadingCheckout}
//               >
//                 Back to Review
//               </button> */}

//               <button
//                 type="submit"
//                 disabled={loadingCheckout || !screenshot || !transactionId}
//                 className="btn-next"
//               >
//                 {loadingCheckout ? "Submitting..." : "Submit All & Pay"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckoutStep;
// src/pages/components/CheckoutStep.jsx
import { useEffect, useState } from "react";
import { useYatraRegistration } from "../context/YatraRegistrationContext";
import API from "../../../services/api";

const CheckoutStep = ({ onBack, setCurrentStep }) => {
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // 🔵 NEW: status of screenshot verification
  const [verificationStatus, setVerificationStatus] = useState("pending"); 
  const [verifying, setVerifying] = useState(false);

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
      if (confirmLeave) {
        window.location.href = `/yatras`;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // ---- Calculate total
  const registrationInstallments = selected
    .map((profileId) => {
      const regData = registrations[profileId];
      if (regData?.installments_selected?.length > 0) {
        const dueOrPending = regData.installments_selected.filter((label) => {
          const inst = regData.installments_info?.find(
            (i) => i.label === label
          );
          return inst && ["due"].includes(inst.tag.toLowerCase());
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

      if (data.success === true && data.matched === true) {
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

  // Automatically trigger verification when user selects screenshot
  const handleScreenshotChange = (file) => {
    setScreenshot(file);
    if (file) {
      verifyPaymentScreenshot(file);
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

      alert("✅ Payment proof submitted successfully!");
      setCurrentStep(1);
      setSelected([]);
      setRegistrations({});
      setTransactionId("");
      setScreenshot(null);
      fetchRegistrationData();
      setActiveTab("registered");
    } catch (err) {
      console.error("Checkout error:", err);
      alert(
        err.response?.data?.error ||
          "Submission failed. Please try again."
      );
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div className="checkout-full">
      <h3>Step 3: Checkout & Payment</h3>

      <div className="checkout-summary">
        <p><strong>Total Amount:</strong> ₹{totalAmount}</p>
      </div>

      <div className="qr-section">
        <h4>Scan & Pay</h4>
        <img src={qrUrl} alt="UPI QR" className="qr-code" />

        <form onSubmit={handleSubmitProof} className="proof-form">

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

            {/* Status Messages */}
            {verifying && <p style={{ color: "blue" }}>⏳ Verifying screenshot…</p>}
            {verificationStatus === "valid" && (
              <p style={{ color: "green" }}>✓ Screenshot Verified!</p>
            )}
            {verificationStatus === "invalid" && (
              <p style={{ color: "red" }}>❌ Invalid screenshot or amount mismatch.</p>
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
      </div>
    </div>
  );
};

export default CheckoutStep;

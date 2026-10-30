import React, { useEffect, useRef, useState } from "react";
import styles from "../../css/DonationForm.module.css";
import FormField from "./FormField";
import FullPageLoader from "../../components/FullPageLoader";
import { useNavigate } from "react-router-dom";
import CustomisedAlert from "../../components/CustomisedAlert.jsx";
import API from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiErrors";
import { useAuth } from "../../context/AuthContext";
import { PAYMENT_ACCOUNT_NAME } from "./DonatePage";
import { extractScreenshotText, matchesAccountName, matchesAmount, matchesTransactionId } from "../../utils/paymentScreenshot";
import "../Registration/css/registrationTab.css";

const DONATION_STEPS = [
  { key: "amount", label: "Amount" },
  { key: "transaction", label: "Trans. ID" },
  { key: "recipient", label: "Account" },
  { key: "submit", label: "Submit" },
];

export default function DonationForm() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const editedFields = useRef(new Set());
  const [form, setForm] = useState({
    donorName: "",
    initiatedName: "",
    address: "",
    mobile: "",
    donationAmount: "",
    pan: "",
    email: "",
    transactionId: "",
  });
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [verification, setVerification] = useState(null);

  useEffect(() => {
    if (!profile) return;
    const details = {
      donorName: [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || profile.full_name || "",
      initiatedName: profile.initiated_name || "",
      address: profile.address || "",
      mobile: profile.mobile || "",
      email: profile.email || "",
    };
    setForm((current) => {
      const next = { ...current };
      for (const [field, value] of Object.entries(details)) {
        if (!editedFields.current.has(field)) next[field] = value;
      }
      return next;
    });
  }, [profile]);

  const handleChange = (field) => (e) => {
    editedFields.current.add(field);
    setForm((current) => ({ ...current, [field]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setPaymentScreenshot(e.target.files[0]);
    setVerification(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const steps = { amount: "idle", transaction: "idle", recipient: "idle", submit: "idle" };
    const updateStep = (key, status, message) => {
      steps[key] = status;
      setVerification({ steps: { ...steps }, message });
    };

    try {
      if (!paymentScreenshot || Number(form.donationAmount) <= 0) {
        updateStep("amount", "error", "Enter a positive donation amount and select a screenshot.");
        return;
      }
      if (paymentScreenshot.size > 5 * 1024 * 1024) {
        updateStep("amount", "error", "The screenshot must be 5 MB or smaller.");
        return;
      }

      updateStep("amount", "loading", "Checking amount…");
      const { tesseractText, getOCRSpaceText } = await extractScreenshotText(paymentScreenshot);
      const check = async (predicate) => predicate(tesseractText) || predicate(await getOCRSpaceText());
      if (!await check((text) => matchesAmount(text, Number(form.donationAmount)))) {
        updateStep("amount", "error", `Amount not found in screenshot. Expected ₹${form.donationAmount}.`);
        return;
      }
      updateStep("amount", "success", "Amount found in screenshot.");
      updateStep("transaction", "loading", "Checking transaction ID…");
      if (!await check((text) => matchesTransactionId(text, form.transactionId))) {
        updateStep("transaction", "error", "Transaction ID not found in screenshot.");
        return;
      }
      updateStep("transaction", "success", "Transaction ID found in screenshot.");
      updateStep("recipient", "loading", "Checking account name…");
      if (!await check((text) => matchesAccountName(text, PAYMENT_ACCOUNT_NAME))) {
        updateStep("recipient", "error", "Account name not found in the screenshot. Please upload a screenshot showing the recipient's account name.");
        return;
      }
      updateStep("recipient", "success", "Account name found in screenshot.");
      updateStep("submit", "loading", "Submitting donation…");

      const payload = new FormData();
      const fields = {
        donor_name: form.donorName, initiated_name: form.initiatedName,
        address: form.address, mobile: form.mobile, amount: form.donationAmount,
        pan: form.pan, email: form.email, transaction_id: form.transactionId,
      };
      Object.entries(fields).forEach(([key, value]) => payload.append(key, value));
      payload.append("screenshot", paymentScreenshot);
      await API.post("/payments/donations/", payload);
      updateStep("submit", "success", "Donation submitted successfully.");
      CustomisedAlert("Thank you! Your donation was submitted successfully.");
      navigate("/");
    } catch (err) {
      const active = DONATION_STEPS.find((step) => steps[step.key] === "loading")?.key || "submit";
      const fallback = "Could not submit your donation. Please try again later.";
      const responseData = err.response?.data;
      const isHtml = typeof responseData === "string" && /<\s*(?:!doctype|html|head|body)\b/i.test(responseData);
      const message = err.response?.status >= 500 || isHtml ? fallback : getApiErrorMessage(err, fallback);
      updateStep(active, "error", message);
    } finally {
      setLoading(false);
    }
  };

  // Array of field configs
  const fields = [
    {
      label: "Email",
      type: "email",
      key: "email",
      placeholder: "Your answer",
      imageSrc: "/email.png",
    },
    {
      label: "Donor Name",
      key: "donorName",
      placeholder: "Enter your full name",
      imageSrc: "/name.png",
    },
    {
      label: "Initiated Name (if initiated)",
      key: "initiatedName",
      placeholder: "Enter your initiated name",
      // imageSrc: "/init.png", // add icon
      required: false,
    },

    {
      label: "Address (with District, State, PIN code)",
      key: "address",
      placeholder: "Enter full address",
      imageSrc: "/add.png",
    },
    {
      label: "Mobile/WhatsApp number",
      type: "number",
      key: "mobile",
      placeholder: "Enter mobile number",
      imageSrc: "/wapp.png",
    },
    {
      label: "Donation Amount",
      type: "number",
      key: "donationAmount",
      placeholder: "Enter amount in ₹",
      imageSrc: "/damt.png",
    },
    {
      label: `Transaction ID`,
      key: "transactionId",
      placeholder: "Enter Transaction ID",
      imageSrc: "/tid.png",
    },
    {
      label: `Payment Screenshot`,
      key: "paymentScreenshot",
      placeholder: "Upload Payment Screenshot",
      imageSrc: "/pay.png",
      type: "file",
      accept: "image/*",
    },
    {
      label: `PAN Number (for donations above ₹50,000)`,
      key: "pan",
      placeholder: "Enter PAN number if applicable",
      required: false,
      imageSrc: "/pan.png",
    },
  ];

  return (
    <>
      {loading && <FullPageLoader />}
      <form className={styles.donationForm} onSubmit={handleSubmit}>
        {fields.map((field) => (
          <FormField
            key={field.key}
            name={field.key}
            label={field.label}
            type={field.type}
            value={field.type !== "file" ? form[field.key] : undefined}
            onChange={
              field.type === "file" ? handleFileChange : handleChange(field.key)
            }
            placeholder={field.placeholder}
            imageSrc={field.imageSrc}
            required={field.required !== false}
            accept={field.accept}
          >
            {field.key === "paymentScreenshot" && verification && (
          <div className={`payment-progress ${styles.verificationProgress}`} aria-live="polite">
            <div className="payment-progress-steps">
              {DONATION_STEPS.map((step, index) => {
                const status = verification.steps[step.key];
                const previousComplete = index > 0 && verification.steps[DONATION_STEPS[index - 1].key] === "success";
                return (
                  <div className={`payment-progress-step is-${status} ${previousComplete ? "previous-complete" : ""}`} key={step.key}>
                    <span className="payment-progress-icon" aria-hidden="true">{status === "success" ? "✓" : status === "error" ? "×" : status === "loading" ? <span className="payment-progress-spinner" /> : index + 1}</span>
                    <span>{step.label}</span>
                    <span className="payment-progress-sr-only">: {status}</span>
                  </div>
                );
              })}
            </div>
            {verification.message && <div className={`payment-progress-message ${Object.values(verification.steps).includes("error") ? "is-error" : ""}`}>{verification.message}</div>}
          </div>
            )}
          </FormField>
        ))}

        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Back
          </button>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </>
  );
}

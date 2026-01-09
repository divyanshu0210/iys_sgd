import React, { useState } from "react";
import styles from "../../css/DonationForm.module.css";
import FormField from "./FormField";
import FullPageLoader from "../../components/FullPageLoader";
import { useNavigate } from "react-router-dom";
import CustomAlert from "../../components/CustomAlert";
import { compressImage } from "./utils.js";
export default function DonationForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    donorName: "",
    address: "",
    mobile: "",
    donationAmount: "",
    pan: "",
    email: "",
    transactionId: "",
  });
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPaymentScreenshot(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let payload = { ...form };

    if (paymentScreenshot) {
      const compressedBase64 = await compressImage(paymentScreenshot, 800, 800, 0.7);
      const base64Data = compressedBase64.split(",")[1]; // remove "data:image/jpeg;base64,"
      payload.paymentScreenshot = base64Data;
      payload.paymentScreenshotName = paymentScreenshot.name.replace(/\.[^/.]+$/, ".jpg"); // convert extension to jpg
    }

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbzDoocqozKcyWl1omgmryWQZdOqjH3wk4K1qOBvjsgFRM7e2VWxs96YHlzZZDNsOrp0jA/exec",
        {
          method: "POST",
          body: JSON.stringify(payload),
   
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        CustomAlert(
          "Thank you! Donation submitted successfully!"
        );
        navigate("/");

        setForm({
          donorName: "",
          address: "",
          mobile: "",
          donationAmount: "",
          pan: "",
          email: "",
          transactionId: "",
        });
        setPaymentScreenshot(null);
      } else {
        alert("Error submitting donation: " + result.message);
      }
    } catch (err) {
      alert("Error submitting donation: " + err.message);
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
      label: `PAN Number (for 80G receipt or donations ₹50,000+)`,
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
          />
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

  <button
    type="submit"
    className={styles.submitBtn}
    disabled={loading}
  >
    {loading ? "Submitting..." : "Submit"}
  </button>
</div>
      </form>
    </>
  );
}



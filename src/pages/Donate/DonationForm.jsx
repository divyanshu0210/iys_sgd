import React, { useState } from "react";
import styles from "../../css/DonationForm.module.css";
import FormField from "./FormField";
import FullPageLoader from "../../components/FullPageLoader";
import { useNavigate } from "react-router-dom";

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
  });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxYEVLnuHKqCHklnMiAEANaQJcy3JmgrZ6M1lV8o8Dt6KNC14SoU5FpmBjEcC2tK9gp6g/exec", // replace with your web app URL
        {
          method: "POST",
          body: JSON.stringify(form),
        
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        alert(
          "Donation submitted successfully! A confirmation email has been sent."
        );
        navigate("/donate");
        
        setForm({
          donorName: "",
          address: "",
          mobile: "",
          donationAmount: "",
          pan: "",
          email: "",
        });
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
            label={field.label}
            type={field.type}
            value={form[field.key]}
            onChange={handleChange(field.key)}
            placeholder={field.placeholder}
            imageSrc={field.imageSrc}
            required={field.required !== false}
          />
        ))}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </>
  );
}

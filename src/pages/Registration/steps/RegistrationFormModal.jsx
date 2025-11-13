// src/components/RegistrationFormModal.jsx
import React, { useEffect, useState } from "react";
import { useYatraRegistration } from "../context/YatraRegistrationContext";
import "../css/registrationFormModal.css";

function RegistrationFormModal({ profile, onClose }) {
  const {
    getInstallmentAmount,
    registrations,
    setRegistrations,
    setSelected,
    registerData,
    yatra,
  } = useYatraRegistration();

  const profileId = profile.id || profile.profile_id;
  const existing = registrations[profileId];

  const initialFormFields = existing?.form_fields || {};
  const [formFields, setFormFields] = useState(initialFormFields);
  const [installmentsSelected, setInstallmentsSelected] = useState(
    existing?.installments_selected || []
  );
  const [installmentsPaid, setInstallmentsPaid] = useState(
    existing?.installments_paid || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasPaidInstallments = installmentsPaid.length > 0;
  const isReadOnly = existing?.hasProof || false; // Only disable for proof, not paid installments
  const installments = yatra?.installments || [];

  useEffect(() => {
    setFormFields(existing?.form_fields || {});
    setInstallmentsSelected(existing?.installments_selected || []);
    setInstallmentsPaid(existing?.installments_paid || []);
  }, [existing, yatra]);

  const handleFieldChange = (e) => {
    if (isReadOnly) return;
    const { name, value, type, checked } = e.target;
    setFormFields((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleInstallmentToggle = (label) => {
    const match = existing?.installments_details?.find(
      (i) => i.label === label
    );
    const instPaidOrProof = match?.is_paid || match?.proof;
    if (instPaidOrProof) return; // cannot select paid/proof installments
    setInstallmentsSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleFormSave = async (profileId, formPayload) => {
    const { form_fields, installments_selected, installments_paid, amount } =
      formPayload;
    const profileObj = registerData.profiles.find((p) => p.id === profileId);

    try {
      setRegistrations((prev) => ({
        ...prev,
        [profileId]: {
          ...prev[profileId],
          form_fields,
          installments_selected,
          installments_paid: installments_paid || [],
          amount,
          registration_id: profileObj.registration_id,
        },
      }));

      setSelected((prev) =>
        prev.includes(profileId) ? prev : [...prev, profileId]
      );
    } catch (err) {
      alert(err.response?.data?.errors?.[0] || "Failed to save registration");
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const missing = (yatra.form_fields || []).filter(
      (f) => f.is_required && !formFields[f.name]
    );
    if (missing.length > 0) {
      alert(
        `Please fill required fields: ${missing.map((m) => m.label).join(", ")}`
      );
      return;
    }

    if (installmentsSelected.length === 0) {
      alert("Select at least one installment to proceed.");
      return;
    }
    const amount = installmentsSelected
      .filter((label) => {
        const inst = profile?.installments_info.find((i) => i.label === label);
        return inst && ["due"].includes(inst.tag.toLowerCase());
      })
      .reduce((sum, label) => sum + getInstallmentAmount(label), 0);

    setIsSubmitting(true);
    try {
      await handleFormSave(profileId, {
        form_fields: formFields,
        installments_selected: installmentsSelected,
        installments_paid: installmentsPaid,
        amount,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSelectedAmount = installmentsSelected.reduce(
    (sum, label) => sum + getInstallmentAmount(label),
    0
  );

  // Check if any unpaid installment is selected
  const unpaidInstallmentsSelected = installmentsSelected.filter((label) => {
    const match = existing?.installments_details?.find(
      (i) => i.label === label
    );
    return !(match?.is_paid || match?.proof);
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2 className="modal-title">
            {isReadOnly ? "View Registration" : "Register"} —{" "}
            <span className="highlight">{profile.full_name}</span>
          </h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </header>

        {isReadOnly && (
          <div className="info-banner">
            ⚠️ Form is read-only because proof has been submitted.
          </div>
        )}

        <form className="form-body" onSubmit={handleSubmit}>
          {/* --- Dynamic Fields --- */}
          <div className="form-section">
            <h3 className="section-title">Personal Details</h3>
            <div className="form-fields">
              {(yatra.form_fields || []).map((field) => (
                <div key={field.name} className="form-group-modern">
                  <label className="form-label">
                    {field.label}{" "}
                    {field.is_required && !isReadOnly && (
                      <span className="required">*</span>
                    )}
                  </label>
                  {field.field_type === "select" ? (
                    <select
                      name={field.name}
                      onChange={handleFieldChange}
                      value={formFields[field.name] || ""}
                      disabled={isReadOnly}
                      className="form-input"
                    >
                      <option value="">Select...</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.field_type === "radio" ? (
                    <div className="radio-group-modern">
                      {field.options.map((opt) => (
                        <label key={opt} className="radio-label-modern">
                          <input
                            type="radio"
                            name={field.name}
                            value={opt}
                            onChange={handleFieldChange}
                            checked={formFields[field.name] === opt}
                            disabled={isReadOnly}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : field.field_type === "checkbox" ? (
                    <label className="checkbox-modern">
                      <input
                        type="checkbox"
                        name={field.name}
                        checked={!!formFields[field.name]}
                        onChange={handleFieldChange}
                        disabled={isReadOnly}
                      />
                      Yes
                    </label>
                  ) : (
                    <input
                      type={field.field_type}
                      name={field.name}
                      onChange={handleFieldChange}
                      value={formFields[field.name] || ""}
                      placeholder={field.label}
                      disabled={isReadOnly}
                      className="form-input"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* --- Installments Section --- */}
          <div className="form-section">
            <h3 className="section-title">
              {isReadOnly
                ? "Payment"
                : "Choose Installments (multiple allowed)"}
            </h3>

            {!isReadOnly && totalSelectedAmount > 0 && (
              <div className="amount-banner">
                Total Selected: ₹{totalSelectedAmount}
              </div>
            )}

            <div className="installment-list">
              {installments.map((instBase) => {
                const match = existing?.installments_details?.find(
                  (e) => e.label === instBase.label
                );
                const inst = { ...instBase, ...match };

                const label = inst.label;
                const isPaid = inst.is_paid;
                const isSelected = installmentsSelected.includes(label);
                const amount = inst.amount || getInstallmentAmount(label);
                const hasProof = !!inst.proof;

                return (
                  <div
                    key={label}
                    className={`installment-card ${
                      isPaid
                        ? "installment-paid"
                        : isSelected
                        ? "installment-selected"
                        : ""
                    }`}
                  >
                    <label className="installment-label">
                      <input
                        type="checkbox"
                        checked={isSelected || isPaid}
                        onChange={() => handleInstallmentToggle(label)}
                        disabled={isPaid || hasProof}
                      />
                      <span>
                        <strong>{label}</strong> — ₹{amount}
                      </span>
                      {isPaid && (
                        <span className="installment-status paid">✓ Paid</span>
                      )}
                      {hasProof && (
                        <span
                          className={`installment-status ${
                            inst.verified ? "verified" : "pending"
                          }`}
                        >
                          ({inst.verified ? "Verified" : "Verification Pending"}
                          )
                        </span>
                      )}
                    </label>

                    {hasProof && (
                      <a
                        href={inst.proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-proof-link"
                      >
                        View Proof
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- Actions --- */}
          <div className="form-actions-modern">
            {/* Save button enabled only if unpaid installments are selected */}
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || unpaidInstallmentsSelected.length === 0}
            >
              {isSubmitting ? "Saving..." : "Save & Continue"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default React.memo(RegistrationFormModal);

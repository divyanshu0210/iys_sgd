// src/components/RegistrationFormModal.jsx
import React, { useEffect, useMemo, useState } from "react";
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
  const today = useMemo(() => new Date(), []);

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

  const isReadOnly = existing?.hasProof || false; // Only disable for proof, not paid installments
  const existingHasPhaseInstallment = Boolean(
    existing?.installments_info?.length
  );
  const registrationPhase =
    (existingHasPhaseInstallment ? existing?.phase : null) ||
    profile?.registration_phase ||
    null;
  const configuredPhaseInstallments = useMemo(
    () =>
      yatra?.registration_phases?.find(
        (phase) => String(phase.id) === String(registrationPhase?.id)
      )?.installments || [],
    [yatra?.registration_phases, registrationPhase?.id]
  );
  const installments = useMemo(
    () =>
      existing?.installments_info?.length > 0
        ? existing.installments_info
        : profile?.installments_info?.length > 0
        ? profile.installments_info
        : !existing?.registration_id && configuredPhaseInstallments.length > 0
        ? configuredPhaseInstallments
        : registrationPhase
        ? []
        : (yatra?.installments || []).filter(
            (installment) => !installment.phase_id && !installment.phase
          ),
    [
      existing?.installments_info,
      existing?.registration_id,
      profile?.installments_info,
      configuredPhaseInstallments,
      registrationPhase,
      yatra?.installments,
    ]
  );
  const phaseEnded = Boolean(
    registrationPhase?.end_date &&
      new Date(`${registrationPhase.end_date}T23:59:59`) < today
  );
  const hasPendingInstallments = installments.some((installment) => {
    const match = existing?.installments_details?.find(
      (item) => item.label === installment.label
    );
    return !(
      match?.is_paid ||
      (match?.proof && match?.status !== "rejected")
    );
  });
  const registrationClosedForPending = phaseEnded && hasPendingInstallments;

  const nextPhase = useMemo(() => {
    const phases = (yatra?.registration_phases || [])
      .filter((phase) => phase.start_date)
      .sort((a, b) => a.start_date.localeCompare(b.start_date));
    const upcomingIndex = phases.findIndex(
      (phase) => new Date(`${phase.start_date}T00:00:00`) > today
    );
    return upcomingIndex >= 0
      ? { phase: phases[upcomingIndex], isFirst: upcomingIndex === 0 }
      : null;
  }, [yatra?.registration_phases, today]);

  useEffect(() => {
    setFormFields(existing?.form_fields || {});
    setInstallmentsSelected(existing?.installments_selected || []);
    setInstallmentsPaid(existing?.installments_paid || []);
  }, [existing, yatra]);

  const isInstallmentMandatory = (installment) => {
    if (!installment.start_date) return false;
    const startDate = new Date(`${installment.start_date}T00:00:00`);
    return startDate <= new Date();
  };

  useEffect(() => {
    const mandatoryIndexes = installments
      .map((installment, index) => (isInstallmentMandatory(installment) ? index : -1))
      .filter((index) => index >= 0);
    if (!mandatoryIndexes.length) return;

    const mandatoryLabels = installments
      .slice(0, Math.max(...mandatoryIndexes) + 1)
      .map((installment) => installment.label);

    setInstallmentsSelected((previous) => [
      ...new Set([...previous, ...mandatoryLabels]),
    ]);
  }, [existing, installments]);

  const handleFieldChange = (e) => {
    if (isReadOnly) return;
    const { name, value, type, checked } = e.target;
    setFormFields((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const isInstallmentSatisfied = (installment) => {
    const match = existing?.installments_details?.find(
      (item) => item.label === installment.label
    );

    return (
      installmentsSelected.includes(installment.label) ||
      installmentsPaid.includes(installment.label) ||
      match?.is_paid ||
      (match?.proof && match?.status !== "rejected")
    );
  };

  const getMissingPrerequisite = (index) =>
    installments
      .slice(0, index)
      .find((installment) => !isInstallmentSatisfied(installment));

  const handleInstallmentToggle = (label) => {

    const index = installments.findIndex((installment) => installment.label === label);
    const missingPrerequisite = getMissingPrerequisite(index);

    if (
      !installmentsSelected.includes(label) &&
      missingPrerequisite
    ) {
      alert(`Please select ${missingPrerequisite.label} before selecting ${label}.`);
      return;
    }

    if (installmentsSelected.includes(label)) {
      const installment = installments.find((item) => item.label === label);
      if (installment && isInstallmentMandatory(installment)) {
        alert(`${label} is now mandatory and cannot be deselected.`);
        return;
      }

      const higherSelected = installments
        .slice(index + 1)
        .find((installment) => installmentsSelected.includes(installment.label));

      if (higherSelected) {
        // alert(`Please deselect ${higherSelected.label} before deselecting ${label}.`);
        return;
      }
    }

    const match = existing?.installments_details?.find(
      (i) => i.label === label
    );
    const instPaidOrProof =
      match?.is_paid || (match?.proof && match?.status !== "rejected");
    // const instPaidOrProof = match?.is_paid;
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
          phase: prev[profileId]?.phase || registrationPhase,
          phase_id: prev[profileId]?.phase_id || registrationPhase?.id || null,
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
        const inst = installments.find((i) => i.label === label);
        return inst && ["due", "rejected"].includes(inst.tag.toLowerCase());
      })
      .reduce((sum, label) => sum + getInstallmentAmount(label, installments), 0);

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
    (sum, label) => sum + getInstallmentAmount(label, installments),
    0
  );

  // Check if any unpaid installment is selected
  const unpaidInstallmentsSelected = installmentsSelected.filter((label) => {
    const match = existing?.installments_details?.find(
      (i) => i.label === label
    );
    return !(match?.is_paid || (match?.proof && match?.status !== "rejected"));
    // return !(match?.is_paid || match?.proof);
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2 className="modal-title">
            {isReadOnly ? "View Registration" : "Register"} —{" "}
            <span className="highlight">{profile.is_initiated?profile.initiated_name:profile.full_name}</span>
          </h2>
          <button className="form-close-btn" onClick={onClose}>
            X
          </button>
        </header>

        {(yatra.form_fields || []).length > 0 &&
          (isReadOnly ? (
            <div className="info-banner">
              ⚠️ Form is read-only because proof has been submitted.
            </div>
          ) : (
            <p className="info-banner">Form can only be filled once.</p>
          ))}
          
            {registrationPhase?.end_date && !phaseEnded && (
              <div className="info-banner phase-banner">
                Registration closes on{" "}
                <strong>
                  {new Date(`${registrationPhase.end_date}T00:00:00`).toLocaleDateString(
                    "en-IN",
                    { day: "2-digit", month: "short", year: "numeric" }
                  )}
                </strong>
              </div>
            )}
        <form className="form-body" onSubmit={handleSubmit}>
          {/* --- Dynamic Fields --- */}
          {(yatra.form_fields || []).length > 0 && (
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
          )}

          {/* --- Installments Section --- */}
          <div className="form-section">
            {installments.length > 0 && (
              <h3 className="section-title">
                {isReadOnly
                  ? "Payment"
                  : "Choose Installments (multiple allowed)"}
              </h3>
            )}
            {!isReadOnly && totalSelectedAmount > 0 && (
              <div className="amount-banner">
                Total Selected: ₹{totalSelectedAmount}
              </div>
            )}

            {!installments.length && nextPhase && (
              <div className="info-banner phase-banner">
                Yatra Registration will {nextPhase.isFirst ? "start" : "resume"} from{" "}
                <strong>
                  {new Date(`${nextPhase.phase.start_date}T00:00:00`).toLocaleDateString(
                    "en-IN",
                    { day: "2-digit", month: "short", year: "numeric" }
                  )}
                </strong>
              </div>
            )}

            {!installments.length &&
              !nextPhase &&
              !registrationPhase &&
              yatra?.registration_phases?.length > 0 && (
                <div className="info-banner phase-banner">
                  Registration has been closed to new users.
                </div>
              )}

            {registrationClosedForPending && (
              <div className="info-banner phase-banner">
                Registration has closed.This yatra is no more accepting payments.
              </div>
            )}

            <div className="installment-list">
              {installments.map((instBase, index) => {
                const match = existing?.installments_details?.find(
                  (e) => e.label === instBase.label
                );
                const inst = { ...instBase, ...match };

                const label = inst.label;
                const isPaid = inst.is_paid;
                const isSelected = installmentsSelected.includes(label);
                const amount = inst.amount || getInstallmentAmount(label, installments);
                const hasProof = !!inst.proof;
                const isRejected = inst.status === "rejected";
                const isMandatory = isInstallmentMandatory(inst);
                const missingPrerequisite = getMissingPrerequisite(index);
                const orderBlocked = Boolean(
                  !isPaid && !isReadOnly && missingPrerequisite
                );

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
                        className={
                          isMandatory ? "mandatory-installment-checkbox" : ""
                        }
                        checked={isSelected || isPaid}
                        onChange={(event) => {
                          if (isMandatory) {
                            event.preventDefault();
                            return;
                          }
                          handleInstallmentToggle(label);
                        }}
                        onClick={(event) => {
                          if (isMandatory) event.preventDefault();
                        }}
                        aria-disabled={isMandatory}
                        disabled={
                          isPaid ||
                          (hasProof && !isRejected) ||
                          orderBlocked
                        }
                        title={
                          isMandatory
                            ? "Mandatory installment"
                            : orderBlocked
                            ? `Select ${missingPrerequisite.label} first`
                            : ""
                        }
                        // disabled={isPaid}
                      />
                      <span>
                        <strong>{label}</strong>
                        {/* {!isPaid && <span>- ₹{amount}</span>} */}
                        {!hasProof && <span>- ₹{amount}</span>}
                      </span>
                      {isPaid && (
                        <span className="installment-status paid">Paid</span>
                      )}
                      {hasProof && (
                        <>
                          {inst.status === "rejected" && <br />}
                          <span
                            className={`installment-status ${
                              inst.status === "verified"
                                ? "verified"
                                : inst.status === "rejected"
                                ? "rejected"
                                : "pending"
                            }`}
                          >
                            {inst.status === "rejected"
                              ? "(Rejected - Please re-upload)"
                              : `(${inst.status})`}
                          </span>
                        </>
                      )}
                    </label>
                    {hasProof && (
                      <a
                        href={inst.proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-proof-link"
                      >
                        View
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
              disabled={
                isSubmitting ||
                registrationClosedForPending ||
                unpaidInstallmentsSelected.length === 0
              }
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

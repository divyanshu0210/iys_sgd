import { useNavigate } from "react-router-dom";
import {
  STORAGE_KEY,
  useYatraRegistration,
} from "../context/YatraRegistrationContext";
import RegistrationFormModal from "./RegistrationFormModal";
import { useState } from "react";

const ReviewStep = ({ onBack, onNext }) => {
  const [editingProfile, setEditingProfile] = useState(null);
  const navigate = useNavigate();

  const {
    selected,
    registrations,
    registerData,
    getInstallmentAmount,
    hasPaidInstallments,
    yatra,
    yatra_id,
  } = useYatraRegistration();

  // Build registration_installments object for backend
  const registrationInstallments = {};
  let totalAmount = 0;

  selected.forEach((profileId) => {
    const regData = registrations[profileId];
    if (regData?.installments_selected?.length > 0) {
      registrationInstallments[regData.registration_id || profileId] =
        regData.installments_selected;
      totalAmount += regData.amount || 0;
    }
  });

  const handleProceedToCheckout = () => {
    const checkoutData = {
      selected, // array of profile ids
      registrations, // full registration object per profile
      yatra,
      registerData,
      yatra_id,
      savedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkoutData));
    navigate("../checkout");
  };

  return (
    <>
      {/* ==================== DESKTOP TABLE ==================== */}
      <div className="review-container">
        <h3>Step 2: Review Details</h3>

        {/* ----- Desktop Table (hidden on mobile) ----- */}
        <table className="review-table review-table-desktop">
          <thead>
            <tr>
              <th>Devotee</th>
              <th>Details</th>
              <th>Installments Selected</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {selected.map((id) => {
              const data = registrations[id] || {};
              const profile =
                registerData.profiles?.find((p) => p.id === id) || {};
              const hasPaid = hasPaidInstallments(profile);

              return (
                <tr key={id}>
                  <td>
                    <strong>{profile.full_name || "Unknown"}</strong>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      ID: {profile.member_id}
                    </div>
                  </td>
                  <td>
                    {data.form_fields &&
                      Object.entries(data.form_fields).map(([k, v]) => (
                        <div key={k}>
                          <strong>{k}:</strong> {v}
                        </div>
                      ))}
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "4px",
                      }}
                    >
                      {data.installments_selected
                        ?.filter((label) => {
                          const inst = data.installments_info?.find(
                            (i) => i.label === label
                          );
                          return (
                            inst && ["due"].includes(inst.tag.toLowerCase())
                          );
                        })
                        .map((instLabel) => (
                          <span
                            key={instLabel}
                            className="installment-badge-small"
                          >
                            {instLabel} (₹{getInstallmentAmount(instLabel)})
                          </span>
                        ))}
                    </div>
                  </td>
                  <td>₹{data.amount || 0}</td>
                  <td>
                    <button
                      onClick={() => setEditingProfile(id)}
                      className="btn-edit"
                      disabled={hasPaid}
                      title={hasPaid ? "Cannot edit after payment" : ""}
                    >
                      {hasPaid ? "View" : "Edit"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ----- Mobile Card List (hidden on desktop) ----- */}
        <div className="review-mobile-cards">
          {selected.map((id) => {
            const data = registrations[id] || {};
            const profile =
              registerData.profiles?.find((p) => p.id === id) || {};
            const hasPaid = hasPaidInstallments(profile);

            return (
              <div key={id} className="review-mobile-card">
                <div className="mobile-card-header">
                  <strong>{profile.full_name || "Unknown"}</strong>
                  <span className="mobile-card-id">
                    ID: {profile.member_id}
                  </span>
                </div>

                {/* Form fields */}
                <div className="mobile-card-section">
                  {data.form_fields &&
                    Object.entries(data.form_fields).map(([k, v]) => (
                      <div key={k} className="mobile-field">
                        <strong>{k}:</strong> {v}
                      </div>
                    ))}
                </div>

                {/* Installments */}
                <div className="mobile-card-section">
                  <strong>Installments:</strong>
                  <div className="mobile-installments">
                    {data.installments_selected
                      ?.filter((label) => {
                        const inst = data.installments_info?.find(
                          (i) => i.label === label
                        );
                        return inst && ["due"].includes(inst.tag.toLowerCase());
                      })
                      .map((instLabel) => (
                        <span
                          key={instLabel}
                          className="installment-badge-small"
                        >
                          {instLabel} (₹{getInstallmentAmount(instLabel)})
                        </span>
                      ))}
                  </div>
                </div>

                {/* Amount & Action */}
                <div className="mobile-card-footer">
                  <div>
                    <strong>Amount:</strong> ₹{data.amount || 0}
                  </div>
                  <button
                    onClick={() => setEditingProfile(id)}
                    className="btn-edit"
                    disabled={hasPaid}
                    title={hasPaid ? "Cannot edit after payment" : ""}
                  >
                    {hasPaid ? "View" : "Edit"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {/* 
        <div className="total-row">
          <strong>Total Amount: ₹{totalAmount}</strong>
        </div> */}

        <div className="step-actions fixed">
          <button
            onClick={() => {
              setCurrentStep(1);
            }}
            className="btn-back"
          >
            Back
          </button>
          <button
            onClick={() => {
              handleProceedToCheckout();
            }}
            className="btn-next"
            disabled={totalAmount === 0}
          >
            Proceed to Pay <span>(Total ₹{totalAmount})</span>
          </button>
        </div>
      </div>

      {/* Modal stays the same */}
      {editingProfile && (
        <RegistrationFormModal
          profile={registerData.profiles?.find((p) => p.id === editingProfile)}
          onClose={() => setEditingProfile(null)}
          existing={registrations[editingProfile]}
        />
      )}
    </>
  );
};

export default ReviewStep;

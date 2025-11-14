// src/pages/components/WhatsAppCard.jsx
import { useState } from "react";
import { useYatraRegistration } from "../context/YatraRegistrationContext";
import InstallmentBadge from "./InstallmentBadge";
import RegistrationFormModal from "../steps/RegistrationFormModal";
import API from "../../../services/api";

const STATUS_LABELS = {
  pending: "Not Started",
  partial: "Incomplete",
  paid: "Confirmed",
  cancelled: "Cancelled",
};

const WhatsAppCard = ({ profile, isEligibilityCard = false, loading }) => {
  const {
    yatra,
    selected,
    setSelected,
    registrations,
    computeTotalDueForProfile,
    hasPaidInstallments,
    handleEligibility,
    requestApproval,
    setRegistrations,
  } = useYatraRegistration();

  const [localShowForm, setLocalShowForm] = useState(false);
  const [isLoadingRegistration, setIsLoadingRegistration] = useState(false);

  const profileId = profile.id || profile.profile_id;
  const isApproved = profile.is_approved ?? profile.is_eligible;
  const isLoading =
    loading?.[`${profileId}-approve`] || loading?.[`${profileId}-unapprove`];
  const isSelfRequesting = loading?.selfRequest && profile.is_self;
  const regData = registrations[profileId];
  const totalDue = profile.pending_amount || computeTotalDueForProfile(profile);
  const hasPaid = hasPaidInstallments(profile);

  // Check if this profile has existing registration data
  const hasExistingData =
    registrations[profileId]?.form_fields &&
    Object.keys(registrations[profileId].form_fields).length > 0;

  const selectableInstallments =
    profile.installments_info?.filter((inst) =>
      ["due"].includes(inst.tag.toLowerCase())
    ) || [];

  const hasSelectableInstallments =
    regData?.installments_selected?.some((instLabel) =>
      selectableInstallments.some((inst) => inst.label === instLabel)
    ) || false;

  console.log(
    "selectableInstallments",
    selectableInstallments,
    regData?.installments_selected,
    hasSelectableInstallments
  );
  const getButtonText = () => {
    if (isLoadingRegistration) return "Loading...";
    if (profile.is_registered || hasExistingData) return "View";
    return "Register";
  };
  const unSelect = (profile) => {
    const profileId = profile.id || profile.profile_id;
    setSelected((prev) => prev.filter((id) => id !== profileId));
    setRegistrations((prev) => {
      const updated = { ...prev };
      delete updated[profileId];
      return updated;
    });
  };

  const toggleSelect = async (profile) => {
    const profileId = profile.id || profile.profile_id;

    // If already selected and form is open -> close form
    if (selected.includes(profileId) && localShowForm) {
      setLocalShowForm(false);
      return;
    }

    // If already selected but form not open -> open form with existing data
    if (selected.includes(profileId) || hasExistingData) {
      setLocalShowForm(true);
      return;
    }

    // If not selected and no local data -> fetch data from API and open form
    try {
      setIsLoadingRegistration(true);
      const res = await API.get(
        `/yatras/${yatra.id}/${profileId}/registrations/`
      );
      const data = res.data;

      // --- Process installments to match frontend format ---
      const installments_selected = data.installments
        .filter((i) => i.payment?.proof)
        .map((i) => i.label);

      const installments_paid = data.installments
        .filter((i) => i.is_paid)
        .map((i) => i.label);

      // If any installment has a proof, mark form as partially locked
      const hasProof = data.installments.some((i) => i.payment?.proof);

      // Enrich with flags for proof display
      const processedInstallments = data.installments.map((i) => ({
        label: i.label,
        amount: i.amount,
        is_paid: i.is_paid,
        proof: i.payment?.proof || null,
        verified: i.payment?.is_verified || false,
        transaction_id: i.payment?.transaction_id || null,
      }));

      setRegistrations((prev) => ({
        ...prev,
        [profileId]: {
          form_fields: data.form_data || {},
          installments_selected,
          installments_paid,
          installments_info: profile.installments_info,
          installments_details: processedInstallments,
          hasProof,
          registration_id: profile.registration_id,
        },
      }));

      // Select the profile and show form
      //   setSelected((prev) => [...prev, profileId]);
      setLocalShowForm(true);
    } catch (err) {
      console.error("Error fetching registration details:", err);
      alert("Could not fetch registration details");
    } finally {
      setIsLoadingRegistration(false);
    }
  };

  const handleModalClose = () => {
    setLocalShowForm(false);
  };

  return (
    <>
      <div
        className="whatsapp-card"
        style={{
          backgroundColor: hasSelectableInstallments ? "#f0fdf4" : "white",
          border: hasSelectableInstallments && "1px solid #22c55e",
          borderRadius: hasSelectableInstallments && "8px",
          display: isEligibilityCard ? "flex" : "block",
        }}
      >
        <div
          className="whatsapp-card-with-register-btn"
          style={{
            backgroundColor: hasSelectableInstallments ? "#f0fdf4" : "white",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <div
            className="whatsapp-name-line"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              // gap: "8px",
            }}
          >
            {!isEligibilityCard && hasSelectableInstallments && (
              <input
                type="checkbox"
                checked={selected.includes(profileId)}
                onChange={() => unSelect(profile)}
                className="reg-checkbox"
                title={hasPaid ? "Cannot edit after payment" : ""}
              />
            )}

            <div className="whatsapp-avatar">
              <img
                src={profile.profile_picture_url || "/default-avatar.png"}
                alt={profile.full_name}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div className="profileName"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <strong >{profile.full_name}</strong>
                {profile.is_self && <span className="badge-self">You</span>}
              </div>
              <div className="whatsapp-memberid">
                ID: {profile.member_id || "N/A"}
              </div>
            </div>
          </div>

          {!hasSelectableInstallments && (
            <span className={`badge-registered ${profile.registration_status}`}>
              {STATUS_LABELS[profile.registration_status] ||
                profile.registration_status}
            </span>
          )}
          <div className="installmet-edit">
            {/* === Installments List === */}
            {!isEligibilityCard &&
              !hasSelectableInstallments &&
              profile?.installments_info && (
                <div className="installments-div">
                  {profile.installments_info.map((inst) => {
                    let color;
                    switch (inst.tag) {
                      case "verified":
                        color = "#047857"; // green
                        break;
                      case "unverified":
                      case "verification pending":
                        color = "#ca8a04"; // amber
                        break;
                      default:
                        color = "#b91c1c"; // red (due)
                    }

                    return (
                      <div
                        key={inst.label}
                        style={{
                          borderBottom: "1px solid #e5e7eb",
                          paddingBottom: "4px",
                        }}
                      >
                        {/* Installment label + amount */}
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 500,
                            display: "flex",
                            justifyContent: "space-between",
                            color: "#666666",
                          }}
                        >
                          <span>{inst.label}</span>
                          <span>₹{inst.amount}</span>
                        </div>

                        {/* Status below */}
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 500,
                            color,
                            marginTop: "2px",
                          }}
                        >
                          Status:{" "}
                          {inst.tag.charAt(0).toUpperCase() + inst.tag.slice(1)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            <div className="installment-badge-collection">
              {!isEligibilityCard &&
                regData?.installments_selected
                  ?.map((instLabel) =>
                    selectableInstallments.find(
                      (inst) => inst.label === instLabel
                    )
                  )
                  .filter(Boolean)
                  .map((inst) => (
                    <InstallmentBadge key={inst.label} installment={inst} />
                  ))}
            </div>

            {!isEligibilityCard && (
              <button
                onClick={() => toggleSelect(profile)}
                className={`action-btn ${hasExistingData ? "edit" : "open"}`}
                style={{ minWidth: "80px", maxHeight: "35px", color: "black" }}
                disabled={isLoadingRegistration}
              >
                {getButtonText()}
              </button>
            )}
          </div>
        </div>

        {isEligibilityCard && (
          <div>
            {isEligibilityCard && !profile.is_self && (
              <button
                onClick={() =>
                  handleEligibility(
                    profileId,
                    isApproved ? "unapprove" : "approve"
                  )
                }
                disabled={isLoading || profile.is_registered}
                className={`action-btn ${isApproved ? "unapprove" : "approve"}`}
              >
                {isLoading
                  ? isApproved
                    ? "Unapproving..."
                    : "Approving..."
                  : isApproved
                  ? "Unapprove"
                  : "Approve"}
              </button>
            )}
            {isEligibilityCard && profile.is_self && (
              <>
                {!profile.approved_by && !profile.is_approved && (
                  <button
                    onClick={requestApproval}
                    disabled={isSelfRequesting}
                    className="action-btn request"
                  >
                    {isSelfRequesting ? "Sending..." : "Request"}
                  </button>
                )}
                {profile.approved_by && !profile.is_approved && (
                  <button
                    onClick={() =>
                      window.confirm("Send again?") && requestApproval()
                    }
                    disabled={isSelfRequesting}
                    className="action-btn pending"
                  >
                    {isSelfRequesting ? "Sending..." : "Request Pending"}
                  </button>
                )}
                {profile.is_approved && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Can't unapprove yourself. Contact your mentor to unapprove."
                        )
                      ) {
                      }
                    }}
                    className="action-btn unapprove"
                  >
                    Unapprove
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {localShowForm && (
        <RegistrationFormModal profile={profile} onClose={handleModalClose} />
      )}
    </>
  );
};

export default WhatsAppCard;

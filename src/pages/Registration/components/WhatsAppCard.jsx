// src/pages/components/WhatsAppCard.jsx
import { useState } from "react";
import { useYatraRegistration } from "../context/YatraRegistrationContext";
import InstallmentBadge from "./InstallmentBadge";
import RegistrationFormModal from "../steps/RegistrationFormModal";
import API from "../../../services/api";
import Modal from "../../../components/Modal";
import AccomodationTravelInfo from "./AccomodationTravelInfo";
import { generateRCS } from "../scripts/generateRCS";
import MoreActionsMenu from "./MoreActionsMenu";
import InitiateSubstitutionModal from "../Substitution/InitiateSubstitutionModal";
import CancellationModal from "../Substitution/CancellationModal";

// Full status map (matches backend)
const STATUS_MAP = {
  pending: {
    text: "Not Started",
    bg: "#e2e3e5",
    color: "#383d41",
    icon: "○",
  },
  partial: {
    text: "Incomplete",
    bg: "#f59e0b",
    color: "#ffffff",
    icon: "●",
  },
  paid: {
    text: "Confirmed",
    bg: "#d4edda",
    color: "#155724",
    icon: "✓",
  },
  substituted: {
    text: "Substituted",
    bg: "#cce5ff",
    color: "#004085",
    icon: "⇄",
  },
  refunded: {
    text: "Refunded",
    bg: "#f8d7da",
    color: "#721c24",
    icon: "↩",
  },
  cancelled: {
    text: "Cancelled",
    bg: "#f8d7da",
    color: "#721c24",
    icon: "✗",
  },
  attended: {
    text: "Attended",
    bg: "#d1ecf1",
    color: "#0c5460",
    icon: "✓✓",
  },
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
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [localShowForm, setLocalShowForm] = useState(false);
  const [openSubstitutionModal, setOpenSubstitutionModal] = useState(false);
  const [openCancellationModal, setOpenCancellationModal] = useState(false);

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

  //payments that are due & rejected
  const selectableInstallments =
    profile.installments_info?.filter((inst) =>
      ["due", "rejected"].includes(inst.tag.toLowerCase())
    ) || [];

  const hasSelectableInstallments =
    regData?.installments_selected?.some((instLabel) =>
      selectableInstallments.some((inst) => inst.label === instLabel)
    ) || false;

  const registrationStatus = profile.registration_status || "pending";
  const statusStyle = STATUS_MAP[registrationStatus];

  // Final statuses where editing is no longer allowed
  const isFinalStatus = ["substituted", "refunded", "cancelled"].includes(
    registrationStatus
  );

  const amountPaid = profile?.installments_info
    ?.filter((i) => i.tag === "verified")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  console.log(
    "selectableInstallments",
    yatra,
    registrations,
    profile,
    profileId,
    selectableInstallments,
    regData,
    regData?.installments_selected,
    hasSelectableInstallments
  );
  const getButtonText = () => {
    if (isLoadingRegistration) return "Loading...";
    if (profile.is_registered || hasExistingData) return "Payments";
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
        .filter((i) => i.payment?.proof && i.payment?.status !== "rejected")
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
        status: i.payment?.status || false,
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <div
                  className="whatsapp-profileName"
                  style={{
                    marginRight: "6px",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflow: "visible",
                  }}
                >
                  <strong>{profile.full_name}</strong>
                </div>
                {profile.is_self && <span className="badge-self">You</span>}
              </div>
              <div className="whatsapp-memberid">
                ID: {profile.member_id || "N/A"}
              </div>
            </div>
          </div>

          {!hasSelectableInstallments && !isEligibilityCard && (
            <span
              className="badge-registered"
              style={{
                backgroundColor: statusStyle.bg,
                color: statusStyle.color,
              }}
            >
              {statusStyle.icon}
              {" " + statusStyle.text}
            </span>
          )}

          <div className="installmet-edit">
            {/* === Installments List === */}
            {!isEligibilityCard &&
              !hasSelectableInstallments &&
              !isFinalStatus &&
              profile?.installments_info && (
                <div className="installments-div">
                  {profile.installments_info.map((inst) => {
                    let color;
                    switch (inst.tag) {
                      case "verified":
                        color = "#047857"; // green
                        break;
                      case "rejected":
                        color = "#b91c1c"; // red
                        break;
                      case "verification pending":
                        color = "#ca8a04"; // amber
                        break;
                      default:
                        color = "#dc2626"; // red (due)
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
          </div>
        </div>
        {!isEligibilityCard &&
          !hasSelectableInstallments &&
          ["refunded", "cancelled"].includes(registrationStatus) && (
            <p
              style={{
                fontSize: "13px",
                color: "#333",
                marginTop: "15px",
                textAlign: "center",
                lineHeight: "20px",
              }}
            >
              Refund Amount:&nbsp;
              <strong style={{ color: "#047857", fontSize: "15px" }}>
                ₹{Number(amountPaid) - Number(yatra.cancellation_fee)}
              </strong>
              <br />
              <span style={{ color: "#047857", fontSize: "12px" }}>
                ₹{amountPaid} (Yatra Charges Paid) - ₹{yatra.cancellation_fee}{" "}
                (Cancellation Fee)
              </span>
              <br />
              <br />
              Refund Status:&nbsp;{" "}
              <strong>
                {registrationStatus === "cancelled" ? "Pending" : "Completed"}
              </strong>
              <br />
              {registrationStatus === "cancelled" && (
                <span style={{ fontSize: "12px", color: "#333" }}>
                  Yatra Team will contact you to proceed with the refund.
                </span>
              )}
            </p>
          )}

        {!isEligibilityCard && !hasSelectableInstallments && !isFinalStatus && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "10px",
            }}
          >
            <button
              onClick={() => toggleSelect(profile)}
              className={`action-btn ${hasExistingData ? "edit" : "open"}`}
              style={{
                minWidth: "80px",
                maxHeight: "35px",
                color: "black",
                backgroundColor: "white",
              }}
              disabled={isLoadingRegistration}
            >
              {getButtonText()}
            </button>

            {registrationStatus === "paid" && (
              // {registrationStatus && (
              <>
                <button
                  onClick={() => setOpenInfoModal(true)}
                  className="action-btn"
                  style={{
                    maxWidth: "fit-content",
                    color: "black",
                    backgroundColor: "white",
                  }}
                >
                  Travel Info
                </button>
                {yatra.is_rcs_download_open && (
                  <button
                    className="action-btn"
                    style={{
                      maxWidth: "fit-content",
                      color: "black",
                      backgroundColor: "white",
                    }}
                    onClick={() => generateRCS(profile, yatra)}
                  >
                    Print RCS
                  </button>
                )}
              </>
            )}
            {["paid", "partial"].includes(registrationStatus) && (
              <>
                {(yatra.is_substitution_open || yatra.is_cancellation_open) && (
                  <MoreActionsMenu
                    onSubstitute={() => {
                      console.log(
                        "Open substitution modal for",
                        profile.first_name
                      );
                      setOpenSubstitutionModal(true);
                    }}
                    onCancellation={() => {
                      console.log(
                        "Open cancellation modal for",
                        profile.first_name
                      );
                      setOpenCancellationModal(true);
                    }}
                    yatra={yatra}
                  />
                )}
              </>
            )}
          </div>
        )}

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

      <Modal open={openInfoModal} onClose={() => setOpenInfoModal(false)}>
        <AccomodationTravelInfo profile={profile} />
      </Modal>
      <Modal
        open={openSubstitutionModal}
        onClose={() => setOpenSubstitutionModal(false)}
      >
        <InitiateSubstitutionModal
          registrationId={profile.registration_id}
          yatra={yatra}
        />
      </Modal>
      <Modal
        open={openCancellationModal}
        onClose={() => setOpenCancellationModal(false)}
      >
        <CancellationModal
          profile_id={profile.id}
          installments={profile.installments_info}
          yatra={yatra}
          onSuccess={() => {
            setOpenCancellationModal(false);
            window.location.reload();
          }}
        />
      </Modal>
    </>
  );
};

export default WhatsAppCard;

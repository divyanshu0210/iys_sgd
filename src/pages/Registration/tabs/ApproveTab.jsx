// src/pages/components/ApproveTab.jsx
import { useState } from "react";
import { useYatraRegistration } from "../context/YatraRegistrationContext";
import WhatsAppCard from "../components/WhatsAppCard";
import FullPageLoader from "../../../components/FullPageLoader";
import "../../../css/bulkActions.css";
import "../../../css/profile.css";

const ApproveTab = () => {
  const { eligibilityData, loading, initialLoading, applyFilters, handleEligibility } = useYatraRegistration();
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // const approveList = eligibilityData.profiles || [];
  const approveList = applyFilters(eligibilityData.profiles || [], "approve");
  const selectableProfiles = approveList.filter((profile) => !profile.is_self);
  const toggleSelection = (id) => {
    const scrollY = window.scrollY;
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
    window.requestAnimationFrame(() => window.scrollTo(0, scrollY));
  };
  const handleBulk = async (action) => {
    const eligibleIds = approveList
      .filter((profile) => selectedIds.includes(profile.id || profile.profile_id))
      .filter((profile) => action === "approve" ? !profile.is_approved : profile.is_approved)
      .map((profile) => profile.id || profile.profile_id);

    if (!eligibleIds.length) {
      setSelectedIds([]);
      return;
    }

    setBulkLoading(true);
    try {
      await handleEligibility(eligibleIds, action);
      setSelectedIds([]);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="registration-tab-content has-fixed-bulk-actions">
      <p className="step-purpose-notice">Counsellor's Approval is needed to confirm that devotee is allowed to register & participate in the Yatra.</p>
      <div className="profile-requests-heading">
        <h3>Approve Devotees</h3>
      </div>

      {initialLoading ? (
        <FullPageLoader />
      ) : approveList.length === 0 ? (
        <p className="empty-msg">No devotees to approve.</p>
      ) : (
        <>
          <div className="whatsapp-list">
          {approveList.map((p) => (
            <WhatsAppCard
              key={p.profile_id}
              profile={p}
              isEligibilityCard={true}
              hideEligibilityActions={!p.is_self}
              loading={loading}
              selectable={!p.is_self}
              selected={selectedIds.includes(p.id || p.profile_id)}
              onSelect={() => toggleSelection(p.id || p.profile_id)}
            />
          ))}
          </div>
        </>
      )}

      {!initialLoading && selectedIds.length > 0 && (
        <div className="bulk-actions-bar fixed">
          <div className="bulk-selection-summary">
            <span>{selectedIds.length} selected</span>
            <label>
              <input
                type="checkbox"
                checked={selectedIds.length === selectableProfiles.length}
                onChange={(e) => setSelectedIds(e.target.checked ? selectableProfiles.map((p) => p.id || p.profile_id) : [])}
                onMouseDown={(event) => event.preventDefault()}
              /> All
            </label>
          </div>
          <div className="bulk-action-buttons">
            <button className="bulk-cancel" type="button" onClick={() => setSelectedIds([])}>Cancel</button>
            <button className="bulk-connect" type="button" disabled={!selectedIds.length || bulkLoading} onClick={() => handleBulk("approve")}>Approve</button>
            <button className="bulk-reject" type="button" disabled={!selectedIds.length || bulkLoading} onClick={() => handleBulk("unapprove")}>Unapprove</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveTab;

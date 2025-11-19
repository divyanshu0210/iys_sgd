// src/pages/components/ApproveTab.jsx
import { useYatraRegistration } from "../context/YatraRegistrationContext";
import WhatsAppCard from "../components/WhatsAppCard";
import FullPageLoader from "../../../components/FullPageLoader";

const ApproveTab = () => {
  const { eligibilityData,loading, initialLoading } = useYatraRegistration();

  const approveList = eligibilityData.profiles || [];

  return (
    <div className="tab-content">
      <h3>Approve Devotees</h3>

      {initialLoading ? (
        <FullPageLoader />
      ) : approveList.length === 0 ? (
        <p className="empty-msg">No devotees to approve.</p>
      ) : (
        <div className="whatsapp-list">
          {approveList.map((p) => (
            <WhatsAppCard
              key={p.profile_id}
              profile={p}
              isEligibilityCard={true}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ApproveTab;


import { useEffect } from "react";
import { useYatraRegistration } from "./context/YatraRegistrationContext";
import "../../css/members.css";

import Sidebar from "./components/Sidebar";
import AlertModal from "./components/AlertModal";
import ApproveTab from "./tabs/ApproveTab";
import NewRegistrationTab from "./tabs/NewRegistrationTab";
import RegisteredTab from "./tabs/RegisteredTab";

export default function YatraRegister() {
  const {
    yatra_id,
    activeTab,
    showModal,
    modalMessage,
    setShowModal,
    fetchRegistrationData,
    fetchEligibilityData,
    registerData,
    eligibilityData
  } = useYatraRegistration();

  // Fetch data on mount and tab change
  useEffect(() => {
    fetchRegistrationData();
    
    if (activeTab === "approve") {
      fetchEligibilityData();
    }
  }, [yatra_id, activeTab]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "registered":
        return <RegisteredTab />;
      case "approve":
        return <ApproveTab />;
      case "newReg":
        return <NewRegistrationTab />;
      default:
        return <RegisteredTab />;
    }
  };

  return (
    <div className="profile-page">
      <Sidebar />
      
      <div className="profile-content">
        {renderActiveTab()}
      </div>

      <AlertModal 
        show={showModal}
        message={modalMessage}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
import { useEffect } from "react";
import { useYatraRegistration } from "./context/YatraRegistrationContext";
import "../../css/members.css";

import Sidebar from "./components/Sidebar";
import AlertModal from "./components/AlertModal";
import ApproveTab from "./tabs/ApproveTab";
import NewRegistrationTab from "./tabs/NewRegistrationTab";
import RegisteredTab from "./tabs/RegisteredTab";
import { useAuth } from "../../context/AuthContext";
import ProfileSearchBar from "./components/ProfileSearchBar";
import YatraRegistrationStatusFilter from "./components/YatraRegistrationStatusFilter";

export default function YatraRegister() {
  const {
    yatra_id,
    activeTab,
    showModal,
    modalMessage,
    setShowModal,
    fetchRegistrationData,
    fetchEligibilityData,
    setInitialLoading,
    currentStep,
    registerData,
    eligibilityData,
  } = useYatraRegistration();

  const { profile } = useAuth();

  useEffect(() => {
    if (profile == null) return;
    const loadAll = async () => {
      setInitialLoading(true);

      try {
        await Promise.all([fetchRegistrationData(), fetchEligibilityData()]);
      } catch (e) {
        console.error(e);
      }

      setInitialLoading(false);
    };

    loadAll();
  }, [yatra_id, profile]);

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
        <div className="search-and-filter">
          <ProfileSearchBar />
          <YatraRegistrationStatusFilter activeTab={activeTab} />
        </div>
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

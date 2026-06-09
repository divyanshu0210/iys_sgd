import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
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

// ── Step status helpers ──────────────────────────────────────────
function useStepStatus() {
  const { eligibilityData, registerData } = useYatraRegistration();
  const eligible   = eligibilityData.profiles || [];
  const registered = registerData.profiles    || [];

  const requiresApproval = eligibilityData.yatra?.requires_approval ?? true;

  const pendingApproval      = eligible.filter(p => !p.is_approved).length;
  const approvedCount        = eligible.filter(p => p.is_approved).length;
  const approvedNotReg       = registered.filter(p => p.is_eligible && !p.is_registered).length;
  const registeredCount      = registered.filter(p => p.is_registered).length;

  const hasYatraProfiles = approvedCount > 0 || approvedNotReg > 0 || registeredCount > 0;
  const step1 = pendingApproval === 0 && hasYatraProfiles ? "completed" : "active";
  const step2 = approvedNotReg === 0 && registeredCount > 0 ? "completed"
              : approvedNotReg > 0 || approvedCount > 0     ? "active"
              :                                               "pending";
  const step3 = registeredCount > 0 ? "active" : "pending";

  const allSteps = [
    { id: "approve",    label: "Approve",  sublabel: "Review members",    status: step1, badge: pendingApproval  },
    { id: "newReg",     label: "Register", sublabel: "Register approved", status: step2, badge: approvedNotReg  },
    { id: "registered", label: "Status",   sublabel: "Monitor payments",  status: step3, badge: registeredCount },
  ];

  return {
    requiresApproval,
    steps: requiresApproval ? allSteps : allSteps.filter(s => s.id !== "approve"),
  };
}

// ── Stepper component ────────────────────────────────────────────
function RegistrationStepper() {
  const { activeTab, setActiveTab } = useYatraRegistration();
  const { steps } = useStepStatus();

  const circleStyle = (step) => ({
    width: 34, height: 34, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 14, flexShrink: 0,
    background: activeTab === step.id ? "#0ea5e9"
              : step.status === "completed" ? "#10b981"
              : "#e2e8f0",
    color: activeTab === step.id || step.status === "completed" ? "#fff" : "#94a3b8",
    boxShadow: activeTab === step.id ? "0 0 0 3px rgba(14,165,233,0.2)" : "none",
    transition: "all 0.2s",
  });

  const connectorStyle = (step) => ({
    flex: 1, height: 2, margin: "0 6px",
    marginBottom: 20,
    background: step.status === "completed" ? "#10b981" : "#e2e8f0",
    transition: "background 0.3s",
  });

  return (
    <div style={{
      display: "flex", alignItems: "center",
      background: "#fff", borderRadius: 12,
      padding: "12px 20px", marginBottom: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}>
      {steps.map((step, i) => (
        <div key={step.id} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? "1 1 0" : "none" }}>
          {/* Step node */}
          <div
            onClick={() => setActiveTab(step.id)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer",
              opacity: step.status === "pending" ? 0.5 : 1 }}
          >
            <div style={circleStyle(step)}>
              {step.status === "completed" ? <Check size={15} strokeWidth={2.5} /> : i + 1}
            </div>
            <span style={{
              fontSize: "0.72rem", marginTop: 4, whiteSpace: "nowrap",
              fontWeight: activeTab === step.id ? 700 : 500,
              color: activeTab === step.id ? "#0ea5e9" : "#475569",
            }}>
              {step.label}
            </span>
            {step.badge > 0 && (
              <span style={{ fontSize: "0.62rem", color: "#94a3b8", marginTop: 1 }}>
                {step.badge} {step.status === "completed" ? "done" : "pending"}
              </span>
            )}
          </div>
          {/* Connector line */}
          {i < steps.length - 1 && <div style={connectorStyle(step)} />}
        </div>
      ))}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function YatraRegister() {
  const {
    yatra_id, activeTab, showModal, modalMessage, setShowModal,
    fetchRegistrationData, fetchEligibilityData, setInitialLoading,
    registerData, eligibilityData, setActiveTab,
  } = useYatraRegistration();

  const { profile } = useAuth();
  const defaultSet = useRef(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    if (profile == null) return;
    defaultSet.current = false;
    setInitialDataLoaded(false);

    const loadAll = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([fetchRegistrationData(), fetchEligibilityData()]);
      } catch (e) {
        console.error(e);
      } finally {
        setInitialLoading(false);
        setInitialDataLoaded(true);
      }
    };
    loadAll();
  }, [yatra_id, profile]);

  // Smart default — runs once after initial data load
  useEffect(() => {
    if (defaultSet.current) return;
    if (!initialDataLoaded) return;

    const eligible    = eligibilityData.profiles || [];
    const registered  = registerData.profiles    || [];
    const requiresApproval = eligibilityData.yatra?.requires_approval ?? true;

    defaultSet.current = true;

    const pendingApproval = eligible.filter(p => !p.is_approved).length;
    const approvedNotReg  = registered.filter(p => p.is_eligible && !p.is_registered).length;
    const registeredCount = registered.filter(p => p.is_registered).length;

    // Action-oriented: land where work is needed most
    if (approvedNotReg > 0)                        setActiveTab("newReg");
    else if (pendingApproval > 0 && requiresApproval) setActiveTab("approve");
    else if (registeredCount > 0)                  setActiveTab("registered");
    else                                           setActiveTab(requiresApproval ? "approve" : "newReg");
  }, [initialDataLoaded, eligibilityData, registerData, setActiveTab]);

  const requiresApproval = eligibilityData.yatra?.requires_approval ?? true;

  const renderActiveTab = () => {
    switch (activeTab) {
      case "registered": return <RegisteredTab />;
      case "approve":    return requiresApproval ? <ApproveTab /> : <NewRegistrationTab />;
      case "newReg":     return <NewRegistrationTab />;
      default:           return requiresApproval ? <ApproveTab /> : <NewRegistrationTab />;
    }
  };

  return (
    <div className="profile-page">
      <Sidebar />
      <div className="profile-content">
        <RegistrationStepper />
        <div className="search-and-filter">
          <ProfileSearchBar />
          <YatraRegistrationStatusFilter activeTab={activeTab} />
        </div>
        {renderActiveTab()}
      </div>

      <AlertModal show={showModal} message={modalMessage} onClose={() => setShowModal(false)} />
    </div>
  );
}

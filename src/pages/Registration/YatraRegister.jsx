import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { useYatraRegistration } from "./context/YatraRegistrationContext";
import "../../css/registration.css";

import Sidebar from "./components/Sidebar";
import AlertModal from "./components/AlertModal";
import ApproveTab from "./tabs/ApproveTab";
import NewRegistrationTab from "./tabs/NewRegistrationTab";
import RegisteredTab from "./tabs/RegisteredTab";
import { useAuth } from "../../context/AuthContext";
import ProfileSearchBar from "./components/ProfileSearchBar";
import YatraRegistrationStatusFilter from "./components/YatraRegistrationStatusFilter";
import BasicProfile from "../Profile/BasicProfile";
import API from "../../services/api";
import FullPageLoader from "../../components/FullPageLoader.jsx";

function getBulkActionSummary(actionResult) {
  const uniqueUpdated = new Set(
    (actionResult.updated || []).map((item) => item.profile_id)
  );
  const registrationFailures = (actionResult.errors || []).filter((error) =>
    /already registered|registration has (already )?started/i.test(error)
  ).length;
  const otherFailures = (actionResult.errors || []).length - registrationFailures;
  const updatedLabel = actionResult.action === "approve" ? "approved" : "unapproved";
  const skippedLabel =
    actionResult.action === "approve" ? "already approved" : "already unapproved";

  return [
    uniqueUpdated.size && `${uniqueUpdated.size} ${updatedLabel}`,
    actionResult.skippedCount && `${actionResult.skippedCount} ${skippedLabel}`,
    registrationFailures && `${registrationFailures} failed (registration started)`,
    otherFailures && `${otherFailures} failed`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ── Step status helpers ──────────────────────────────────────────
function useStepStatus(profileStepActive, profilePendingCount, ownProfileNeedsCompletion) {
  const { eligibilityData, registerData } = useYatraRegistration();
  const { profileStage } = useAuth();
  const isReviewer = profileStage === "mentor" || profileStage === "counsellor";
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
    {
      id: "profile",
      label: "Profile",
      sublabel: "Complete profile",
      status: profileStepActive ? "active" : "completed",
      badge: profilePendingCount,
    },
    { id: "approve",    label: "Approve",  sublabel: "Review members",    status: step1, badge: isReviewer && !ownProfileNeedsCompletion ? pendingApproval : 0  },
    { id: "newReg",     label: "Register", sublabel: "Register approved", status: step2, badge: isReviewer ? approvedNotReg : 0  },
    { id: "registered", label: "Status",   sublabel: "Monitor payments",  status: step3, badge: isReviewer ? registeredCount : 0 },
  ];

  return {
    requiresApproval,
    steps: requiresApproval || profileStage === "mentor" || profileStage === "counsellor"
      ? allSteps
      : allSteps.filter(s => s.id !== "approve"),
  };
}

// ── Stepper component ────────────────────────────────────────────
function RegistrationStepper({ profileStepActive, profilePendingCount, ownProfileNeedsCompletion, lockOtherSteps, initializing }) {
  const { activeTab, setActiveTab } = useYatraRegistration();
  const { steps } = useStepStatus(profileStepActive, profilePendingCount, ownProfileNeedsCompletion);

  const circleStyle = (step) => ({
    width: 34, height: 34, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 14, flexShrink: 0,
    background: initializing ? "#e2e8f0" : activeTab === step.id ? "#0ea5e9"
              : step.status === "completed" ? "#10b981"
              : "#e2e8f0",
    color: !initializing && (activeTab === step.id || step.status === "completed") ? "#fff" : "#94a3b8",
    boxShadow: !initializing && activeTab === step.id ? "0 0 0 3px rgba(14,165,233,0.2)" : "none",
    transition: "all 0.2s",
  });

  const connectorStyle = (step) => ({
    flex: 1, height: 2, margin: "0 6px",
    marginBottom: 20,
    background: !initializing && step.status === "completed" ? "#10b981" : "#e2e8f0",
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
            onClick={() => {
              if (initializing) return;
              if (step.id !== "profile" && step.status === "pending") return;
              if (step.id !== "profile" && lockOtherSteps) return;
              setActiveTab(step.id);
            }}
            aria-disabled={step.id !== "profile" && lockOtherSteps}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: step.status === "pending" || (step.id !== "profile" && lockOtherSteps) ? "default" : "pointer",
              opacity: step.status === "pending" || (step.id !== "profile" && lockOtherSteps) ? 0.5 : 1 }}
          >
            <div style={circleStyle(step)}>
              {!initializing && step.status === "completed" ? <Check size={15} strokeWidth={2.5} /> : i + 1}
            </div>
            <span style={{
              fontSize: "0.72rem", marginTop: 4, whiteSpace: "nowrap",
              fontWeight: !initializing && activeTab === step.id ? 700 : 500,
              color: initializing ? "#94a3b8" : activeTab === step.id ? "#0ea5e9" : (step.id !== "profile" && lockOtherSteps ? "#94a3b8" : "#475569"),
            }}>
              {step.label}
            </span>
            {!initializing && step.badge > 0 && (
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
    fetchYatraData, fetchRegistrationData, fetchEligibilityData, setInitialLoading,
    registerData, eligibilityData, setActiveTab,
    statusFilter,
    loading: actionLoading,
  } = useYatraRegistration();

  const { profile, profileStage, loading: authLoading } = useAuth();
  const defaultSet = useRef(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [profileRequestsLoaded, setProfileRequestsLoaded] = useState(false);
  const [initialTabResolved, setInitialTabResolved] = useState(false);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [profileRequests, setProfileRequests] = useState([]);
  const [actionResult, setActionResult] = useState(null);

  useEffect(() => {
    const isReviewer = profile?.user_type === "mentor" || profile?.user_type === "counsellor";
    if (!isReviewer) {
      setPendingReviewCount(0);
      setProfileRequestsLoaded(true);
      return undefined;
    }

    let cancelled = false;
    setProfileRequestsLoaded(false);
    API.get("/api/mentor/requests/")
      .then((res) => {
        if (!cancelled) {
          const requests = res.data?.pending_requests || [];
          setProfileRequests(requests);
          setPendingReviewCount(requests.length);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProfileRequests([]);
          setPendingReviewCount(0);
        }
      })
      .finally(() => {
        if (!cancelled) setProfileRequestsLoaded(true);
      });
    return () => { cancelled = true; };
  }, [profile?.user_type]);

  const ownProfileNeedsCompletion =
    profileStage === "not-exists" ||
    profile?.profile_verification_status !== "verified";
  const profileStepActive = ownProfileNeedsCompletion || pendingReviewCount > 0;
  const isReviewer = profileStage === "mentor" || profileStage === "counsellor";
  const lockOtherSteps = ownProfileNeedsCompletion;

  useEffect(() => {
    if (!yatra_id) return;
    defaultSet.current = false;
    setInitialDataLoaded(false);
    setInitialTabResolved(false);

    const loadAll = async () => {
      setInitialLoading(true);
      fetchYatraData();
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
  }, [yatra_id]);

  // Smart default — runs once after initial data load
  useEffect(() => {
    if (authLoading || !profileRequestsLoaded) return;

    if (profileStepActive) {
      defaultSet.current = true;
      setActiveTab("profile");
      setInitialTabResolved(true);
      return;
    }
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
    if (approvedNotReg > 0) setActiveTab("newReg");
    else if (pendingApproval > 0 && requiresApproval) setActiveTab("approve");
    else if (registeredCount > 0) setActiveTab("registered");
    else setActiveTab(requiresApproval ? "approve" : "newReg");
    setInitialTabResolved(true);
  }, [
    initialDataLoaded,
    profileRequestsLoaded,
    authLoading,
    eligibilityData,
    registerData,
    profileStage,
    profileStepActive,
    setActiveTab,
  ]);

  const requiresApproval = eligibilityData.yatra?.requires_approval ?? true;
  const initialising = !initialTabResolved;
  const activeActionKey = Object.keys(actionLoading).find(
    (key) => actionLoading[key]
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "profile":
        return (
          <BasicProfile
            onComplete={() => setActiveTab(requiresApproval ? "approve" : "newReg")}
            requestCenterFilter={statusFilter}
            initialReviewRequests={profileRequests}
          />
        );
      case "registered": return <RegisteredTab />;
      case "approve":    return requiresApproval || isReviewer ? <ApproveTab onActionResult={setActionResult} /> : <NewRegistrationTab />;
      case "newReg":     return <NewRegistrationTab />;
      default:           return requiresApproval ? <ApproveTab onActionResult={setActionResult} /> : <NewRegistrationTab />;
    }
  };

  return (
    <div className="registration-page">
      {initialising && <FullPageLoader />}
      <Sidebar />
      <div className="registration-content">
        <RegistrationStepper
          profileStepActive={profileStepActive}
          profilePendingCount={pendingReviewCount}
          ownProfileNeedsCompletion={ownProfileNeedsCompletion}
          lockOtherSteps={lockOtherSteps}
          initializing={initialising}
        />
        {!initialising && isReviewer && (
          <div className="search-and-filter">
            <ProfileSearchBar />
            <YatraRegistrationStatusFilter
              activeTab={activeTab}
              profileRequests={profileRequests}
            />
          </div>
        )}
        {!initialising && renderActiveTab()}
      </div>

      <AlertModal show={showModal} message={modalMessage} onClose={() => setShowModal(false)} />
      <AlertModal
        show={Boolean(actionResult)}
        message={actionResult ? getBulkActionSummary(actionResult) : ""}
        title={
          actionResult?.action === "approve"
            ? "Bulk Approval Summary"
            : "Bulk Unapproval Summary"
        }
        onClose={() => setActionResult(null)}
      />
      {activeActionKey && <FullPageLoader />}
    </div>
  );
}

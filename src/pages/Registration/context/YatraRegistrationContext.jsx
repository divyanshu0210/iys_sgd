// src/context/YatraRegistrationContext.jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import API from "../../../services/api";
import { getApiErrorMessages } from "../../../utils/apiErrors";
import { useAuth } from "../../../context/AuthContext";

const YatraRegistrationContext = createContext();

export const useYatraRegistration = () => {
  const context = useContext(YatraRegistrationContext);
  if (!context) {
    throw new Error(
      "useYatraRegistration must be used within YatraRegistrationProvider"
    );
  }
  return context;
};

export const STORAGE_KEY = "yatra_checkout_session";

export const YatraRegistrationProvider = ({ children }) => {
  const { yatra_id } = useParams();
  const { profile, profileStage } = useAuth();
  const location = useLocation();

  //Local storage management
  console.log("From yatra context");
  const [registerData, setRegisterData] = useState({ profiles: [], yatra: {} });
  const [eligibilityData, setEligibilityData] = useState({ profiles: [] });
  const [activeTab, setActiveTab] = useState(
    profileStage === "not-exists" ? "profile" : "approve"
  );

  // Keep the tab state itself aligned with the user's profile status. This
  // avoids relying on a display-only override in the page component while
  // the authenticated profile is still being resolved.
  const profileNeedsVerification =
    profileStage === "not-exists" ||
    profile?.profile_verification_status !== "verified";

  useEffect(() => {
    if (profileNeedsVerification) {
      setActiveTab("profile");
    }
  }, [profileNeedsVerification]);
  const [currentStep, setCurrentStep] = useState(1);

  const [selected, setSelected] = useState([]);
  const [registrations, setRegistrations] = useState({});

  const [loading, setLoading] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yatraData, setYatraData] = useState(location.state?.yatra || {});

  // Prefer the Yatra returned by the registration endpoint. Navigation state
  // is only an initial snapshot and disappears on refresh or may be stale
  // after an admin updates phases/installments.
  const yatra = registerData.yatra?.id
    ? registerData.yatra
    : yatraData;

  // Load the lightweight Yatra details independently so the sidebar can be
  // populated while the heavier registration/profile request is still running.
  const fetchYatraData = async () => {
    try {
      const response = await API.get("/yatra/list/");
      const currentYatra = response.data.find(
        (item) => String(item.id) === String(yatra_id)
      );
      if (currentYatra) setYatraData(currentYatra);
    } catch (err) {
      console.error("Failed to load yatra details", err);
    }
  };

  // Fetch registration data
  const fetchRegistrationData = async (loading = false) => {
    loading && setInitialLoading(true);
    try {
      console.log("Fetching registration data for yatra_id:", yatra_id);
      const regRes = await API.get(`/yatras/${yatra_id}/register/`);
      setRegisterData(regRes.data);
    } catch (err) {
      console.error("Failed to load registration data", err);
      // alert("Failed to load resister data");
    } finally {
      loading && setInitialLoading(false);
    }
  };

  // Fetch eligibility data
  const fetchEligibilityData = async () => {
    try {
      console.log("Fetching eligibility data for yatra_id:", yatra_id);
      const res = await API.get(`/yatras/${yatra_id}/eligibility/`);
      setEligibilityData(res.data);
    } catch (err) {
      console.error("Failed to load eligibility data", err);
    }
  };

  // Helper functions
  const getInstallmentAmount = (label, installmentList) => {
    const source = installmentList || (yatra || registerData.yatra)?.installments || [];
    const inst = source.find(
      (i) => i.label === label
    );
    return inst ? parseFloat(inst.amount) : 0;
  };

  const computeTotalDueForProfile = (profile) => {
    const reg = registrations[profile.id];
    if (!reg || !reg.installments_details) return 0;
    return reg.installments_details
      .filter((i) => !i.is_paid)
      .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  };

  const hasPaidInstallments = (profile) => {
    const reg = registrations[profile.id];
    return reg && reg.installments_paid?.length > 0;
  };

  const handleEligibility = async (
    profileId,
    action,
    { suppressAlert = false } = {}
  ) => {
    const profileIds = Array.isArray(profileId) ? profileId : [profileId];
    const key = `${profileIds.join(",")}-${action}`;
    setLoading((prev) => ({ ...prev, [key]: true }));

    const refreshEligibilityData = async () => {
      const [eligibilityResponse, registrationResponse] = await Promise.all([
        API.get(`/yatras/${yatra_id}/eligibility/`),
        API.get(`/yatras/${yatra_id}/register/`),
      ]);
      setEligibilityData(eligibilityResponse.data);
      setRegisterData(registrationResponse.data);
    };

    const getErrors = (error) => getApiErrorMessages(error, `Failed to ${action}`);
    try {
      const response = await API.post(`/yatras/${yatra_id}/eligibility/`, {
        profile_ids: profileIds,
        action,
      });
      await refreshEligibilityData();
      const result = response.data || { updated: [], errors: [] };
      if (!suppressAlert && result.errors?.length) {
        alert(result.errors.join("\n"));
      }
      return result;
    } catch (err) {
      const result = {
        ...(err.response?.data || {}),
        updated: err.response?.data?.updated || [],
        errors: getErrors(err),
      };

      try {
        await refreshEligibilityData();
      } catch (refreshError) {
        console.error("Failed to refresh eligibility data", refreshError);
      }

      if (!suppressAlert) alert(result.errors.join("\n"));
      return result;
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Request approval for self
  const requestApproval = async () => {
    setLoading((prev) => ({ ...prev, selfRequest: true }));
    try {
      await API.post(`/yatras/${yatra_id}/eligibility/`, {
        profile_ids: [profile.id],
        action: "request_approval",
      });
      alert("Approval request sent to your counsellor!");
      const res = await API.get(`/yatras/${yatra_id}/eligibility/`);
      setEligibilityData(res.data);
    } catch (err) {
      alert(getApiErrorMessages(err, "Failed to send request").join("\n"));
    } finally {
      setLoading((prev) => ({ ...prev, selfRequest: false }));
    }
  };

  // Filter profiles based on search query and status
  const applyFilters = (profiles = [], activeTab) => {
    let filtered = profiles;

    // 🔍 Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();

      filtered = filtered.filter((p) =>
        [
          p.full_name,
          p.first_name,
          p.last_name,
          p.initiated_name,
          p.mobile,
          p.email,
          String(p.member_id),
        ]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(q))
      );
    }

    // 🏷 Status filter
    if (statusFilter !== "all") {
      if (activeTab === "approve") {
        filtered =
          statusFilter === "approved"
            ? filtered.filter((p) => p.is_approved)
            : filtered.filter((p) => !p.is_approved);
      } else {
        filtered = filtered.filter(
          (p) => p.registration_status === statusFilter
        );
      }
    }

    return filtered;
  };

  const getStatusCounts = (activeTab) => {
    let profiles =
      activeTab === "approve"
        ? eligibilityData.profiles || []
        : registerData.profiles || [];

    // profiles = applyFilters(profiles,activeTab);
    if (activeTab === "registered") {
      profiles = profiles.filter((p) => p.is_registered);
    } else if (activeTab === "newReg") {
      profiles = profiles.filter((p) => p.is_eligible && !p.is_registered);
    }

        if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();

      profiles = profiles.filter((p) =>
        [
          p.full_name,
          p.initiated_name,
          p.first_name,
          p.last_name,
          p.mobile,
          p.email,
          String(p.member_id),
        ]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(q))
      );
    }

    const counts = { all: profiles.length };

    if (activeTab === "approve") {
      counts["approved"] = profiles.filter((p) => p.is_approved).length;
      counts["not_approved"] = profiles.filter((p) => !p.is_approved).length;
    } else {
      profiles.forEach((p) => {
        const status = p.registration_status || "pending";
        counts[status] = (counts[status] || 0) + 1;
      });
    }

    return counts;
  };

  const value = {
    yatra_id,
    profile,
    yatra,
    registerData,
    eligibilityData,
    fetchYatraData,
    selected,
    registrations,
    activeTab,
    loading,
    showModal,
    modalMessage,
    setRegisterData,
    setEligibilityData,
    setSelected,
    setRegistrations,
    setActiveTab,
    setLoading,
    setShowModal,
    setModalMessage,
    fetchRegistrationData,
    fetchEligibilityData,
    getInstallmentAmount,
    computeTotalDueForProfile,
    hasPaidInstallments,
    handleEligibility,
    requestApproval,
    showForm,
    setShowForm,
    initialLoading,
    setInitialLoading,
    currentStep,
    setCurrentStep,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    applyFilters,
    getStatusCounts,
  };

  return (
    <YatraRegistrationContext.Provider value={value}>
      {children}
    </YatraRegistrationContext.Provider>
  );
};

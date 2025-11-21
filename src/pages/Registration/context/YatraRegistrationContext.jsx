// src/context/YatraRegistrationContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import API from "../../../services/api";
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
  const { profile } = useAuth();
  const location = useLocation();

  //Local storage management
  console.log("From yatra context");
  const [registerData, setRegisterData] = useState({ profiles: [], yatra: {} });
  const [eligibilityData, setEligibilityData] = useState({ profiles: [] });
  const [activeTab, setActiveTab] = useState("registered");
  const [currentStep, setCurrentStep] = useState(1);
  
  const [selected, setSelected] = useState([]);
  const [registrations, setRegistrations] = useState({});

  const [loading, setLoading] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const yatra = location.state?.yatra || registerData.yatra;



  // Fetch registration data
  const fetchRegistrationData = async (loading = false) => {
    loading && setInitialLoading(true);
    try {
      console.log("Fetching registration data for yatra_id:", yatra_id);
      const regRes = await API.get(`/yatras/${yatra_id}/register/`);
      setRegisterData(regRes.data);
    } catch (err) {
      console.error("Failed to load registration data", err);
      alert("Failed to load resister data");
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
  const getInstallmentAmount = (label) => {
    const inst = (yatra || registerData.yatra)?.installments?.find(
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

  const handleEligibility = async (profileId, action) => {
    const key = `${profileId}-${action}`;
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      if (action === "unapprove" && registrations[profileId]) {
        alert(
          "Cannot unapprove — this profile has already started registration or registered."
        );
        return;
      }
      await API.post(`/yatras/${yatra_id}/eligibility/`, {
        profile_ids: [profileId],
        action,
      });
      const [res1, res2] = await Promise.all([
        API.get(`/yatras/${yatra_id}/eligibility/`),
        API.get(`/yatras/${yatra_id}/register/`),
      ]);
      setEligibilityData(res1.data);
      setRegisterData(res2.data);
    } catch (err) {
      alert(err.response?.data?.errors?.[0] || `Failed to ${action}`);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Request approval for self
  const requestApproval = async () => {
    setLoading((prev) => ({ ...prev, selfRequest: true }));
    try {
      if (registrations[profile.id]) {
        alert(
          "Cannot unapprove — this profile has already started registration or registered."
        );
        return;
      }
      await API.post(`/yatras/${yatra_id}/eligibility/`, {
        profile_ids: [profile.id],
        action: "request_approval",
      });
      alert("Approval request sent to your mentor!");
      const res = await API.get(`/yatras/${yatra_id}/eligibility/`);
      setEligibilityData(res.data);
    } catch (err) {
      alert(err.response?.data?.errors?.[0] || "Failed to send request");
    } finally {
      setLoading((prev) => ({ ...prev, selfRequest: false }));
    }
  };

  const value = {
    yatra_id,
    profile,
    yatra,
    registerData,
    eligibilityData,
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
  };

  return (
    <YatraRegistrationContext.Provider value={value}>
      {children}
    </YatraRegistrationContext.Provider>
  );
};

// src/pages/components/RegistrationTab.jsx
import { useState } from "react";
import { useYatraRegistration } from "../context/YatraRegistrationContext";
import WhatsAppCard from "../components/WhatsAppCard";
import ReviewStep from "../steps/ReviewStep";
import CheckoutStep from "../steps/CheckoutStep";
import "../css/registrationTab.css";
import FullPageLoader from "../../../components/FullPageLoader";

const RegistrationTab = ({ title, note, filterFn, showBanner = false }) => {
  const { registerData, selected,loading, initialLoading ,currentStep, setCurrentStep} = useYatraRegistration();

  const profiles = registerData.profiles?.filter(filterFn) || [];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            {showBanner && (
              <div className="rt-banner">
                <strong>Note:</strong> Registration will be complete after
                payment & verification of all installments.
              </div>
            )}
            <h3>{title}</h3>
            {note && <p className="info-text">{note}</p>}

            {initialLoading ? (
               <FullPageLoader/>
            ) : profiles.length === 0 ? (
              <p className="empty-msg">No profiles available.</p>
            ) : (
              <div className="whatsapp-list">
                {profiles.map((p) => (
                  <WhatsAppCard key={p.id} profile={p} />
                ))}
              </div>
            )}

            {selected.length > 0 && (
              <div className="step-actions fixed">
                <button onClick={() => setCurrentStep(2)} className="btn-next">
                  Review Details ({selected.length})
                </button>
              </div>
            )}
          </>
        );
      case 2:
        return (
          <ReviewStep
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        );
      case 3:
        return (
          <CheckoutStep
            setCurrentStep={setCurrentStep}
            onBack={() => setCurrentStep(2)}
          />
        );
      default:
        return null;
    }
  };

  return <div className="tab-content">{renderStep()}</div>;
};

export default RegistrationTab;

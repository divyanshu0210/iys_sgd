// src/pages/components/RegistrationTab.jsx
import { useYatraRegistration } from "../context/YatraRegistrationContext";
import WhatsAppCard from "../components/WhatsAppCard";
import ReviewStep from "../steps/ReviewStep";
import CheckoutStep from "../steps/CheckoutStep";
import "../css/registrationTab.css";
import FullPageLoader from "../../../components/FullPageLoader";
import SubstitutionRequests from "../Substitution/SubstitutionRequests";

const RegistrationTab = ({
  title,
  note,
  filterFn,
  showBanner = false,
  emptyMessage,
}) => {
  const {
    registerData,
    selected,
    loading,
    initialLoading,
    currentStep,
    setCurrentStep,
    setSelected,
    setRegistrations,
    applyFilters,
  } = useYatraRegistration();
  // const profiles = registerData.profiles?.filter(filterFn) || [];

  const profiles = applyFilters(registerData.profiles?.filter(filterFn)||[],"registered");

  const handleCancelSelection = () => {
    setSelected([]);
    setRegistrations({});
  };

  const defaultEmptyMessage = (
    <p className="empty-msg">
      <strong>No profiles to display yet.</strong>
      <br />
      <br />
      To see profiles listed here for the yatra, your counselor needs to review
      and <strong>approve</strong> them first.
      <br />
      <br />
      If you've submitted a profile, please wait for approval!
    </p>
  );

  const renderEmptyState = () => {
    if (profiles.length === 0 && initialLoading) {
      return <FullPageLoader />;
    }

    if (profiles.length === 0) {
      return emptyMessage ? (
        <div className="empty-msg">{emptyMessage}</div>
      ) : (
        defaultEmptyMessage
      );
    }

    return null;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            {showBanner && (
              <div className="rt-banner">
                <strong>1. </strong> Registration will be complete after payment
                & verification of all installments.
                <br />
                <strong>2. </strong>Accomodation and travel bookings will be
                made available only after full payment is received.
                <br />
              </div>
            )}
            <h3>{title}</h3>
            {note && <p className="info-text">{note}</p>}

            {renderEmptyState() || (
              <div className="whatsapp-list">
                {profiles.map((p) => (
                  <WhatsAppCard key={p.id} profile={p} loading={loading} />
                ))}

                {initialLoading && <FullPageLoader />}
              </div>
            )}

            {selected.length > 0 && (
              <div className="bulk-actions-bar fixed">
                <div className="bulk-selection-summary">
                  <span>{selected.length} selected</span>
                </div>
                <div className="bulk-action-buttons">
                  <button onClick={handleCancelSelection} className="bulk-cancel">Cancel</button>
                  <button onClick={() => setCurrentStep(2)} className="bulk-connect">Review Details</button>
                </div>
              </div>
            )}
          </>
        );
      case 2:
        return <ReviewStep />;
      case 3:
        return <CheckoutStep />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="registration-tab-content">{renderStep()}</div>
      <SubstitutionRequests />
    </>
  );
};

export default RegistrationTab;

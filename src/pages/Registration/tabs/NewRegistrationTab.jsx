import RegistrationTab from "./RegistrationTab";
import { useYatraRegistration } from "../context/YatraRegistrationContext";
import { useAuth } from "../../../context/AuthContext";

const NewRegistrationTab = () => {
  const { registerData, setActiveTab } = useYatraRegistration();
  const { profileStage } = useAuth();
  const isReviewer = profileStage === "mentor" || profileStage === "counsellor";
  const ownRegistrationStarted = !isReviewer &&
    (registerData.profiles || []).some((profile) => profile.is_self && profile.is_registered);

  return (
    <RegistrationTab
      title="Step 1: Select Devotees"
      note="Click Register to fill registration form."
      // filterFn={(p) => p.is_eligible }
      filterFn={(p) => p.is_eligible && !p.is_registered}
      showBanner={true}
      emptyMessage={
        ownRegistrationStarted ? (
          <div className="empty-msg">
            <strong>Your registration has already started.</strong>
            <p>View your registration and payment status in the Status tab.</p>
          </div>
        ) : (
        <p className="empty-msg">
          <strong>No profiles to display yet.</strong>
          {/* <br />
          <br />
        To start registration,<br/> a <strong>counselor needs to approve</strong> devotees first. */}
          <br />
          <br />
          Open <strong>Approve Devotees</strong> tab to review and request approval.
          <br />
          <br />
          If you've submitted a profile, please wait for approval!
        </p>
        )
      }
    />
  );
};

export default NewRegistrationTab;

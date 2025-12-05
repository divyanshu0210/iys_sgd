import RegistrationTab from "./RegistrationTab";

const NewRegistrationTab = () => {
  return (
    <RegistrationTab
      title="Step 1: Select Devotees"
      note="Click Register to fill registration form."
      // filterFn={(p) => p.is_eligible }
      filterFn={(p) => p.is_eligible && !p.is_registered}
      showBanner={true}
      emptyMessage={
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
      }
    />
  );
};

export default NewRegistrationTab;

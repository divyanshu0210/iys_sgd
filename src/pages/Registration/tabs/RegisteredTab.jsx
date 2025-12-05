import RegistrationTab from "./RegistrationTab";

const RegisteredTab = () => {
  return (
    <RegistrationTab
      title="List of Registered Devotees"
      filterFn={(p) => p.is_registered}
      showBanner={true}
      emptyMessage={
        <div className="empty-msg">
          <strong>No registered devotees yet</strong>
          <div
            style={{ marginTop: "1rem", lineHeight: "1.7", textAlign: "left" }}
          >
            <div>
              <strong>Step 1 →</strong> <strong>Approve Devotees</strong> tab →
              Review & Request approval
            </div>
            <div>
              <strong>Step 2 →</strong> <strong>New Registration</strong> tab →
              Start Registration for approved devotees
            </div>
            <div>
              <strong>Step 3 →</strong> <strong>Registered Devotees</strong> tab
              →Track Registration status here in{" "}
            </div>
          </div>
        </div>
      }
    />
  );
};

export default RegisteredTab;

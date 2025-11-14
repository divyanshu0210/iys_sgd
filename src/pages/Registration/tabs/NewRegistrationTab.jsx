
import RegistrationTab from "./RegistrationTab";

const NewRegistrationTab = () => {
  return (
    <RegistrationTab
      title="Step 1: Select Devotees"
      note="Click Register to fill registration form. Forms are disabled after payment."
      // filterFn={(p) => p.is_eligible }
      filterFn={(p) => p.is_eligible && !p.is_registered}
      showBanner={true}
    />
  );
};

export default NewRegistrationTab;



import RegistrationTab from "./RegistrationTab";

const RegisteredTab = () => {
  return (
    <RegistrationTab
      title="List of Registered Devotees"
      filterFn={(p) => p.is_registered}
      showBanner={true}
    />
  );
};

export default RegisteredTab;
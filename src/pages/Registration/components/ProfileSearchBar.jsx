import { useYatraRegistration } from "../context/YatraRegistrationContext";

const ProfileSearchBar = () => {
  const { searchQuery, setSearchQuery } = useYatraRegistration();

  return (
    <div style={{ flex:1}}>
      <input
        type="text"
        placeholder="Search by name, phone, email, member ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
       style={{ width: "100%" }}
      />
    </div>
  );
};

export default ProfileSearchBar;

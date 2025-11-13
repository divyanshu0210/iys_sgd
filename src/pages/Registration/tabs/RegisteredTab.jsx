// // src/pages/components/RegisteredTab.jsx
// import { useYatraRegistration } from "../context/YatraRegistrationContext";
// import WhatsAppCard from "../components/WhatsAppCard";

// const RegisteredTab = () => {
//   const { registerData } = useYatraRegistration();
  
//   const registered = registerData.profiles?.filter((p) => p.is_registered) || [];

//   return (
//     <div className="tab-content">
//       <h3>Already Registered</h3>
//       {registered.length === 0 ? (
//         <p className="empty-msg">No one registered yet.</p>
//       ) : (
//         <div className="whatsapp-list">
//           {registered.map((p) => (
//             <WhatsAppCard key={p.id} profile={p} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default RegisteredTab;

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
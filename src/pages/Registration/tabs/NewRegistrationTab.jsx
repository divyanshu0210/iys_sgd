// // src/pages/components/NewRegistrationTab.jsx
// import { useState } from "react";
// import { useYatraRegistration } from "../context/YatraRegistrationContext";
// import WhatsAppCard from "../components/WhatsAppCard";
// import ReviewStep from "../steps/ReviewStep";
// import CheckoutStep from "../steps/CheckoutStep";

import RegistrationTab from "./RegistrationTab";

// const NewRegistrationTab = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const { registerData, selected } = useYatraRegistration();

//   const eligibleForNewReg =
//     registerData.profiles?.filter((p) => p.is_eligible && !p.is_registered) ||
//     [];

//   const renderStep = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <>
//             <h3>Step 1: Select Devotees</h3>
//             <p className="info-text">
//               Click checkbox to fill registration form. Forms are disabled after
//               payment.
//             </p>
//             {eligibleForNewReg.length === 0 ? (
//               <p className="empty-msg">No approved devotees available.</p>
//             ) : (
//               <div className="whatsapp-list">
//                 {eligibleForNewReg.map((p) => (
//                   <WhatsAppCard key={p.id} profile={p} showCheckbox={true} />
//                 ))}
//               </div>
//             )}
//             {selected.length > 0 && (
//               <div className="step-actions fixed">
//                 <button onClick={() => setCurrentStep(2)} className="btn-next">
//                   Review Details ({selected.length})
//                 </button>
//               </div>
//             )}
//           </>
//         );
//       case 2:
//         return (
//           <ReviewStep
//             onBack={() => setCurrentStep(1)}
//             onNext={() => setCurrentStep(3)}
//           />
//         );
//       case 3:
//         return (
//           <CheckoutStep
//             setCurrentStep={setCurrentStep}
//             onBack={() => setCurrentStep(2)}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="tab-content">
//       {/* Top note */}
//       <div
//         style={{
//           background: "#fff7f7",
//           border: "1px solid #fecaca",
//           padding: "10px",
//           color: "#b91c1c",
//           marginBottom: "12px",
//           borderRadius: 6,
//         }}
//       >
//         <strong>Note:</strong> Registration will be complete after payment &
//         verification of all installments. Forms cannot be edited after payment
//         has been made.
//       </div>

//       {renderStep()}
//     </div>
//   );
// };

// export default NewRegistrationTab;
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

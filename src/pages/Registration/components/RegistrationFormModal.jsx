// // src/components/RegistrationFormModal.jsx
// import { useState } from "react";

// export default function RegistrationFormModal({
//   profile,
//   yatra,
//   onSave,
//   onClose,
// }) {
//   const [formData, setFormData] = useState({
//     // Default fields — will be overridden by yatra config
//     // accommodation: "",
//     // transport: "",
//     // food_preference: "",
//     // emergency_contact: "",
//     installment: "Full Payment (Rs 6500)",
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSave(profile.id, formData);
//     onClose();
//   };

//   // Dynamic fields from yatra config
//   const fields = yatra?.registration_fields || [];

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal form-modal" onClick={(e) => e.stopPropagation()}>
//         <h3>Register: {profile.full_name}</h3>
//         <form onSubmit={handleSubmit}>
//           {fields.map((field) => (
//             <div key={field.name} className="form-group">
//               <label>{field.label}</label>
//               {field.type === "select" ? (
//                 <select
//                   name={field.name}
//                   value={formData[field.name] || ""}
//                   onChange={handleChange}
//                   required={field.required}
//                 >
//                   <option value="">Select...</option>
//                   {field.options.map((opt) => (
//                     <option key={opt} value={opt}>
//                       {opt}
//                     </option>
//                   ))}
//                 </select>
//               ) : (
//                 <input
//                   type={field.type || "text"}
//                   name={field.name}
//                   value={formData[field.name] || ""}
//                   onChange={handleChange}
//                   required={field.required}
//                   placeholder={field.placeholder}
//                 />
//               )}
//             </div>
//           ))}

//           {/* Installment Dropdown */}
//           <div className="form-group">
//             <label>Payment Installment</label>
//             <select
//               name="installment"
//               value={formData.installment}
//               onChange={handleChange}
//               required
//             >
//               <option value="Full Payment (Rs 6500)">Full Payment (Rs 6500)</option>
//               <option value="1st Installment(Rs 3000)">1st Installment(Rs 3000)</option>
//             </select>
//           </div>

//           <div className="form-actions">
//             <button type="submit" className="btn-save">
//               Save & Select
//             </button>
//             <button type="button" onClick={onClose} className="btn-cancel">
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// src/components/RegistrationFormModal.jsx
import { useState } from "react";

export default function RegistrationFormModal({ profile, yatra, onSave, onClose }) {
  const [formData, setFormData] = useState({});
console.log('Yatra in Form Modal:', yatra);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(profile.id, formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal form-modal" onClick={e => e.stopPropagation()}>
        <h3>Register: {profile.full_name}</h3>
        <form onSubmit={handleSubmit}>
          {yatra.form_fields?.map(field => (
            <div key={field.name} className="form-group">
              <label>
                {field.label} {field.is_required && <span className="required">*</span>}
              </label>

              {field.field_type === 'select' ? (
                <select
                  name={field.name}
                  onChange={handleChange}
                  required={field.is_required}
                >
                  <option value="">Select...</option>
                  {field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.field_type === 'radio' ? (
                <div className="radio-group">
                  {field.options.map(opt => (
                    <label key={opt} className="radio-label">
                      <input
                        type="radio"
                        name={field.name}
                        value={opt}
                        onChange={handleChange}
                        required={field.is_required}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : field.field_type === 'checkbox' ? (
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name={field.name}
                    onChange={handleChange}
                  />
                  Yes
                </label>
              ) : (
                <input
                  type={field.field_type}
                  name={field.name}
                  onChange={handleChange}
                  required={field.is_required}
                  placeholder={field.label}
                />
              )}
            </div>
          ))}

          {/* Installment Dropdown */}
          <div className="form-group">
            <label>Payment Option <span className="required">*</span></label>
            <select name="installment" onChange={handleChange} required>
              <option value="">Select...</option>
              {yatra.installments?.map(inst => (
                <option key={inst.label} value={inst.label}>
                  {inst.label} (₹{inst.amount})
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save">Save & Select</button>
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React from "react";
import styles from "../../css/DonationForm.module.css";

export default function FormField({
  label,
  required = true,
  type ,
  value,
  onChange,
  placeholder = "",
  imageSrc = null, 
}) {
  return (
    <div className={styles.inputWithImage}>
      <label className={styles.formLabel}>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      {imageSrc && <img src={imageSrc} alt={`${label} icon`} className={styles.inputImage} />}


      <input
        type={type && type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={styles.formInput}
        autoComplete="off"
      />
    </div>
  );
}

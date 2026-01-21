import React from "react";
import styles from "../../css/DonationForm.module.css";
import { AccountDetail } from "./DonatePage";

export default function FormField({
  name,
  label,
  required = true,
  type,
  value,
  onChange,
  placeholder = "",
  imageSrc = null,
  accept = null,
}) {
  const isFile = type === "file";
  return (
    <div className={styles.inputWithImage}>
      {isFile && <AccountDetail />}
      <label className={styles.formLabel}>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={`${label} icon`}
          className={styles.inputImage}
        />
      )}

      <input
        name={name}
        type={type && type}
        {...(!isFile && { value })}
        onChange={onChange}
        placeholder={!isFile ? placeholder : undefined}
        required={required}
        className={styles.formInput}
        autoComplete="off"
        {...(accept && { accept })}
      />
    </div>
  );
}

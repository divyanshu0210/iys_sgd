import { useEffect, useState } from "react";

export const MAX_PROFILE_PHOTO_SIZE = 1 * 1024 * 1024;

export default function useProfileForm({ existingPhotoUrl = "" } = {}) {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(existingPhotoUrl || null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(existingPhotoUrl || null);
      return undefined;
    }

    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [existingPhotoUrl, photoFile]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (file && file.size > MAX_PROFILE_PHOTO_SIZE) {
      setPhotoFile(null);
      setErrors((current) => ({
        ...current,
        photo: "Photo must be 1 MB or smaller.",
      }));
      event.target.value = "";
      return null;
    }

    setErrors((current) => ({ ...current, photo: "" }));
    setPhotoFile(file);
    return file;
  };

  const removePhoto = (inputRef) => {
    setPhotoFile(null);
    setErrors((current) => ({ ...current, photo: "" }));
    if (inputRef?.current) inputRef.current.value = "";
  };

  const resetFormState = (inputRef) => {
    setPhotoFile(null);
    setErrors({});
    setStatus(null);
    setSaving(false);
    if (inputRef?.current) inputRef.current.value = "";
  };

  return {
    photoFile,
    photoPreview,
    errors,
    setErrors,
    status,
    setStatus,
    saving,
    setSaving,
    handlePhotoChange,
    removePhoto,
    resetFormState,
  };
}

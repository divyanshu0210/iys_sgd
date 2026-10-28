// DRF can return a detail string, an error list, or nested field errors.
function collectMessages(value, field = "") {
  if (typeof value === "string") {
    return value.trim() ? [field ? `${field}: ${value}` : value] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectMessages(item, field));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => {
      const isGeneral = ["detail", "error", "errors", "non_field_errors"].includes(key) || /^\d+$/.test(key);
      return collectMessages(item, isGeneral ? field : key.replace(/_/g, " "));
    });
  }
  return [];
}

export function getApiErrorMessages(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;
  // Batch responses can include successful records alongside errors; those
  // records are not error messages and must not be shown in an alert.
  const payload = data && typeof data === "object" && !Array.isArray(data) && data.errors?.length
    ? data.errors
    : data;
  const messages = collectMessages(payload);
  if (messages.length) return [...new Set(messages)];
  if (!error?.response && error?.message === "Network Error") {
    return ["Unable to connect. Please check your internet connection and try again."];
  }
  if (!error?.response && error?.message) return [error.message];
  return [fallback];
}

export function getApiErrorMessage(error, fallback) {
  return getApiErrorMessages(error, fallback).join("\n");
}

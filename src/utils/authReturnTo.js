const RETURN_TO_KEY = "authReturnTo";
const RETURN_TO_AT_KEY = "authReturnToAt";
const RETURN_TO_MAX_AGE = 10 * 60 * 1000;

function isInternalPath(path) {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\");
}

export function getAuthReturnTo(from) {
  if (isInternalPath(from)) return from;

  const storedAt = Number(sessionStorage.getItem(RETURN_TO_AT_KEY));
  const storedPath = sessionStorage.getItem(RETURN_TO_KEY);
  if (storedAt && Date.now() - storedAt < RETURN_TO_MAX_AGE && isInternalPath(storedPath)) {
    return storedPath;
  }
  return "/";
}

export function clearAuthReturnTo() {
  sessionStorage.removeItem(RETURN_TO_KEY);
  sessionStorage.removeItem(RETURN_TO_AT_KEY);
}

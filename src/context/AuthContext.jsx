import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";
import { STORAGE_KEY } from "../pages/Registration/context/YatraRegistrationContext";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileStage, setProfileStage] = useState("not-exists"); // "not-exists", "guest", "approval", "devotee"
  const [loading, setLoading] = useState(true);
  const [isNavigationLocked, setIsNavigationLocked] = useState(false);

  const determineProfileStage = (data) => {
    if (!data.mobile) return "not-exists";
    if (data.user_type === "mentor") return "mentor";
    if (data.mobile && !data.mentor) return "guest";
    if (data.mentor && !data.is_profile_approved) return "approval";
    if (data.mentor && data.is_profile_approved) return "devotee";
    return "guest";
  };
  // ✅ Fetch profile from API and return success status
  const fetchProfile = async () => {
    try {
      const res = await API.get("api/profile/");
      const data = res.data;
      setProfile(data);
      const stage = determineProfileStage(data);
      setProfileStage(stage);
      return stage;
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile(null);
      setProfileStage("not-exists");
      return "not-exists";
    }
  };

  // ✅ Run once on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      console.log("AuthProvider mounted, token:", token);

      if (token) {
        setUser(token);
        const stage = await fetchProfile(); // ✅ Wait for result
        console.log("Profile fetched successfully. Profile Type:", stage);
      } else {
        setUser(null);
        setProfile(null);
        setProfileStage("not-exists");
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const username = email.split("@")[0]; // derive username from email
    const res = await API.post("api/auth/login/", {
      username,
      email,
      password,
    });
    console.log("Logged In", res.data);
    localStorage.setItem("userToken", res.data.key);
    setUser(email);
  };

  const logoutFromGoogle = async (accessToken) => {
    await fetch(
      `https://accounts.google.com/o/oauth2/revoke?token=${accessToken}`,
      {
        method: "POST",
        mode: "no-cors",
      }
    );
  };
  const logout = () => {
    try {
      const res = API.post("api/auth/logout/");
      const aT = localStorage.getItem("accessToken");
      if (aT) {
        logoutFromGoogle(aT);
      }
      const keepKeys = [STORAGE_KEY];

      // Remove everything else
      Object.keys(localStorage).forEach((key) => {
        if (!keepKeys.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      setUser(null);
      setProfile(null);
      setProfileStage("not-exists");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        setLoading,
        profile,
        setProfile,
        fetchProfile,
        profileStage,
        setProfileStage,
        isNavigationLocked,
        setIsNavigationLocked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

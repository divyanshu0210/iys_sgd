import { useState, useEffect } from "react";

export default function useCountdown(expiryTime, onExpire) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!expiryTime) return;

    const expiry = new Date(expiryTime).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = expiry - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft("Expired");

        if (onExpire) onExpire();   // Call optional callback
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      setTimeLeft(`${mins}m ${secs < 10 ? "0" : ""}${secs}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTime]);

  return timeLeft;
}

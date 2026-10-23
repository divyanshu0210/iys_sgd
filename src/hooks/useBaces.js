import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

// The backend Bace table is the single source of truth for this list.
export default function useBaces() {
  const [baces, setBaces] = useState([]);

  useEffect(() => {
    let cancelled = false;

    API.get("/api/baces/")
      .then((res) => {
        if (!cancelled) {
          setBaces(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch(() => {
        if (!cancelled) setBaces([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const baceNames = useMemo(
    () => [
      ...new Set(
        baces.flatMap((bace) => [bace.name, ...(bace.other_centers || [])]).filter(Boolean)
      ),
    ],
    [baces]
  );

  return { baces, baceNames };
}

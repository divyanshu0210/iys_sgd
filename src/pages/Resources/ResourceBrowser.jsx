import React, { useEffect, useState } from "react";
import ResourceFilters from "./ResourceFilters";
import API from "../../services/api";
import ResourceSection from "./ResourceSection";
import FullPageLoader from "../../components/FullPageLoader";

const GROUP_ORDER = [
  "pdf",
  "audio",
  "youtube",
  "video",
  "other",
];

const GROUP_LABELS = {
  pdf: "PDFs",
  audio: "Audios",
  youtube: "YouTube Links",
  video: "Videos",
  other: "Others",
};

const GROUP_CONFIG = {
  pdf: {
    label: "PDFs",
    layout: "grid",
  },
  audio: {
    label: "Audios",
    layout: "horizontal",
  },
  youtube: {
    label: "YouTube Links",
    layout: "horizontal",
  },
  video: {
    label: "Videos",
    layout: "horizontal",
  },
  other: {
    label: "Others",
    layout: "grid",
  },
};


export function groupByType(resources) {
  const grouped = {
    pdf: [],
    audio: [],
    youtube: [],
    video: [],
    other: [],
  };

  resources.forEach((r) => {
    const key = grouped[r.resource_type]
      ? r.resource_type
      : "other";
    grouped[key].push(r);
  });

  return grouped;
}


export default function ResourceBrowser({
  yatraId = null,
  eventId = null,
}) {
  const [filters, setFilters] = useState({
    yatra: yatraId,
    event: eventId,
    category: "",
    language: "hi",
    type: "",
  });

  const [data, setData] = useState({
    results: [],
    next: null,
    loading: false,
  });

  useEffect(() => {
    fetchResources(true);
  }, [filters]);

  const fetchResources = async (reset = false) => {
    if (data.loading) return;

    setData((p) => ({ ...p, loading: true }));

    const params = {
      ...filters,
    };

    const url = reset
      ? "learning_material/resources/"
      : data.next;

    try {
      const res = await API.get(url, { params });
      setData((prev) => ({
        results: reset
          ? res.data.results
          : [...prev.results, ...res.data.results],
        next: res.data.next,
        loading: false,
      }));
    } catch (e) {
      console.error("Failed to fetch resources", e);
      setData((p) => ({ ...p, loading: false }));
    }
  };
  const grouped = groupByType(data.results);
  const hasAnyData = Object.values(grouped).some(
  (items) => items.length > 0
);

return (
  <div className="resource-browser">
    <ResourceFilters filters={filters} onChange={setFilters} />

    {/* Loading state (optional but recommended) */}
    {data.loading && data.results.length === 0 && (
     <FullPageLoader/>
    )}

    {/* No data state */}
    {!data.loading && !hasAnyData && (
      <p className="resource-empty">
        No resources found for the selected filters.
      </p>
    )}


    {GROUP_ORDER.map((type) => {
      const items = grouped[type];
      if (!items || items.length === 0) return null;

      return (
        <ResourceSection
          key={type}
          title={GROUP_CONFIG[type].label}
          layout={GROUP_CONFIG[type].layout}
          resources={items}
        />
      );
    })}

    {data.next && (
      <button className=".btn" onClick={() => fetchResources(false)}>
        Load more
      </button>
    )}
  </div>
);
}
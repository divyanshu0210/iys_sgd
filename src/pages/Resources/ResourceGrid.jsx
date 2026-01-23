import { useState } from "react";
import ResourceCard from "./ResourceCard";

const GRID_LIMIT = 9;

export default function ResourceGrid({ resources, layout }) {
  const [expanded, setExpanded] = useState(false);

  const isGrid = layout === "grid";
  const showToggle = isGrid && resources.length > GRID_LIMIT;

  const visibleResources =
    isGrid && !expanded
      ? resources.slice(0, GRID_LIMIT)
      : resources;

  return (
    <>
      <div className={`resource-grid ${layout}`}>
        {visibleResources.map((r) => (
          <ResourceCard
            key={r.id}
            resource={r}
            layout={layout}
          />
        ))}
      </div>

      {showToggle && (
        <div className="resource-toggle">
          <button
            className="toggle-btn"
            onClick={() => setExpanded((p) => !p)}
          >
            {expanded ? "Show less" : "Show All"}
          </button>
        </div>
      )}
    </>
  );
}

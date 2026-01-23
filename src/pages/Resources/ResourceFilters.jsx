export default function ResourceFilters({ filters, onChange }) {
  const update = (key, value) =>
    onChange((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="resource-filters">
      <select onChange={(e) => update("category", e.target.value)}>
        <option value="">All Categories</option>
        <option value="lecture">Lecture</option>
        <option value="kirtan">Kirtan</option>
        <option value="reading">Reading</option>
        <option value="guideline">Guidelines</option>
      </select>

      <select  value={filters.language} onChange={(e) => update("language", e.target.value)}>
        <option value="">All Languages</option>
        <option value="hi">Hindi</option>
        <option value="en">English</option>
        {/* <option value="mr">Marathi</option> */}
        {/* <option value="kn">Kannada</option> */}
      </select>

      <select onChange={(e) => update("type", e.target.value)}>
        <option value="">All Types</option>
        <option value="pdf">PDF</option>
        <option value="audio">Audio</option>
        <option value="video">Video</option>
        <option value="youtube">YouTube</option>
      </select>
    </div>
  );
}

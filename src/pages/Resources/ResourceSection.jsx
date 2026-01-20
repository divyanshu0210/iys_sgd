import ResourceGrid from "./ResourceGrid";


export default function ResourceSection({
  title,
  resources,
  layout = "grid",
}) {
  return (
    <section className="resource-section">
      <h3>{title}</h3>
      <ResourceGrid resources={resources} layout={layout} />
    </section>
  );
}

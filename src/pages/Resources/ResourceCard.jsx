// import { useState } from "react";
// import { getResourceThumbnail } from "./utils";

// export default function ResourceCard({ resource, layout }) {
//   const thumb = getResourceThumbnail(resource);
//   // Resolve initial image src
//   const [imgSrc, setImgSrc] = useState(
//     typeof thumb === "string" ? thumb : thumb?.high
//   );

//   const handleImgError = () => {
//     if (thumb?.fallback && imgSrc !== thumb.fallback) {
//       setImgSrc(thumb.fallback);
//     }
//   };
//   return (
//     <div
//       className={`resource-card ${layout}`}
//       onClick={() => window.open(resource.link_url, "_blank")}
//     >
//       <img
//         src={imgSrc}
//         onError={handleImgError}
//         alt={resource.title}
//         className="resource-thumb"
//       />
//       <div className="resource-body">
//         <h4>{resource.title}</h4>
//         {resource.subtitle && <p>{resource.subtitle}</p>}
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { getResourceThumbnail } from "./utils";

export default function ResourceCard({ resource, layout }) {
  const { default: defaultThumb, preview } = getResourceThumbnail(resource);

  const [imgSrc, setImgSrc] = useState(defaultThumb);

  useEffect(() => {
    if (!preview) return;

    const img = new Image();
    img.src = preview;

    img.onload = () => setImgSrc(preview);
    img.onerror = () => {}; // keep default
  }, [preview]);

  return (
    <div
      className={`resource-card ${layout}`}
      onClick={() => window.open(resource.link_url, "_blank")}
    >
      <img src={imgSrc} alt={resource.title} className="resource-thumb" />

      <div className="resource-body">
        <h4>{resource.title}</h4>
        {resource.subtitle && <p>{resource.subtitle}</p>}
      </div>
    </div>
  );
}

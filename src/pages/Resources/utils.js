import fileThumb from "/pdf_preview.png";
import pdfThumb from "/pdf_preview.png";
import audioThumb from "/audio-placeholder.png";
import videoThumb from "/video-placeholder.png";
import youtubeThumb from "/video-placeholder.png";

export function getYouTubeThumbnailFromUrl(linkUrl) {
  const youtubeId = extractYouTubeId(linkUrl);
  console.log(youtubeId);
  if (!youtubeId) return null;

  return {
    high: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
    fallback: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
  };
}

export function getDrivePdfThumbnail(linkUrl) {
  const fileId = extractDriveFileId(linkUrl);
  if (!fileId) return null;

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`;
}

/* -----------------------------
   Public API
----------------------------- */

export function getResourceThumbnail(resource) {
  return {
    default: getDefaultThumb(resource.resource_type),
    preview: getPreviewThumb(resource),
  };
}

function getDefaultThumb(resourceType) {
  switch (resourceType) {
    case "pdf":
      return pdfThumb;
    case "audio":
      return audioThumb;
    case "video":
      return videoThumb;
    case "youtube":
      return youtubeThumb;
    default:
      return fileThumb;
  }
}
function getPreviewThumb(resource) {
  // Backend override
  if (resource.thumbnail) return resource.thumbnail;

  // YouTube
  if (resource.resource_type === "youtube" && resource.link_url) {
    const id = extractYouTubeId(resource.link_url);
    if (id) {
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
  }

  // Drive PDF
  if (resource.resource_type === "pdf" && resource.link_url) {
    const fileId = extractDriveFileId(resource.link_url);
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`;
    }
  }

  return null;
}


export function extractYouTubeId(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // youtu.be/VIDEO_ID
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }

    // youtube.com/watch?v=VIDEO_ID
    const vParam = parsed.searchParams.get("v");
    if (vParam) {
      return vParam;
    }

    const pathParts = parsed.pathname.split("/").filter(Boolean);

    // youtube.com/embed/VIDEO_ID
    // youtube.com/shorts/VIDEO_ID
    // youtube.com/live/VIDEO_ID
    const knownPrefixes = ["embed", "shorts", "live"];

    for (const prefix of knownPrefixes) {
      const index = pathParts.indexOf(prefix);
      if (index !== -1 && pathParts[index + 1]) {
        return pathParts[index + 1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function extractDriveFileId(url) {
  if (!url) return null;

  try {
    // https://drive.google.com/file/d/FILE_ID/view
    const match = url.match(/\/d\/([^/]+)/);
    if (match) return match[1];

    // https://drive.google.com/open?id=FILE_ID
    const parsed = new URL(url);
    const id = parsed.searchParams.get("id");
    if (id) return id;

    return null;
  } catch {
    return null;
  }
}

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../../../services/api";
import QRCode from "qrcode";

const adminBaseURL = import.meta.env.VITE_ADMIN_BACKEND_URL;
// Color palette (ISKCON-inspired)
const COLORS = {
  primary: [255, 87, 34], // saffron/orange
  dark: [33, 33, 33],
  gray: [100, 100, 100],
  lightGray: [245, 245, 245],
  border: [220, 220, 220],
};
const fetchBase64Image = async (url) => {
  const res = await API.get(`api/proxy-image/?url=${encodeURIComponent(url)}`);
  return res.data.base64;
};

const fmt = (dt, show_time = true) => {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString("en-IN", {
      ...{ dateStyle: "medium" },
      ...(show_time && { timeStyle: "short" }),
    });
  } catch {
    return dt;
  }
};
function capitalize(value) {
  // Convert to string and trim
  const str = String(value ?? "").trim();
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function getImageBase64(logoUrl, targetSize = 120) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = logoUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");

      // Better: preserve aspect ratio (your fixed 100×100 forces distortion if logo isn't square)
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const max = targetSize;

      if (w > h) {
        if (w > max) {
          h = Math.round((h * max) / w);
          w = max;
        }
      } else {
        if (h > max) {
          w = Math.round((w * max) / h);
          h = max;
        }
      }

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);

      const dataUrl = canvas.toDataURL("image/png");
      const base64 = dataUrl.split(",")[1];
      resolve(base64);
    };

    img.onerror = () => {
      console.warn(`Image failed to load: ${logoUrl}`);
      reject(new Error("Logo load failed"));
    };
  });
}


let pageHeight = 0;
export async function generateRCS(profile,authProfile, yatra) {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true, // ← enables PDF-level compression
  });
  pageHeight = doc.getPageHeight()-10;
  console.log(pageHeight,authProfile)

  // -------------------------------------------------------------
  // ────────────────────────────────────────────────
  // HEADER
  // ────────────────────────────────────────────────
  const headerY = 8;
  const logoSize = 12;
  // Left logo
  try {
    const logoBase64 = await getImageBase64("/iys_logo.png", 150);
    doc.addImage(
      `data:image/png;base64,${logoBase64}`,
      "PNG",
      12,
      headerY,
      logoSize,
      logoSize
    );
  } catch {
    doc.setDrawColor(...COLORS.border);
    doc.rect(12, headerY, logoSize, logoSize);
    doc.setFontSize(8);
    doc.text("IYS", 14, headerY + 9);
  }

  // Right logo
  try {
    const logo2Base64 = await getImageBase64("/sp.jpg", 200);
    doc.addImage(
      `data:image/png;base64,${logo2Base64}`,
      "PNG",
      210 - 12 - logoSize,
      headerY,
      logoSize,
      logoSize
    );
  } catch {
    doc.setDrawColor(...COLORS.border);
    doc.rect(210 - 12 - logoSize, headerY, logoSize, logoSize);
    doc.setFontSize(8);
    doc.text("ISKCON", 210 - 22, headerY + 9);
  }

  // Header text
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("IYS Iskcon Ravet, Sri Govind Dham", 105, headerY + 5, {
    align: "center",
  });

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.gray);
  doc.text(`IYS Yatra 2026 – ${yatra.title}`, 105, headerY + 11, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.dark);

  // Header underline
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(15, headerY + 15, 195, headerY + 15);

  doc.setFontSize(11);
  doc.text("Registration Confirmation Slip (RCS)", 105, headerY + 23, {
    align: "center",
  });
  const contentStartY = headerY + 28;
  // inside generateRCS
  let qrData = `${adminBaseURL}mark-attendance/${profile.registration_id}`;
  console.log("QR Data:", qrData);
  const qrBase64 = await QRCode.toDataURL(qrData);

  // Add QR to PDF
  doc.addImage(qrBase64, "PNG", 10, contentStartY, 40, 40);

  // -------------------------------------------------------------
  // LEFT: QR placeholder box (empty for now)
  // -------------------------------------------------------------
  doc.setDrawColor(180);
  doc.rect(10, contentStartY, 40, 40); // (x, y, width, height)

  // -------------------------------------------------------------
  // RIGHT: Profile image box
  // -------------------------------------------------------------
  let imgBase64 = null;
  if (profile.profile_picture) {
    try {
      imgBase64 = await fetchBase64Image(profile.profile_picture);
      doc.addImage(
        `data:image/jpeg;base64,${imgBase64}`,
        "JPEG",
        160,
        contentStartY,
        40,
        40
      );
    } catch (err) {
      console.log("Image fetch failed", err);
    }
  } else {
    // fallback empty box
    doc.rect(160, contentStartY, 40, 40);
  }

  console.log(profile)

  // -------------------------------------------------------------
  // MIDDLE: Personal Details table (between QR and photo)
  // -------------------------------------------------------------
  const personalRows = [
    ["Initiated Name", profile.initiated_name],
    ["Name", profile.full_name],
    ["Gender", capitalize(profile.gender)],
    ["DOB", fmt(profile.dob, false)],
    ["Mobile", profile.mobile],
    ["Email", profile.email],
    ["Member ID", profile.member_id],
    ["Center", profile.center],
    ["Counselor", `${profile.mentor_name} (${profile.approved_by})` || "—"],
    ["Registration ID", profile.registration_id],
    [
      "Status",
      profile.is_substitution ? "Substituted" : profile.registration_status,
    ],
  ];
  if (profile.is_substitution && profile.pending_substitution_fees) {
    const pendingNote = `Note: You have to pay balance amount of Rs. ${profile.pending_substitution_fees.total} at the registration counter.`;

    personalRows.push([
      "Pending Amount",
      `Rs. ${profile.pending_substitution_fees.total}\n${pendingNote}`,
    ]);
  }

  autoTable(doc, {
    startY: contentStartY,
    margin: { left: 55, right: 55 },
    theme: "grid",
    styles: {
      fontSize: 8,
      textColor: [0, 0, 0],
    },
    body: personalRows,
    didParseCell: function (data) {
      if (
        data.section === "body" &&
        data.column.index === 1 && // value column
        typeof data.cell.raw === "string" &&
        data.cell.raw.includes("Note: You have to pay")
      ) {
        data.cell.styles.textColor = [180, 0, 0]; // red
      }
    },
  });

  const tableGap = 7;
  let cursor = doc.lastAutoTable.finalY + tableGap;

  // -------------------------------------------------------------
  // ACCOMMODATION DETAILS
  // -------------------------------------------------------------
  if (profile.accommodation?.length > 0) {
    doc.setFontSize(10);
    doc.text("Accommodation Details", 10, cursor);

    const accRows = profile.accommodation.map((a) => [
      a.accommodation.place_name,
      a.accommodation.address,
      a.room_number || "—",
      fmt(a.accommodation.checkin_datetime),
      fmt(a.accommodation.checkout_datetime),
    ]);

    autoTable(doc, {
      startY: cursor + 3,
      head: [["Place", "Address", "Room", "Check-in", "Check-out"]],
      body: accRows,
      styles: { fontSize: 8, textColor: [0, 0, 0] },
      headStyles: {
        textColor: [255, 255, 255], // (safe even if no head)
        fontStyle: "bold",
      },
    });

    cursor = doc.lastAutoTable.finalY + tableGap;
  }

  // -------------------------------------------------------------
  // JOURNEY DETAILS
  // -------------------------------------------------------------
  if (profile.journey?.length > 0) {
    doc.text("Travelling Details", 10, cursor);

    const journeyRows = profile.journey.map((j) => [
      capitalize(j.journey.type),
      `${j.journey.from_location} -> ${j.journey.to_location}`,
      capitalize(j.journey.mode_of_travel),
      j.vehicle_number || "—",
      j.seat_number || "—",
      fmt(j.journey.start_datetime),
      j.journey.remarks || "—",
    ]);

    autoTable(doc, {
      startY: cursor + 3,
      head: [
        [
          "Type",
          "Route",
          "Mode",
          "Vehicle/PNR",
          "Seat",
          "Departure",
          "Details",
        ],
      ],
      body: journeyRows,
      styles: { fontSize: 8, textColor: [0, 0, 0] },
      headStyles: {
        textColor: [255, 255, 255], // (safe even if no head)
        fontStyle: "bold",
      },
    });

    cursor = doc.lastAutoTable.finalY + tableGap;
  }

  // -------------------------------------------------------------
  // CUSTOM FIELDS
  // -------------------------------------------------------------
  if (profile.custom_fields?.length > 0) {
    doc.text("Additional Details", 10, cursor);

    const customRows = profile.custom_fields.map((f) => [f.field, f.value]);

    autoTable(doc, {
      startY: cursor + 3,
      head: [["Field", "Value"]],
      body: customRows,
      styles: { fontSize: 8, textColor: [0, 0, 0] },
      headStyles: {
        textColor: [255, 255, 255], // (safe even if no head)
        fontStyle: "bold",
      },
    });

    cursor = doc.lastAutoTable.finalY + tableGap;
  }

  cursor = renderImportantContacts(doc, yatra, cursor, tableGap);
  cursor = renderImportantNotes(doc, yatra, cursor, tableGap);

  // -------------------------------------------------------------
  // FOOTER
  // -------------------------------------------------------------
  const now = new Date().toLocaleString("en-IN");
  if (cursor > pageHeight) {
    doc.addPage();
    cursor = 20;
  }

  doc.setFontSize(7);
  doc.text(
    `Downloaded by ${authProfile.full_name} (${authProfile.email}) on ${now}`,
    10,
    cursor + 10
  );

  doc.save(`${profile.full_name}_RCS.pdf`);
}

function renderImportantContacts(doc, yatra, cursor, tableGap) {
  const contacts = (yatra.contact_categories || [])
    .filter((c) => c.show_in_rcs === true)
    .map((c, index) => ({ ...c, _idx: index }))
    .sort((a, b) => {
      const orderDiff = (a.order ?? 0) - (b.order ?? 0);
      return orderDiff !== 0 ? orderDiff : a._idx - b._idx;
    });

  if (!contacts.length) return cursor;

  if (cursor > pageHeight) {
    doc.addPage();
    cursor = 20;
  }

  // Title
  doc.setFontSize(10);
  doc.text("Important Contact Numbers", 10, cursor);
  cursor += 6;

  doc.setFontSize(9);

  const lineHeight = 4;
  const contactGap = 2;
  const maxWidth = 180;

  contacts.forEach((c, idx) => {
    const numbersText = c.numbers ? `: ${c.numbers}` : "";
    const text = `${idx + 1}. ${c.title}${numbersText}`;

    const lines = doc.splitTextToSize(text, maxWidth);

    if (cursor + lines.length * lineHeight > pageHeight) {
      doc.addPage();
      cursor = 20;
    }

    doc.text(lines, 12, cursor);
    cursor += lines.length * lineHeight + contactGap;
  });

  return cursor + tableGap / 2;
}

function renderImportantNotes(doc, yatra, cursor, tableGap) {
  const notes = (yatra.important_notes || [])
    .filter((n) => n.show_in_rcs === true)
    .map((n, index) => ({ ...n, _idx: index }))
    .sort((a, b) => {
      const orderDiff = (a.order ?? 0) - (b.order ?? 0);
      return orderDiff !== 0 ? orderDiff : a._idx - b._idx;
    });

  if (!notes.length) return cursor;

  if (cursor > pageHeight) {
    doc.addPage();
    cursor = 20;
  }

  doc.setFontSize(10);
  doc.text("Important Notes", 10, cursor);

  doc.setFontSize(9);
  cursor += 6;

  const lineHeight = 4;
  const noteGap = 1;

  notes.forEach((n, idx) => {
    const text = `${idx + 1}. ${n.note}`;
    const lines = doc.splitTextToSize(text, 180);

    if (cursor + lines.length * lineHeight > pageHeight) {
      doc.addPage();
      cursor = 20;
    }

    doc.text(lines, 12, cursor);
    cursor += lines.length * lineHeight + noteGap;
  });

  return cursor + tableGap;
}

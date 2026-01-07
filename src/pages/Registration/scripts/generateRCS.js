import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../../../services/api";
import QRCode from "qrcode";

const baseURL = import.meta.env.VITE_BACKEND_URL;

const fetchBase64Image = async (url) => {
  const res = await API.get(`api/proxy-image/?url=${encodeURIComponent(url)}`);
  return res.data.base64;
};

const fmt = (dt) => {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString("en-IN", {
      dateStyle: "medium",
      // timeStyle: "short",
    });
  } catch {
    return dt;
  }
};

export async function generateRCS(profile, yatra) {
  const doc = new jsPDF("p", "mm", "a4");

  // -------------------------------------------------------------
  // HEADER TITLE
  // -------------------------------------------------------------
  doc.setFontSize(16);
  doc.text(`${yatra.title} – Registration Confirmation Slip`, 10, 10);

  // inside generateRCS
  let qrData = `${baseURL}yatras/mark-attendance/${profile.registration_id}`;
  console.log("QR Data:", qrData);
  const qrBase64 = await QRCode.toDataURL(qrData);

  // Add QR to PDF
  doc.addImage(qrBase64, "PNG", 10, 20, 40, 40);

  // -------------------------------------------------------------
  // LEFT: QR placeholder box (empty for now)
  // -------------------------------------------------------------
  doc.setDrawColor(180);
  doc.rect(10, 20, 40, 40); // (x, y, width, height)

  // -------------------------------------------------------------
  // RIGHT: Profile image box
  // -------------------------------------------------------------
  let imgBase64 = null;
  if (profile.profile_picture_url) {
    try {
      imgBase64 = await fetchBase64Image(profile.profile_picture_url);
      doc.addImage(
        `data:image/jpeg;base64,${imgBase64}`,
        "JPEG",
        160,
        20,
        40,
        40
      );
    } catch (err) {
      console.log("Image fetch failed", err);
    }
  } else {
    // fallback empty box
    doc.rect(160, 20, 40, 40);
  }

  // -------------------------------------------------------------
  // MIDDLE: Personal Details table (between QR and photo)
  // -------------------------------------------------------------
  const personalRows = [
    ["Name", profile.full_name],
    ["Gender", profile.gender],
    ["DOB", fmt(profile.dob)],
    ["Mobile", profile.mobile],
    ["Email", profile.email],
    ["Member ID", profile.member_id],
    ["Center", profile.center],
    ["Mentor", `${profile.mentor_name} (${profile.approved_by})` || "—"],
    ["Registration ID", profile.registration_id],
    [
      "Status",
      profile.is_substitution ? "Substituted" : profile.registration_status,
    ],
  ];
  const pendingNote = `Note: You have to pay balance amount of Rs. ${profile.pending_substitution_fees.total} at the registration counter.`;

  if (profile.is_substitution && profile.pending_substitution_fees) {
    personalRows.push([
      "Pending Amount",
      `Rs. ${profile.pending_substitution_fees.total}\n${pendingNote}`,
    ]);
  }

  autoTable(doc, {
    startY: 20,
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

  let cursor = doc.lastAutoTable.finalY + 10;

  // -------------------------------------------------------------
  // ACCOMMODATION DETAILS
  // -------------------------------------------------------------
  if (profile.accommodation?.length > 0) {
    doc.setFontSize(10);
    doc.text("Accommodation Details", 10, cursor);

    const accRows = profile.accommodation.map((a) => [
      a.accommodation.place_name,
      a.room_number || "—",
      a.bed_number || "—",
      a.accommodation.address,
      fmt(a.accommodation.checkin_datetime),
      fmt(a.accommodation.checkout_datetime),
    ]);

    autoTable(doc, {
      startY: cursor + 3,
      head: [["Place", "Room", "Bed", "Address", "Check-in", "Check-out"]],
      body: accRows,
      styles: { fontSize: 8, textColor: [0, 0, 0] },
      headStyles: {
        textColor: [255, 255, 255], // (safe even if no head)
        fontStyle: "bold",
      },
    });

    cursor = doc.lastAutoTable.finalY + 10;
  }

  // -------------------------------------------------------------
  // JOURNEY DETAILS
  // -------------------------------------------------------------
  if (profile.journey?.length > 0) {
    doc.text("Journey Details", 10, cursor);

    const journeyRows = profile.journey.map((j) => [
      j.journey.type,
      `${j.journey.from_location} -> ${j.journey.to_location}`,
      j.journey.mode_of_travel,
      j.vehicle_number || "—",
      j.seat_number || "—",
      fmt(j.journey.start_datetime),
    ]);

    autoTable(doc, {
      startY: cursor + 3,
      head: [["Type", "Route", "Mode", "Vehicle/PNR", "Seat", "Departure"]],
      body: journeyRows,
      styles: { fontSize: 8, textColor: [0, 0, 0] },
       headStyles: {
        textColor: [255, 255, 255], // (safe even if no head)
        fontStyle: "bold",
      },
    });

    cursor = doc.lastAutoTable.finalY + 10;
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

    cursor = doc.lastAutoTable.finalY + 10;
  }

  // -------------------------------------------------------------
  // FOOTER
  // -------------------------------------------------------------
  const now = new Date().toLocaleString("en-IN");

  if (cursor > 270) {
    doc.addPage();
    cursor = 20;
  }

  doc.setFontSize(7);
  doc.text(
    `Downloaded by ${profile.full_name} (${profile.email}) on ${now}`,
    10,
    cursor + 10
  );

  doc.save(`${profile.full_name}_RCS.pdf`);
}

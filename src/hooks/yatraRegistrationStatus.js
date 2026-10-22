const toLocalDate = (value) =>
  value ? new Date(`${value}T00:00:00`) : null;

const formatDate = (value) =>
  toLocalDate(value)?.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) || "";

export function getYatraRegistrationStatus(yatra, now = new Date()) {
  const phases = [...(yatra.registration_phases || [])]
    .filter((phase) => phase.start_date)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
  const activePhase = phases
    .filter((phase) => {
      const start = toLocalDate(phase.start_date);
      const end = phase.end_date ? toLocalDate(phase.end_date) : null;
      return start <= now && (!end || end >= now);
    })
    .sort((a, b) => b.start_date.localeCompare(a.start_date))[0];

  if (activePhase) {
    if (!yatra?.is_registration_open) {
      return { key: "temporarily_closed", label: "Registration Temporarily Closed", announcement: "Registration Temporarily Closed", canRegister: false, phase: activePhase };
    }

    const endText = activePhase.end_date ? ` Ends on ${formatDate(activePhase.end_date)}.` : "";
    return { key: "open", label: "Registration Open", announcement: `Registration opened.${endText}`, canRegister: true, phase: activePhase };
  }

  const nextPhase = phases.find((phase) => toLocalDate(phase.start_date) > now);
  if (nextPhase) {
    const hasEarlierPhase = phases.some((phase) => toLocalDate(phase.start_date) <= now);
    const verb = hasEarlierPhase ? "Registration resumes on" : "Registration starts from";
    const shortVerb = hasEarlierPhase ? "Reg. Resumes" : "Reg. Starts";
    return { key: "upcoming", label: `${shortVerb} ${formatDate(nextPhase.start_date)}`, announcement: `${verb} ${formatDate(nextPhase.start_date)}.`, buttonLabel: hasEarlierPhase ? "Registration Resumes Soon !!" : "Registration Starts Soon !!", canRegister: false, phase: nextPhase };
  }

  if (phases.length > 0) {
    return { key: "ended", label: "Registration Has Ended", announcement: "Registration has ended.", canRegister: false };
  }

  if (!yatra?.is_registration_open) {
    return { key: "closed", label: "Registration Closed", announcement: "Registration Closed", canRegister: false };
  }

  return { key: "open", label: "Registration Open", announcement: "Registration Open", canRegister: true };
}

export function isYatraWithinAnnouncementWindow(yatra, now = new Date()) {
  const firstPhaseStart = [...(yatra?.registration_phases || [])]
    .filter((phase) => phase.start_date)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))[0]?.start_date;
  const announcementStart = toLocalDate(firstPhaseStart || yatra?.start_date);
  if (!announcementStart) return false;

  const oneMonthBefore = new Date(announcementStart);
  oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);
  const announcementEnd = toLocalDate(yatra?.start_date) || announcementStart;
  return now >= oneMonthBefore && now <= announcementEnd;
}

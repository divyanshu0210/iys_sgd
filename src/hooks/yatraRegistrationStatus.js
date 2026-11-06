const toLocalDate = (value) =>
  value ? new Date(`${value}T00:00:00`) : null;

const formatDate = (value) =>
  toLocalDate(value)?.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) || "";

export const firstInstallment = (phase) =>
  [...(phase?.installments || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];

export function getYatraRegistrationStatus(yatra, now = new Date()) {
  const phases = [...(yatra.registration_phases || [])]
    .filter((phase) => firstInstallment(phase)?.start_date)
    .sort((a, b) => firstInstallment(a).start_date.localeCompare(firstInstallment(b).start_date));
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const activePhase = phases
    .filter((phase) => {
      const first = firstInstallment(phase);
      const start = toLocalDate(first.start_date);
      const end = first.end_date ? toLocalDate(first.end_date) : null;
      return start <= today && (!end || end >= today);
    })
    .sort((a, b) => firstInstallment(b).start_date.localeCompare(firstInstallment(a).start_date) || Number(b.id) - Number(a.id))[0];

  if (activePhase) {
    if (!yatra?.is_registration_open) {
      return { key: "temporarily_closed", label: "Registration Temporarily Closed", announcement: "Registration Temporarily Closed", canRegister: false, phase: activePhase };
    }

    const endText = firstInstallment(activePhase).end_date ? ` Ends on ${formatDate(firstInstallment(activePhase).end_date)}.` : "";
    return { key: "open", label: "Registration Open", announcement: `Registration opened.${endText}`, canRegister: true, phase: activePhase };
  }

  const nextPhase = phases.find((phase) => toLocalDate(firstInstallment(phase).start_date) > today);
  if (nextPhase) {
    const hasEarlierPhase = phases.some((phase) => toLocalDate(firstInstallment(phase).start_date) <= today);
    const verb = hasEarlierPhase ? "Registration resumes on" : "Registration starts from";
    const shortVerb = hasEarlierPhase ? "Reg. Resumes" : "Reg. Starts";
    return { key: "upcoming", label: `${shortVerb} ${formatDate(firstInstallment(nextPhase).start_date)}`, announcement: `${verb} ${formatDate(firstInstallment(nextPhase).start_date)}.`, buttonLabel: hasEarlierPhase ? "Registration Resumes Soon !!" : "Registration Starts Soon !!", canRegister: false, phase: nextPhase };
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
    .map(firstInstallment)
    .filter((installment) => installment?.start_date)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))[0]?.start_date;
  const announcementStart = toLocalDate(firstPhaseStart || yatra?.start_date);
  if (!announcementStart) return false;

  const oneMonthBefore = new Date(announcementStart);
  oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);
  const announcementEnd = toLocalDate(yatra?.start_date) || announcementStart;
  return now >= oneMonthBefore && now <= announcementEnd;
}

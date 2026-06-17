import Candidate from '../models/Candidate.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeString = (value) => (
  value === null || value === undefined ? '' : String(value).trim()
);

const cleanContact = (value) => (
  sanitizeString(value).replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').slice(-10)
);

const splitSkills = (value) => {
  if (Array.isArray(value)) return value.map(sanitizeString).filter(Boolean);
  return sanitizeString(value).split(/[,;|\n]+/).map(sanitizeString).filter(Boolean);
};

const ALLOWED_STATUSES = [
  'Submitted', 'Shared Profiles', 'Yet to attend', 'Turnups',
  'No Show', 'Selected', 'Joined', 'Rejected', 'Hold', 'Backout', 'Pipeline',
];

const STATUS_LOOKUP = ALLOWED_STATUSES.reduce((lookup, status) => {
  lookup[status.toLowerCase()] = status;
  return lookup;
}, {});

const resolveUserName = (user) => {
  const full = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  return full || user?.username || user?.email || 'Unknown';
};

const normalizeStatus = (value) => {
  const rawStatuses = Array.isArray(value)
    ? value.map(sanitizeString).filter(Boolean)
    : sanitizeString(value).split(/[,;|]+/).map(sanitizeString).filter(Boolean);

  const normalized = rawStatuses
    .map((status) => STATUS_LOOKUP[status.toLowerCase()])
    .filter(Boolean);

  return normalized.length ? [...new Set(normalized)] : ['Submitted'];
};

const errorRow = (row, reason) => ({
  rowNumber: row.rowNumber || row.rowNum || row.__rowNumber || '-',
  candidateName: sanitizeString(row.name) || `${sanitizeString(row.firstName)} ${sanitizeString(row.lastName)}`.trim() || '-',
  email: sanitizeString(row.email),
  contact: sanitizeString(row.contact),
  reason,
});

const buildCandidatePayload = (row, user) => {
  const firstName = sanitizeString(row.firstName);
  const lastName = sanitizeString(row.lastName) || '-';
  const email = sanitizeString(row.email).toLowerCase();
  const contact = cleanContact(row.contact);
  const position = sanitizeString(row.position);

  return {
    firstName,
    lastName,
    email,
    contact,
    alternateNumber: cleanContact(row.alternateNumber),
    currentLocation: sanitizeString(row.currentLocation),
    preferredLocation: sanitizeString(row.preferredLocation),
    position,
    client: sanitizeString(row.client),
    currentCompany: sanitizeString(row.currentCompany),
    industry: sanitizeString(row.industry),
    totalExperience: sanitizeString(row.totalExperience),
    relevantExperience: sanitizeString(row.relevantExperience),
    education: sanitizeString(row.education),
    skills: splitSkills(row.skills),
    ctc: sanitizeString(row.ctc),
    currentTakeHome: sanitizeString(row.currentTakeHome),
    ectc: sanitizeString(row.ectc),
    expectedTakeHome: sanitizeString(row.expectedTakeHome),
    noticePeriod: sanitizeString(row.noticePeriod),
    source: sanitizeString(row.source) || 'Bulk Import',
    remarks: sanitizeString(row.remarks),
    notes: sanitizeString(row.notes),
    resumeUrl: sanitizeString(row.resumeUrl),
    status: normalizeStatus(row.status),
    recruiterId: user._id,
    recruiterName: resolveUserName(user),
    active: true,
  };
};

export const bulkImportCandidates = async (req, res) => {
  try {
    const rows = Array.isArray(req.body?.candidates) ? req.body.candidates : [];
    if (!rows.length) {
      return res.status(400).json({
        success: false,
        imported: 0,
        failed: 0,
        duplicates: 0,
        errors: [{ rowNumber: '-', candidateName: '-', email: '', contact: '', reason: 'No candidates provided.' }],
      });
    }

    const tenantOwnerId = req.user._id;
    const errors = [];
    const validRows = [];
    const seenEmails = new Set();
    const seenContacts = new Set();

    rows.forEach((row, index) => {
      const rowNumber = row.rowNumber || row.rowNum || row.__rowNumber || index + 2;
      const normalizedRow = { ...row, rowNumber };
      const payload = buildCandidatePayload(normalizedRow, req.user);
      const rowErrors = [];

      if (!payload.firstName) rowErrors.push('First name is required.');
      if (!payload.email || !EMAIL_RE.test(payload.email)) rowErrors.push('Valid email is required.');
      if (!payload.contact || payload.contact.length !== 10) rowErrors.push('Valid 10-digit contact is required.');

      if (seenEmails.has(payload.email)) rowErrors.push('Duplicate email inside uploaded file.');
      if (seenContacts.has(payload.contact)) rowErrors.push('Duplicate contact inside uploaded file.');

      if (rowErrors.length) {
        errors.push(errorRow(normalizedRow, rowErrors.join(' ')));
        return;
      }

      seenEmails.add(payload.email);
      seenContacts.add(payload.contact);
      validRows.push({ row: normalizedRow, payload });
    });

    const emails = validRows.map(({ payload }) => payload.email);
    const contacts = validRows.map(({ payload }) => payload.contact);
    const existingCandidates = await Candidate.find({
      recruiterId: tenantOwnerId,
      $or: [
        { email: { $in: emails } },
        { contact: { $in: contacts } },
      ],
    }).select('email contact candidateId name').lean();

    const existingEmailSet = new Set(existingCandidates.map((candidate) => sanitizeString(candidate.email).toLowerCase()).filter(Boolean));
    const existingContactSet = new Set(existingCandidates.map((candidate) => cleanContact(candidate.contact)).filter(Boolean));

    const duplicateRows = [];
    const importRows = [];

    validRows.forEach(({ row, payload }) => {
      const reasons = [];
      if (existingEmailSet.has(payload.email)) reasons.push('Duplicate email already exists.');
      if (existingContactSet.has(payload.contact)) reasons.push('Duplicate contact already exists.');

      if (reasons.length) {
        duplicateRows.push(errorRow(row, reasons.join(' ')));
      } else {
        importRows.push({ row, payload });
      }
    });

    let imported = 0;
    const failedRows = [];

    for (const { row, payload } of importRows) {
      try {
        const candidate = new Candidate(payload);
        await candidate.save();
        imported += 1;
      } catch (error) {
        failedRows.push(errorRow(row, error.message || 'Candidate save failed.'));
      }
    }

    const allErrors = [...errors, ...duplicateRows, ...failedRows];

    return res.json({
      success: true,
      fileName: sanitizeString(req.body?.fileName),
      imported,
      failed: errors.length + failedRows.length,
      duplicates: duplicateRows.length,
      total: rows.length,
      errors: allErrors,
    });
  } catch (error) {
    console.error('[bulkImportCandidates]', error);
    return res.status(500).json({
      success: false,
      imported: 0,
      failed: 1,
      duplicates: 0,
      errors: [{ rowNumber: '-', candidateName: '-', email: '', contact: '', reason: error.message || 'Server error during import.' }],
    });
  }
};

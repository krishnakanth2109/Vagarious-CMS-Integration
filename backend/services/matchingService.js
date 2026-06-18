const SCORE_WEIGHTS = { skills: 50, experience: 25, role: 10, education: 10, location: 5 };

const MATCH_LEVELS = [
  { min: 85, label: 'Excellent Match' },
  { min: 70, label: 'Good Match' },
  { min: 50, label: 'Average Match' },
  { min: 30, label: 'Weak Match' },
  { min: 0, label: 'Poor Match' },
];

const normalize = (val) => (val || '').toString().trim().toLowerCase();

const normalizeSkill = (val) => {
  const compact = normalize(val).replace(/[^a-z0-9]/g, '');
  const aliases = {
    reactjs: 'react',
    react: 'react',
    node: 'nodejs',
    nodejs: 'nodejs',
    mongo: 'mongodb',
    mongodb: 'mongodb',
    js: 'javascript',
    javascript: 'javascript',
  };
  return aliases[compact] || compact;
};

const toArr = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean);
  return [];
};

const parseExperienceToMonths = (token) => {
  const raw = token?.toString() || '';
  const number = Number(raw);
  if (Number.isFinite(number)) return number * 12;
  const decimalMatch = raw.match(/^(\d+)\.(\d{1,2})$/);
  if (decimalMatch) return Number(decimalMatch[1]) * 12 + Number(decimalMatch[2]);
  return 0;
};

const parseExperienceMonths = (value) => {
  const text = normalize(value);
  if (!text) return 0;
  let months = 0;
  const yearMatches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?|yr)\b/g)];
  const monthMatches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(?:months?|mos?|mo)\b/g)];
  yearMatches.forEach((match) => {
    months += parseExperienceToMonths(match[1]);
  });
  monthMatches.forEach((match) => {
    months += Number(match[1]) || 0;
  });
  if (months > 0) return months;
  const match = text.match(/\d+(?:\.\d+)?/);
  return match ? parseExperienceToMonths(match[0]) : 0;
};

const getRequiredExperienceRange = (job) => {
  const values = (job.experience || '').toString().match(/\d+(?:\.\d+)?/g);
  if (!values?.length) return { min: 0, max: 0 };
  return {
    min: parseExperienceToMonths(values[0]),
    max: parseExperienceToMonths(values[1] || values[0]),
  };
};

const formatList = (list) => {
  if (!list.length) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return list.join(' and ');
  return `${list.slice(0, -1).join(', ')}, and ${list[list.length - 1]}`;
};

const parseQualifications = (value) => {
  if (!value) return [];
  return value
    .toString()
    .split(/[,/]+/)
    .map((qualification) => qualification.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);
};

export const buildFallbackMatchResult = (candidate, job) => {
  const candidateSkills = toArr(candidate.skills);
  const mandatorySkills = toArr(job.mandatorySkills).length ? toArr(job.mandatorySkills) : toArr(job.skills);
  const preferredSkills = toArr(job.preferredSkills);

  const candidateSkillSet = new Set(candidateSkills.map(normalizeSkill));
  const matchedMandatorySkills = [];
  const missingMandatorySkills = [];
  const matchedPreferredSkills = [];
  const missingPreferredSkills = [];

  mandatorySkills.forEach((skill) => {
    if (candidateSkillSet.has(normalizeSkill(skill))) matchedMandatorySkills.push(skill);
    else missingMandatorySkills.push(skill);
  });
  preferredSkills.forEach((skill) => {
    if (candidateSkillSet.has(normalizeSkill(skill))) matchedPreferredSkills.push(skill);
    else missingPreferredSkills.push(skill);
  });

  const mandatorySkillPercent = mandatorySkills.length
    ? (matchedMandatorySkills.length / mandatorySkills.length) * 100
    : 100;
  const preferredSkillPercent = preferredSkills.length
    ? (matchedPreferredSkills.length / preferredSkills.length) * 100
    : mandatorySkillPercent;
  const combinedSkillPercent = preferredSkills.length
    ? (mandatorySkillPercent + preferredSkillPercent) / 2
    : mandatorySkillPercent;
  const skillsScore = (combinedSkillPercent / 100) * SCORE_WEIGHTS.skills;

  const candidateMonths = parseExperienceMonths(candidate.totalExperience || candidate.experience);
  const { max } = getRequiredExperienceRange(job);
  const experienceScore = max > 0
    ? Math.min((candidateMonths / max) * SCORE_WEIGHTS.experience, SCORE_WEIGHTS.experience)
    : SCORE_WEIGHTS.experience;

  const candidateRole = normalize(candidate.position);
  const jobRole = normalize(job.position);
  const roleScore = candidateRole && jobRole && (candidateRole.includes(jobRole) || jobRole.includes(candidateRole))
    ? SCORE_WEIGHTS.role
    : 0;

  const candidateEduList = parseQualifications(candidate.education || candidate.qualification);
  const jobEduList = parseQualifications(job.qualification || job.education);
  const educationScore = !jobEduList.length || candidateEduList.some((candidateEdu) => (
    jobEduList.some((jobEdu) => candidateEdu.includes(jobEdu) || jobEdu.includes(candidateEdu))
  ))
    ? SCORE_WEIGHTS.education
    : 0;

  const candidateLocations = [
    candidate.currentLocation,
    candidate.preferredLocation,
  ].map(normalize).filter(Boolean);
  const jobLoc = normalize(job.location);
  const locationScore = !jobLoc || candidateLocations.some((loc) => loc.includes(jobLoc) || jobLoc.includes(loc))
    ? SCORE_WEIGHTS.location
    : 0;

  const matchPercentage = Math.round(skillsScore + experienceScore + roleScore + educationScore + locationScore);
  const matchLevel = MATCH_LEVELS.find((level) => matchPercentage >= level.min)?.label || 'Poor Match';

  const passed = [];
  const failed = [];
  if (mandatorySkillPercent >= 60) passed.push('mandatory skills');
  else failed.push('mandatory skills');
  if (!preferredSkills.length || preferredSkillPercent >= 50) passed.push('preferred skills');
  else failed.push('preferred skills');
  if (experienceScore >= SCORE_WEIGHTS.experience * 0.5) passed.push('experience');
  else failed.push('experience');
  if (roleScore > 0) passed.push('role');
  else failed.push('role');
  if (educationScore > 0) passed.push('education');
  else failed.push('education');
  if (locationScore > 0) passed.push('location');
  else failed.push('location');

  const reasonParts = [];
  if (passed.length) reasonParts.push(`Candidate matches ${formatList(passed)} criteria.`);
  if (failed.length) reasonParts.push(`Gaps found in ${formatList(failed)}.`);

  return {
    scoreVersion: 3,
    matchPercentage,
    totalScore: matchPercentage,
    matchLevel,
    skillScore: Math.round(combinedSkillPercent),
    mandatorySkillScore: Math.round(mandatorySkillPercent),
    preferredSkillScore: Math.round(preferredSkillPercent),
    experienceScore: Math.round((experienceScore / SCORE_WEIGHTS.experience) * 100),
    roleScore: Math.round((roleScore / SCORE_WEIGHTS.role) * 100),
    educationScore: Math.round((educationScore / SCORE_WEIGHTS.education) * 100),
    locationScore: Math.round((locationScore / SCORE_WEIGHTS.location) * 100),
    matchedMandatorySkills,
    missingMandatorySkills,
    matchedPreferredSkills,
    missingPreferredSkills,
    matchedSkills: [...matchedMandatorySkills, ...matchedPreferredSkills],
    missingSkills: [...missingMandatorySkills, ...missingPreferredSkills],
    breakdown: {
      skills: Math.round(skillsScore),
      experience: Math.round(experienceScore),
      role: Math.round(roleScore),
      education: Math.round(educationScore),
      location: Math.round(locationScore),
    },
    atsFlags: mandatorySkills.length && mandatorySkillPercent < 60 ? ['Low Mandatory Skill Match'] : [],
    reason: reasonParts.join(' ') || 'Evaluation completed successfully.',
    source: 'fallback',
  };
};

import type { JpResumeData, CnResumeData } from '../types/resume';

export interface CompletenessResult {
  filled: number;
  total: number;
  percentage: number;
}

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function countJpFields(data: JpResumeData): { filled: number; total: number } {
  const total = 15;
  let filled = 0;

  // personal_info fields (7)
  const pi = data.personal_info;
  if (pi) {
    if (isFilled(pi.name)) filled++;
    if (isFilled(pi.name_katakana)) filled++;
    if (isFilled(pi.birth_date)) filled++;
    if (isFilled(pi.gender)) filled++;
    if (isFilled(pi.address)) filled++;
    if (isFilled(pi.phone)) filled++;
    if (isFilled(pi.email)) filled++;
  }

  // Top-level text fields (3)
  if (isFilled(data.summary)) filled++;
  if (isFilled(data.motivation)) filled++;
  if (isFilled(data.strengths)) filled++;

  // Array fields — count as 1 each if has at least one entry (4)
  if (isFilled(data.work_history)) filled++;
  if (isFilled(data.education)) filled++;
  if (isFilled(data.skills)) filled++;
  if (isFilled(data.certifications)) filled++;

  // other (1)
  if (isFilled(data.other)) filled++;

  return { filled, total };
}

function countCnFields(data: CnResumeData): { filled: number; total: number } {
  const total = 15;
  let filled = 0;

  // Top-level personal fields (7)
  if (isFilled(data.name)) filled++;
  if (isFilled(data.phone)) filled++;
  if (isFilled(data.email)) filled++;
  if (isFilled(data.date_of_birth)) filled++;
  if (isFilled(data.address)) filled++;
  if (isFilled(data.nationality)) filled++;
  if (isFilled(data.gender)) filled++;

  // Array fields — count as 1 each if has entries (5)
  if (isFilled(data.education)) filled++;
  if (isFilled(data.work_experience)) filled++;
  if (isFilled(data.skills)) filled++;
  if (isFilled(data.certifications)) filled++;
  if (isFilled(data.languages)) filled++;

  // Text fields (3)
  if (isFilled(data.self_introduction)) filled++;
  if (isFilled(data.career_objective)) filled++;
  if (isFilled(data.other)) filled++;

  return { filled, total };
}

export function computeCompleteness(
  data: JpResumeData | CnResumeData | null,
): CompletenessResult {
  if (!data) {
    return { filled: 0, total: 15, percentage: 0 };
  }

  // Duck-typing: JpResumeData has personal_info, CnResumeData does not
  const isJp = 'personal_info' in data;
  const { filled, total } = isJp
    ? countJpFields(data as JpResumeData)
    : countCnFields(data as CnResumeData);

  const percentage = total > 0 ? Math.round((filled / total) * 100) : 0;

  return { filled, total, percentage };
}

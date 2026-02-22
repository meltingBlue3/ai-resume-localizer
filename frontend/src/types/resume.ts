export interface EducationEntry {
  school: string | null;
  major: string | null;
  degree: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface WorkEntry {
  company: string | null;
  position: string | null;
  department: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface SkillEntry {
  name: string | null;
  level: string | null;
}

export interface CertificationEntry {
  name: string | null;
  date: string | null;
}

export interface CnResumeData {
  name: string | null;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  address: string | null;
  nationality: string | null;
  gender: string | null;

  education: EducationEntry[] | null;
  work_experience: WorkEntry[] | null;
  skills: SkillEntry[] | null;
  certifications: CertificationEntry[] | null;
  languages: string[] | null;

  self_introduction: string | null;
  career_objective: string | null;
  project_experience: WorkEntry[] | null;
  awards: string[] | null;
  other: string | null;
}

export interface UploadAndExtractResponse {
  raw_text: string;
  cn_resume_data: CnResumeData;
}

export interface JpPersonalInfo {
  name?: string | null;
  name_katakana?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  nationality?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface JpEducationEntry {
  school?: string | null;
  degree?: string | null;
  major?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface JpProjectEntry {
  name?: string | null;
  role?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
  technologies?: string[] | null;
}

export interface JpWorkEntry {
  company?: string | null;
  title?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  location?: string | null;
  responsibilities?: string[] | null;
  achievements?: string[] | null;
  projects?: JpProjectEntry[] | null;
}

export interface JpSkillEntry {
  category?: string | null;
  skills?: string[] | null;
}

export interface JpCertificationEntry {
  name?: string | null;
  issuer?: string | null;
  date?: string | null;
  score?: string | null;
}

export interface JpResumeData {
  personal_info?: JpPersonalInfo | null;
  summary?: string | null;
  work_history?: JpWorkEntry[] | null;
  education?: JpEducationEntry[] | null;
  skills?: JpSkillEntry[] | null;
  certifications?: JpCertificationEntry[] | null;
  motivation?: string | null;
  strengths?: string | null;
  other?: string | null;
  projects?: JpProjectEntry[] | null;
}

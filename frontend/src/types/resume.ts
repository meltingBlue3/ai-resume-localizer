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
  hobbies: string | null;
}

export interface UploadAndExtractResponse {
  raw_text: string;
  cn_resume_data: CnResumeData;
}

from pydantic import BaseModel


class EducationEntry(BaseModel):
    school: str | None = None
    major: str | None = None
    degree: str | None = None
    start_date: str | None = None
    end_date: str | None = None


class WorkEntry(BaseModel):
    company: str | None = None
    position: str | None = None
    department: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    description: str | None = None


class SkillEntry(BaseModel):
    name: str | None = None
    level: str | None = None


class CertificationEntry(BaseModel):
    name: str | None = None
    date: str | None = None


class CnResumeData(BaseModel):
    # Personal
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    date_of_birth: str | None = None
    address: str | None = None
    nationality: str | None = None
    gender: str | None = None

    # Professional
    education: list[EducationEntry] | None = None
    work_experience: list[WorkEntry] | None = None
    skills: list[SkillEntry] | None = None
    certifications: list[CertificationEntry] | None = None
    languages: list[str] | None = None

    # Content
    self_introduction: str | None = None
    career_objective: str | None = None
    project_experience: list[WorkEntry] | None = None
    awards: list[str] | None = None
    other: str | None = None


# --- Japanese resume models (translated output) ---


class JpPersonalInfo(BaseModel):
    name: str | None = None
    name_katakana: str | None = None
    birth_date: str | None = None
    gender: str | None = None
    nationality: str | None = None
    address: str | None = None
    postal_code: str | None = None
    phone: str | None = None
    email: str | None = None


class JpEducationEntry(BaseModel):
    school: str | None = None
    degree: str | None = None
    major: str | None = None
    start_date: str | None = None
    end_date: str | None = None


class JpProjectEntry(BaseModel):
    name: str | None = None
    role: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    description: str | None = None
    technologies: list[str] | None = None


class JpWorkEntry(BaseModel):
    company: str | None = None
    title: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    location: str | None = None
    responsibilities: list[str] | None = None
    achievements: list[str] | None = None
    projects: list[JpProjectEntry] | None = None


class JpSkillEntry(BaseModel):
    category: str | None = None
    skills: list[str] | None = None


class JpCertificationEntry(BaseModel):
    name: str | None = None
    issuer: str | None = None
    date: str | None = None
    score: str | None = None


class JpResumeData(BaseModel):
    personal_info: JpPersonalInfo | None = None
    summary: str | None = None
    work_history: list[JpWorkEntry] | None = None
    education: list[JpEducationEntry] | None = None
    skills: list[JpSkillEntry] | None = None
    certifications: list[JpCertificationEntry] | None = None
    motivation: str | None = None
    strengths: str | None = None
    other: str | None = None
    projects: list[JpProjectEntry] | None = None

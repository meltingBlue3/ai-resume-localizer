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
    hobbies: str | None = None

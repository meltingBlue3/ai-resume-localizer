from pydantic import BaseModel

from app.models.resume import CnResumeData, JpResumeData


class UploadAndExtractResponse(BaseModel):
    raw_text: str
    cn_resume_data: CnResumeData


class TranslateRequest(BaseModel):
    cn_resume: CnResumeData


class TranslateResponse(BaseModel):
    jp_resume: JpResumeData

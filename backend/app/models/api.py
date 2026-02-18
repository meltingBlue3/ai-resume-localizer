from pydantic import BaseModel

from app.models.resume import CnResumeData


class UploadAndExtractResponse(BaseModel):
    raw_text: str
    cn_resume_data: CnResumeData

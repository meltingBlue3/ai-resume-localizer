import logging

import httpx
from fastapi import APIRouter, HTTPException, UploadFile

from app.config import settings
from app.models.api import UploadAndExtractResponse
from app.models.resume import CnResumeData
from app.services.dify_client import DifyClient, DifyWorkflowError
from app.services.ocr_service import OCRError, OCRService
from app.services.text_extractor import extract_text_from_docx, extract_text_from_pdf

logger = logging.getLogger(__name__)

router = APIRouter()

ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_OCR_FILE_SIZE = 5 * 1024 * 1024  # 5 MB for OCR processing


@router.post("/api/upload-and-extract", response_model=UploadAndExtractResponse)
async def upload_and_extract(file: UploadFile):
    """Accept a PDF or DOCX resume file, extract text, and return structured data via Dify."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type '{file.content_type}'. Upload PDF or DOCX.",
        )

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=422, detail="File exceeds 10 MB limit.")

    if file.content_type == "application/pdf":
        raw_text = extract_text_from_pdf(content)
    else:
        raw_text = extract_text_from_docx(content)

    # OCR detection and processing for image-based PDFs
    ocr_service = OCRService()
    if file.content_type == "application/pdf" and ocr_service.is_image_based(raw_text):
        logger.info("OCR processing triggered for image-based PDF")

        # Check file size for OCR
        if len(content) > MAX_OCR_FILE_SIZE:
            raise HTTPException(
                status_code=422,
                detail="File exceeds 5 MB limit for scanned document processing.",
            )

        try:
            raw_text = await ocr_service.process_pdf(content, raw_text)
        except OCRError as exc:
            error_msg = str(exc)
            logger.error("OCR failed: %s", error_msg)

            # Map OCR errors to appropriate HTTP status codes
            if "not installed" in error_msg.lower():
                raise HTTPException(
                    status_code=503,
                    detail="Scanned document processing is not available.",
                ) from exc
            elif "timed out" in error_msg.lower():
                raise HTTPException(
                    status_code=504,
                    detail="Scanned document processing timed out.",
                ) from exc
            else:
                raise HTTPException(
                    status_code=422,
                    detail=f"Could not extract text from scanned document: {error_msg}",
                ) from exc

    if not raw_text.strip():
        raise HTTPException(
            status_code=422,
            detail="No text could be extracted. The file may be empty or corrupted.",
        )

    if not settings.dify_extraction_api_key:
        raise HTTPException(
            status_code=503,
            detail="Dify extraction API key not configured. Set DIFY_EXTRACTION_API_KEY.",
        )

    client = DifyClient(
        api_key=settings.dify_extraction_api_key,
        base_url=settings.dify_base_url,
    )

    try:
        structured = await client.extract_resume(raw_text)
        cn_resume_data = CnResumeData.model_validate(structured)
    except DifyWorkflowError as exc:
        logger.error("Dify extraction failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except httpx.HTTPStatusError as exc:
        logger.error("Dify API HTTP error: %s", exc)
        raise HTTPException(
            status_code=502,
            detail=f"Dify API returned {exc.response.status_code}",
        ) from exc
    except httpx.TimeoutException as exc:
        logger.error("Dify API timeout: %s", exc)
        raise HTTPException(
            status_code=504, detail="Dify API request timed out"
        ) from exc
    finally:
        await client.close()

    return UploadAndExtractResponse(raw_text=raw_text, cn_resume_data=cn_resume_data)

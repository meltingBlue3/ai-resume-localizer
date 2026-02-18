import logging

import httpx
from fastapi import APIRouter, HTTPException

from app.config import settings
from app.models.api import TranslateRequest, TranslateResponse
from app.models.resume import JpResumeData
from app.services.dify_client import DifyClient, DifyWorkflowError

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/api/translate", response_model=TranslateResponse)
async def translate_resume(request: TranslateRequest):
    """Translate Chinese resume data to Japanese via Dify workflow."""
    if not settings.dify_translation_api_key:
        raise HTTPException(
            status_code=503,
            detail="Dify translation API key not configured. Set DIFY_TRANSLATION_API_KEY.",
        )

    client = DifyClient(
        api_key=settings.dify_translation_api_key,
        base_url=settings.dify_base_url,
    )

    try:
        cn_resume_json = request.cn_resume.model_dump_json()
        jp_resume_dict = await client.translate_resume(cn_resume_json)
        jp_resume = JpResumeData.model_validate(jp_resume_dict)
    except DifyWorkflowError as exc:
        logger.error("Dify translation failed: %s", exc)
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
            status_code=504, detail="Dify translation request timed out"
        ) from exc
    finally:
        await client.close()

    return TranslateResponse(jp_resume=jp_resume)

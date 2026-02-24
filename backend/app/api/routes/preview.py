"""Preview and download endpoints for rendered Japanese resume documents.

POST /api/preview/{doc_type}  - Returns rendered HTML (with inlined CSS) for iframe preview
POST /api/download/{doc_type} - Returns PDF bytes for file download
"""

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.models.api import PreviewRequest
from app.services.pdf_generator import generate_pdf
from app.services.template_renderer import render_document, render_document_for_preview

logger = logging.getLogger(__name__)

router = APIRouter()

TEMPLATE_MAP = {
    "rirekisho": "rirekisho.html",
    "shokumukeirekisho": "shokumukeirekisho.html",
}


@router.post("/api/preview/{doc_type}")
async def preview_document(doc_type: str, request: PreviewRequest):
    """Render a Japanese resume document as HTML for preview.

    Args:
        doc_type: Document type ('rirekisho' or 'shokumukeirekisho').
        request: PreviewRequest with jp_resume data and optional photo.

    Returns:
        JSON with 'html' key containing the rendered HTML string.
    """
    template_name = TEMPLATE_MAP.get(doc_type)
    if template_name is None:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown document type: {doc_type}. Must be one of: {', '.join(TEMPLATE_MAP.keys())}",
        )

    try:
        html = render_document_for_preview(
            template_name, request.jp_resume, request.photo_base64
        )
    except Exception:
        logger.exception("Template rendering failed for %s", doc_type)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to render {doc_type} template",
        )

    return {"html": html}


@router.post("/api/download/{doc_type}")
async def download_document(doc_type: str, request: PreviewRequest):
    """Render a Japanese resume document and return as PDF download.

    Args:
        doc_type: Document type ('rirekisho' or 'shokumukeirekisho').
        request: PreviewRequest with jp_resume data and optional photo.

    Returns:
        PDF file as application/pdf response with Content-Disposition header.
    """
    template_name = TEMPLATE_MAP.get(doc_type)
    if template_name is None:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown document type: {doc_type}. Must be one of: {', '.join(TEMPLATE_MAP.keys())}",
        )

    try:
        html = render_document(template_name, request.jp_resume, request.photo_base64)
    except Exception:
        logger.exception("Template rendering failed for %s", doc_type)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to render {doc_type} template",
        )

    try:
        pdf_bytes = await generate_pdf(html)
    except Exception:
        logger.exception("PDF generation failed for %s", doc_type)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate PDF for {doc_type}",
        )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{doc_type}.pdf"',
        },
    )

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.api.router import api_router
from app.services.pdf_generator import generate_pdf_from_template

app = FastAPI(title="AI Resume Localizer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

TEMPLATE_MAP = {
    "rirekisho": "rirekisho.html",
    "shokumukeirekisho": "shokumukeirekisho.html",
}


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/test-pdf/{template_name}")
async def test_pdf(template_name: str):
    """Generate and return a PDF for the given template (dev/test endpoint)."""
    filename = TEMPLATE_MAP.get(template_name)
    if filename is None:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown template '{template_name}'. Use: {', '.join(TEMPLATE_MAP)}",
        )
    pdf_bytes = generate_pdf_from_template(filename)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={template_name}.pdf"},
    )

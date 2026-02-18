---
phase: 02-upload-extraction
plan: 01
subsystem: api
tags: [pydantic, pymupdf, python-docx, httpx, dify, fastapi, typescript]

requires:
  - phase: 01-foundation
    provides: "FastAPI app scaffold, WeasyPrint PDF generation, Jinja2 templates"
provides:
  - "CnResumeData Pydantic model with all-nullable fields for Chinese resume data"
  - "TypeScript interfaces mirroring Pydantic models (EducationEntry, WorkEntry, etc.)"
  - "PDF and DOCX text extraction services (PyMuPDF + python-docx)"
  - "DifyClient async workflow wrapper with timeout handling"
  - "POST /api/upload-and-extract endpoint accepting PDF/DOCX → structured JSON"
  - "pydantic-settings config with Dify env var loading"
affects: [02-upload-extraction, 03-translation, 04-review-generation]

tech-stack:
  added: [pydantic-settings, PyMuPDF, python-docx, httpx]
  patterns: [pydantic-settings BaseSettings for config, async httpx for external APIs, APIRouter modular routing]

key-files:
  created:
    - backend/app/models/resume.py
    - backend/app/models/api.py
    - backend/app/services/text_extractor.py
    - backend/app/services/dify_client.py
    - backend/app/api/router.py
    - backend/app/api/routes/upload.py
    - frontend/src/types/resume.ts
  modified:
    - backend/app/config.py
    - backend/app/main.py
    - backend/requirements.txt
    - backend/.env.example

key-decisions:
  - "Backward-compatible config aliases (BASE_DIR, FONTS_DIR, TEMPLATES_DIR) preserved alongside new Settings class"
  - "DOCX extractor iterates both paragraphs and tables for Chinese resume table layouts"
  - "DifyClient uses 90s timeout (under Cloudflare 100s limit) with 10s connect timeout"
  - "Upload endpoint validates content-type, file size (10MB), and non-empty text extraction"

patterns-established:
  - "APIRouter pattern: modular routes in api/routes/ included via api/router.py"
  - "Pydantic all-nullable pattern: every field defaults to None for partial extraction"
  - "TypeScript interfaces mirror Pydantic models with snake_case field names"

duration: 4min
completed: 2026-02-18
---

# Phase 2 Plan 1: Upload Pipeline & Data Models Summary

**CnResumeData Pydantic/TypeScript data contract, PyMuPDF + python-docx text extraction, DifyClient async wrapper, and POST /api/upload-and-extract endpoint**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-18T18:32:28Z
- **Completed:** 2026-02-18T18:36:22Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- CnResumeData Pydantic model with 17 all-nullable fields spanning personal, professional, and content sections
- TypeScript interfaces exactly mirroring Python models for frontend type safety
- PDF text extraction via PyMuPDF with reading-order sort; DOCX extraction including table cell content
- DifyClient async wrapper with structured_resume JSON parsing and proper error handling
- POST /api/upload-and-extract endpoint with file type/size validation, empty-text rejection, and Dify error mapping to HTTP status codes
- pydantic-settings config with .env loading for Dify API credentials

## Task Commits

Each task was committed atomically:

1. **Task 1: Create data models, TypeScript types & expand config** - `d8909a1` (feat)
2. **Task 2: Text extraction services, Dify client & upload endpoint** - `9e42250` (feat)

## Files Created/Modified
- `backend/app/models/resume.py` - CnResumeData, EducationEntry, WorkEntry, SkillEntry, CertificationEntry Pydantic models
- `backend/app/models/api.py` - UploadAndExtractResponse API response model
- `backend/app/services/text_extractor.py` - extract_text_from_pdf and extract_text_from_docx functions
- `backend/app/services/dify_client.py` - DifyClient class with extract_resume async method
- `backend/app/api/router.py` - Central API router aggregating route modules
- `backend/app/api/routes/upload.py` - POST /api/upload-and-extract endpoint
- `backend/app/config.py` - Refactored to pydantic-settings with Dify env vars
- `backend/app/main.py` - Updated to include api_router
- `backend/requirements.txt` - Added pydantic-settings, PyMuPDF, python-docx, httpx
- `backend/.env.example` - Updated with DIFY_BASE_URL and DIFY_EXTRACTION_API_KEY
- `frontend/src/types/resume.ts` - TypeScript interfaces mirroring Pydantic models

## Decisions Made
- Preserved backward-compatible `BASE_DIR`/`FONTS_DIR`/`TEMPLATES_DIR` module-level aliases alongside the new `Settings` class to avoid breaking `pdf_generator.py` imports
- DOCX extractor iterates both `doc.paragraphs` and `doc.tables` since Chinese resumes heavily use table layouts
- DifyClient uses 90s request timeout (safely under Cloudflare's 100s limit) with 10s connect timeout
- Upload endpoint returns 422 for empty extracted text (scanned/image-based PDF), 503 if API key unconfigured, 502/504 for Dify errors

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- WeasyPrint cannot be imported in this PowerShell environment without MSYS2 DLL directory setup — this is a pre-existing runtime issue from Phase 1 (not caused by Phase 2 changes). Server startup and OpenAPI verification were done programmatically with mocked WeasyPrint imports.

## User Setup Required

**External services require manual configuration.** The plan's `user_setup` section specifies:
- `DIFY_BASE_URL` — defaults to `https://api.dify.ai/v1`
- `DIFY_EXTRACTION_API_KEY` — obtain from Dify Cloud → Studio → Your extraction workflow → API Access → API Key
- A Dify extraction workflow must be created with `resume_text` string input and `structured_resume` JSON output

## Next Phase Readiness
- Data contract (Pydantic + TypeScript) established for all downstream consumers
- Upload endpoint ready for frontend integration (Phase 2 Plan 2)
- Dify client ready for real workflow testing once API key configured
- Text extractors ready for both PDF and DOCX Chinese resume formats

---
*Phase: 02-upload-extraction*
*Completed: 2026-02-18*

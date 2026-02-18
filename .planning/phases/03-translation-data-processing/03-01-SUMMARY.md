---
phase: 03-translation-data-processing
plan: 01
subsystem: api
tags: [pydantic, fastapi, dify, translation, japanese-resume]

requires:
  - phase: 02-upload-extraction
    provides: CnResumeData model, DifyClient class, upload route pattern
provides:
  - JpResumeData Pydantic model with 9 top-level fields and Jp* nested models
  - TranslateRequest/TranslateResponse API models
  - DifyClient.translate_resume() async method
  - POST /api/translate endpoint registered in FastAPI router
  - DIFY_TRANSLATION_API_KEY config field and .env.example entry
affects: [03-translation-data-processing, 04-pdf-generation]

tech-stack:
  added: []
  patterns: [dify-workflow-reuse, model-mirror-pattern]

key-files:
  created:
    - backend/app/api/routes/translate.py
  modified:
    - backend/app/models/resume.py
    - backend/app/models/api.py
    - backend/app/config.py
    - backend/.env.example
    - backend/app/services/dify_client.py
    - backend/app/api/router.py

key-decisions:
  - "Used Python 3.10+ union syntax (str | None, list[...]) matching existing CnResumeData pattern"
  - "DifyClient.translate_resume() raises DifyWorkflowError (not HTTPException) — route handles HTTP conversion, matching extract_resume pattern"
  - "Translate route instantiates its own DifyClient with translation API key, same lifecycle as upload route"

patterns-established:
  - "Model mirror pattern: Jp* models mirror Cn* structure with Japanese-specific fields (name_katakana)"
  - "Workflow reuse: DifyClient.translate_resume() follows identical error/timeout pattern as extract_resume()"

duration: 4min
completed: 2026-02-18
---

# Phase 3 Plan 1: Translation Pipeline Backend Summary

**JpResumeData Pydantic models + POST /api/translate endpoint calling Dify translation workflow via DifyClient.translate_resume()**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-18
- **Completed:** 2026-02-18
- **Tasks:** 2
- **Files modified:** 7 (1 created, 6 modified)

## Accomplishments
- JpResumeData with 9 top-level fields (personal_info, summary, work_history, education, skills, certifications, motivation, strengths, other) and 5 nested Jp* models — all nullable
- JpPersonalInfo includes name_katakana field for katakana reading of Chinese names
- TranslateRequest/TranslateResponse API models providing the data contract for frontend integration
- DifyClient.translate_resume() with same timeout/error/JSON-parsing pattern as extract_resume()
- POST /api/translate endpoint: 503 for missing key, 502 for Dify errors, 504 for timeout

## Task Commits

Each task was committed atomically:

1. **Task 1: JpResumeData Pydantic models, API models, and config expansion** - `c57f7c8` (feat)
2. **Task 2: DifyClient.translate_resume(), POST /api/translate, router registration** - `28c1fc2` (feat)

## Files Created/Modified
- `backend/app/models/resume.py` - JpPersonalInfo, JpEducationEntry, JpWorkEntry, JpSkillEntry, JpCertificationEntry, JpResumeData models
- `backend/app/models/api.py` - TranslateRequest and TranslateResponse models
- `backend/app/config.py` - dify_translation_api_key setting
- `backend/.env.example` - DIFY_TRANSLATION_API_KEY entry
- `backend/app/services/dify_client.py` - translate_resume() async method on DifyClient
- `backend/app/api/routes/translate.py` - POST /api/translate route handler
- `backend/app/api/router.py` - translate_router registration

## Decisions Made
- Used Python 3.10+ syntax (`str | None`, `list[...]`) matching existing CnResumeData pattern — plan suggested `Optional[str]`/`List[...]` but consistency with existing code is better
- DifyClient.translate_resume() raises DifyWorkflowError (not HTTPException) to match extract_resume() pattern — route handles HTTP conversion at the API layer
- Translate route creates its own DifyClient instance with the translation API key, following upload route lifecycle pattern (create → use → close)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Matched existing DifyClient pattern instead of plan's inline HTTPException pattern**
- **Found during:** Task 2 (DifyClient.translate_resume implementation)
- **Issue:** Plan specified HTTPException inside DifyClient and inline httpx.AsyncClient — existing DifyClient uses self._http and raises DifyWorkflowError
- **Fix:** Implemented translate_resume() following extract_resume() pattern: uses self._http, raises DifyWorkflowError, route converts to HTTPException
- **Files modified:** backend/app/services/dify_client.py, backend/app/api/routes/translate.py
- **Verification:** Imports succeed, route appears in OpenAPI paths list
- **Committed in:** 28c1fc2 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 consistency fix)
**Impact on plan:** Necessary for architectural consistency. No scope creep.

## Issues Encountered
None

## User Setup Required

**External services require manual configuration:**
- `DIFY_TRANSLATION_API_KEY` — Obtain from Dify Cloud → Studio → Your translation workflow → API Access → API Key
- Dify translation workflow must accept `cn_resume_json` (string) input and output `jp_resume_json` (string containing valid JSON)
- Workflow should translate all Chinese resume fields to natural Japanese business language with keigo

## Next Phase Readiness
- POST /api/translate endpoint ready for frontend integration
- JpResumeData model available for PDF generation in Phase 4
- Endpoint requires DIFY_TRANSLATION_API_KEY to be set (returns 503 otherwise)

## Self-Check: PASSED

- All 7 files verified present on disk
- Commit c57f7c8 (Task 1) verified in git log
- Commit 28c1fc2 (Task 2) verified in git log

---
*Phase: 03-translation-data-processing*
*Completed: 2026-02-18*

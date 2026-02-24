---
phase: 12-replace-weasyprint-with-playwright
plan: 01
subsystem: infra
tags: [playwright, pdf, chromium, docker]

# Dependency graph
requires: []
provides:
  - PDF generation using Playwright headless Chrome
  - Simplified Docker image without GTK/Pango dependencies
affects: []

# Tech tracking
tech-stack:
  added: [playwright]
  patterns: [async PDF generation, headless browser rendering]

key-files:
  created: []
  modified:
    - backend/requirements.txt
    - backend/Dockerfile
    - backend/app/services/pdf_generator.py
    - backend/app/api/routes/preview.py

key-decisions:
  - "Use Playwright async API (not sync) for FastAPI compatibility"

patterns-established:
  - "Async PDF generation: FastAPI async endpoints require async Playwright API to avoid event loop conflicts"

requirements-completed: []

# Metrics
duration: 25min
completed: 2026-02-24
---

# Phase 12 Plan 01: Replace WeasyPrint with Playwright Summary

**Replaced WeasyPrint with Playwright for PDF generation, using async API for FastAPI compatibility and eliminating complex GTK/Pango dependencies.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-02-24T08:00:00Z
- **Completed:** 2026-02-24T08:25:00Z
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments

- Replaced WeasyPrint dependency with Playwright in requirements.txt
- Updated Dockerfile to install Playwright chromium with system dependencies
- Rewrote pdf_generator.py to use Playwright headless Chrome for PDF rendering
- Fixed async API requirement for FastAPI compatibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Update requirements.txt** - `1f11db3` (feat)
2. **Task 2: Update Dockerfile** - `df974ca` (feat)
3. **Task 3: Rewrite pdf_generator.py** - `f529451` (feat)
4. **Task 4: Verify PDF generation works** - User approved

**Auto-fix:** `dc3f602` (fix) - Use async API for FastAPI compatibility

## Files Created/Modified

- `backend/requirements.txt` - Replaced weasyprint with playwright dependency
- `backend/Dockerfile` - Removed GTK/Pango packages, added playwright install chromium --with-deps
- `backend/app/services/pdf_generator.py` - Complete rewrite using Playwright async API
- `backend/app/api/routes/preview.py` - Updated to use await for async generate_pdf()

## Decisions Made

- **Use Playwright async API (not sync)** - FastAPI endpoints run in async context; sync Playwright calls would cause "This event loop is already running" errors. Changed from `sync_playwright` to `async_playwright` and made all functions async.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Playwright sync API incompatible with FastAPI**
- **Found during:** Task 3 (pdf_generator.py implementation)
- **Issue:** Plan specified `sync_playwright` API, but FastAPI runs endpoints in asyncio event loop. Sync Playwright creates nested event loops which fail with "This event loop is already running" error.
- **Fix:** Changed to async Playwright API (`async_playwright`), made `generate_pdf()` and `generate_pdf_from_template()` async functions, updated caller in preview.py to await the result.
- **Files modified:** backend/app/services/pdf_generator.py, backend/app/api/routes/preview.py
- **Verification:** Docker build succeeds, PDF generation works correctly
- **Committed in:** dc3f602

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for FastAPI compatibility. API contract preserved (same function signature, now async).

## Issues Encountered

None - all issues resolved via auto-fix deviation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 12 is complete. The PDF generation system now uses Playwright with:
- Simpler Docker image (no complex GTK/Pango dependencies)
- Better CSS rendering support via Chromium
- Same HTML templates work unchanged
- A4 format with print_background enabled
- CJK fonts via fonts-noto-cjk system package

---
*Phase: 12-replace-weasyprint-with-playwright*
*Completed: 2026-02-24*

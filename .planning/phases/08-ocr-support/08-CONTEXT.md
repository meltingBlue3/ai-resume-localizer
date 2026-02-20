# Phase 8: OCR Support - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable users with scanned or image-based PDF resumes to complete the full conversion flow with no special steps. OCR preprocessing happens invisibly before text is passed to Dify — no separate code path or UI change required.

</domain>

<decisions>
## Implementation Decisions

### OCR Provider
- Tesseract (self-hosted) — no cloud services
- Cost-minimized approach — prefer free/self-hosted over paid accuracy
- Language support: Chinese (Simplified/Traditional), Japanese, English only

### PDF Classification
- Detection method: Text length threshold (100 characters)
- If extracted text is under 100 chars, treat as image-based and run OCR
- Mixed PDF handling: Full OCR if any page triggers threshold (not per-page)
- Log classification results for debugging and analytics

### Error Handling
- OCR failure: Fail with clear error message to user
- Low-confidence results: Not applicable (Tesseract doesn't provide confidence scores)
- Timeout handling: Fail and notify user
- User-facing errors: Specific messages (e.g., "OCR failed", "PDF unreadable") for debugging

### Performance UX
- OCR timeout: 30 seconds
- Loading message: Keep generic — don't expose "OCR" to user
- Progress indication: Show progress bar or "Extracting text..." during OCR
- File size limit: 5MB max for OCR processing

### Claude's Discretion
- Exact Tesseract integration approach and library choice
- Progress bar implementation details
- Error message copy refinement
- Logging format and storage

</decisions>

<specifics>
## Specific Ideas

- User doesn't need to know OCR is happening — it should feel like normal processing
- Keep the flow identical whether PDF is text-based or scanned

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-ocr-support*
*Context gathered: 2026-02-20*

---
phase: 12-ocr-docker
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/Dockerfile
autonomous: true
requirements: []
must_haves:
  truths:
    - "Docker container builds successfully with OCR dependencies"
    - "Tesseract binary is available in the container"
    - "pdf2image can convert PDFs to images (poppler available)"
  artifacts:
    - path: "backend/Dockerfile"
      provides: "Container with tesseract-ocr and poppler-utils"
      contains: "tesseract-ocr"
  key_links:
    - from: "backend/Dockerfile"
      to: "pytesseract"
      via: "system binary"
      pattern: "tesseract-ocr"
---

<objective>
Add OCR system dependencies to the backend Docker container.

Purpose: Enable pytesseract and pdf2image to function in Docker environment.
Output: Updated Dockerfile with tesseract-ocr, language packs, and poppler-utils.
</objective>

<execution_context>
@C:/Users/zhang/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

## Current Backend Dockerfile

The backend uses `python:3.12-slim` with WeasyPrint dependencies. OCR Python packages (pytesseract, pdf2image, Pillow) are installed via requirements.txt, but system binaries are missing.

## Missing Dependencies

For OCR to work in Docker:
- `tesseract-ocr` - Tesseract binary
- `tesseract-ocr-jpn` - Japanese language data
- `tesseract-ocr-chi-sim` - Simplified Chinese language data
- `poppler-utils` - Required by pdf2image for PDF-to-image conversion
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add OCR system dependencies to Dockerfile</name>
  <files>backend/Dockerfile</files>
  <action>
Update the `apt-get install` command in backend/Dockerfile to include OCR dependencies:

Add to the existing apt-get install packages:
- `tesseract-ocr` — Tesseract OCR binary
- `tesseract-ocr-jpn` — Japanese language data (for Japanese resume generation)
- `tesseract-ocr-chi-sim` — Simplified Chinese language data (for Chinese resume input)
- `poppler-utils` — Required by pdf2image for PDF-to-image conversion

The packages should be added to the existing RUN apt-get command (lines 4-16), NOT as a separate layer. Keep `--no-install-recommends` flag and `rm -rf /var/lib/apt/lists/*` cleanup.

Example structure:
```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 \
    # ... existing packages ...
    fonts-noto-cjk-extra \
    gcc \
    # Add OCR packages here:
    tesseract-ocr \
    tesseract-ocr-jpn \
    tesseract-ocr-chi-sim \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*
```
  </action>
  <verify>
# Verify Dockerfile contains OCR packages
grep -E "tesseract-ocr|poppler-utils" backend/Dockerfile
  </verify>
  <done>
Dockerfile updated with tesseract-ocr, tesseract-ocr-jpn, tesseract-ocr-chi-sim, and poppler-utils in the apt-get install command.
</done>
</task>

<task type="auto">
  <name>Task 2: Verify Docker build succeeds</name>
  <files>backend/Dockerfile</files>
  <action>
Build the backend Docker image to verify all dependencies install correctly:

```bash
docker build -t ai-resume-backend:test ./backend
```

After successful build, verify Tesseract is available:
```bash
docker run --rm ai-resume-backend:test tesseract --version
```

Verify Japanese language pack is installed:
```bash
docker run --rm ai-resume-backend:test tesseract --list-langs
```

Expected output should include `jpn` and `chi_sim` in the language list.

Clean up test image:
```bash
docker rmi ai-resume-backend:test
```
  </action>
  <verify>
# Build should complete without errors
docker build -t ai-resume-backend:test ./backend && echo "BUILD_SUCCESS"
  </verify>
  <done>
Docker image builds successfully, tesseract --version shows version info, and tesseract --list-langs includes jpn and chi_sim.
</done>
</task>

</tasks>

<verification>
- Dockerfile contains tesseract-ocr packages
- Docker build completes without errors
- Tesseract binary is accessible in container
- Japanese (jpn) and Chinese (chi_sim) language packs are available
</verification>

<success_criteria>
Docker container builds successfully with all OCR system dependencies installed and functional.
</success_criteria>

<output>
After completion, create `.planning/quick/12-ocr-docker/12-SUMMARY.md`
</output>

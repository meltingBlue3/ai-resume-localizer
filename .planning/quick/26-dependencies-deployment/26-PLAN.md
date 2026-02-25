---
phase: 26-dependencies-deployment
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - docs/dependencies.md
  - docs/deployment.md
autonomous: true
requirements: []
must_haves:
  truths:
    - "Developer can see all frontend dependencies with versions and purposes"
    - "Developer can see all backend dependencies with versions and purposes"
    - "Developer can deploy the application using Docker Compose"
    - "Developer knows which environment variables are required"
  artifacts:
    - path: "docs/dependencies.md"
      provides: "Complete dependency reference"
    - path: "docs/deployment.md"
      provides: "Deployment guide with Docker Compose"
  key_links: []
---

<objective>
Create two documentation files for project maintainability: a dependencies reference and a deployment guide.

Purpose: Enable developers to understand the tech stack and deploy the application independently.
Output: docs/dependencies.md, docs/deployment.md
</objective>

<execution_context>
@C:/Users/zhang/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md

# Source files for documentation
@backend/requirements.txt
@frontend/package.json
@docker-compose.yml
@backend/Dockerfile
@frontend/Dockerfile
@backend/.env.example
@backend/app/config.py
</context>

<tasks>

<task type="auto">
  <name>Create dependencies documentation</name>
  <files>docs/dependencies.md</files>
  <action>
Create `docs/dependencies.md` documenting all project dependencies organized by layer:

**Frontend Dependencies** (from frontend/package.json):
- Production dependencies: react, react-dom, react-router, zustand, i18next, react-i18next, i18next-browser-languagedetector, react-dropzone, react-easy-crop, react-pdf, docx-preview, @radix-ui/react-tooltip
- Dev dependencies: vite, @vitejs/plugin-react, typescript, @types/react, @types/react-dom, tailwindcss, @tailwindcss/vite
- For each: include version number and brief purpose (1 line)

**Backend Dependencies** (from backend/requirements.txt):
- fastapi, uvicorn - API framework
- jinja2 - Template engine for PDF generation
- playwright - Headless browser for PDF rendering
- python-multipart - File upload handling
- pydantic-settings - Configuration management
- httpx - HTTP client for Dify API calls
- PyMuPDF, pypdf, pdf2image, Pillow - PDF/image processing
- python-docx - DOCX file parsing
- pytesseract - OCR for scanned documents
- pytest, pytest-asyncio - Testing

**System Dependencies** (from backend/Dockerfile):
- fonts-noto-cjk - CJK font support
- tesseract-ocr, tesseract-ocr-jpn, tesseract-ocr-chi-sim - OCR engines
- poppler-utils - PDF utilities

Use markdown tables for readability. Follow existing docs/ file style.
  </action>
  <verify>cat docs/dependencies.md | head -50</verify>
  <done>Complete dependency reference with all frontend, backend, and system dependencies documented</done>
</task>

<task type="auto">
  <name>Create deployment documentation</name>
  <files>docs/deployment.md</files>
  <action>
Create `docs/deployment.md` with Docker Compose deployment guide:

**Prerequisites**:
- Docker and Docker Compose installed
- Dify Cloud account with API keys

**Environment Variables** (from backend/.env.example and config.py):
- DIFY_BASE_URL - Dify API endpoint (default: https://api.dify.ai/v1)
- DIFY_EXTRACTION_API_KEY - Dify workflow key for resume extraction
- DIFY_TRANSLATION_API_KEY - Dify workflow key for translation

**Deployment Steps**:
1. Clone repository
2. Create `.env` file in project root with required variables
3. Run `docker-compose up --build`
4. Access at http://localhost:3000

**Architecture Notes**:
- Backend runs on port 8000 (internal)
- Frontend nginx serves on port 3000 (external)
- Frontend proxies /api/* requests to backend via nginx

**Development Mode** (alternative to Docker):
- Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
- Frontend: `cd frontend && npm install && npm run dev`
- Access frontend dev server at http://localhost:5173

**Troubleshooting**:
- Playwright browser install: handled automatically in Dockerfile
- Font issues: fonts-noto-cjk provides CJK support
- OCR errors: ensure tesseract language packs are installed

Keep it concise and actionable. Follow existing docs/ file style.
  </action>
  <verify>cat docs/deployment.md</verify>
  <done>Complete deployment guide with prerequisites, environment config, Docker steps, and troubleshooting</done>
</task>

</tasks>

<verification>
- [ ] docs/dependencies.md exists and lists all dependencies
- [ ] docs/deployment.md exists with Docker Compose instructions
- [ ] Environment variables documented
</verification>

<success_criteria>
Two comprehensive documentation files created enabling developers to understand dependencies and deploy independently.
</success_criteria>

<output>
After completion, create `.planning/quick/26-dependencies-deployment/26-SUMMARY.md`
</output>

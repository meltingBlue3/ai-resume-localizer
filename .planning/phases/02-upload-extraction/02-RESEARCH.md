# Phase 2: Upload & Extraction - Research

**Researched:** 2026-02-18
**Domain:** File upload, text extraction, Dify AI extraction workflow, document preview, side-by-side editing
**Confidence:** HIGH

## Summary

Phase 2 implements the first active step of the wizard: the user uploads a Chinese resume (PDF or DOCX) with an optional photo, the system extracts structured Chinese JSON via a Dify extraction workflow, and the user reviews/edits the extracted data in a side-by-side view before proceeding to translation.

The phase spans three distinct technical layers: (1) frontend file upload UX with drag-and-drop via react-dropzone, (2) backend text extraction pipeline using PyMuPDF for PDFs and python-docx for DOCX files followed by a Dify workflow API call in blocking mode, and (3) a dual-panel review UI that displays the original document on the left (react-pdf for PDFs, docx-preview for DOCX) alongside an editable structured form on the right. The Zustand store must be upgraded from the Phase 1 placeholder (`stepData: Record<number, unknown>`) to a typed resume data store holding file blobs, extraction results, and loading/error state.

The key architectural decision is **backend-side text extraction before Dify** (not uploading files directly to Dify). This separates concerns: if extraction fails, it's a PyMuPDF/python-docx issue; if structuring fails, it's a Dify/LLM issue. It also lets us display the raw extracted text to the user and resubmit to Dify with corrections if needed. The Dify workflow receives plain text and returns structured Chinese JSON conforming to the canonical resume schema with missing fields as null.

**Primary recommendation:** Build in three plans: (1) file upload UI + backend upload endpoint with text extraction, (2) Dify extraction workflow integration + resume data schema, (3) side-by-side review/edit UI with document preview.

## Standard Stack

### Core (Phase 2 Additions)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-dropzone | 14.4.x | Drag-and-drop file upload UX | `useDropzone` hook provides drag state, file validation, accessibility. 3.4M weekly downloads. Use v14.4.x — v15.0.0 has breaking `isDragReject` change. |
| react-pdf | 10.3.0 | Display uploaded PDF in browser | `Document` + `Page` components render PDFs via pdfjs-dist. 2.9M weekly downloads. Supports blob URLs for user-uploaded files. |
| docx-preview | 0.3.7 | Render DOCX as HTML in browser | `renderAsync()` converts DOCX ArrayBuffer to HTML in a container. 183K weekly downloads. Preserves formatting, supports page breaks. |
| PyMuPDF | 1.27.1 | PDF text extraction (backend) | `page.get_text("text", sort=True)` extracts text in reading order. Handles Chinese text natively. AGPL license — acceptable for server-side use. |
| python-docx | 1.1.x | DOCX text extraction (backend) | Iterate `paragraphs` + `tables` to extract text. Only handles .docx (not .doc). |
| httpx | 0.28.x | Async HTTP client for Dify API | Async-native, 90s timeout for blocking workflow calls. Drop-in replacement for requests with `await` support. |

### Existing (From Phase 1 — No Changes)

| Library | Version | Purpose |
|---------|---------|---------|
| React | 19.2.x | Frontend UI framework |
| Vite | 7.3.x | Build tool + dev server |
| Tailwind CSS | 4.x | UI styling |
| Zustand | 5.0.x | State management (store must be expanded) |
| react-i18next | 16.x | Bilingual UI |
| FastAPI | 0.115.8 | Backend API framework |
| python-multipart | 0.0.20 | Already installed — required for UploadFile |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-dropzone | Native `<input type="file">` | No drag-and-drop, no drag state feedback, worse accessibility. react-dropzone is worth the 8KB. |
| react-pdf (wojtekmaj) | @react-pdf/renderer | Different library — @react-pdf/renderer creates PDFs, doesn't display them. Use wojtekmaj/react-pdf for viewing. |
| docx-preview | mammoth.js | mammoth converts DOCX to simplified HTML (loses formatting). docx-preview preserves layout more faithfully for preview purposes. |
| PyMuPDF (server-side) | pdf.js (client-side) | Client-side extraction means sending extracted text back to server for Dify. Server-side is simpler and keeps the pipeline on one side. |
| Backend text extraction → Dify text input | Upload file to Dify `/files/upload` → pass `upload_file_id` | Dify file upload works but couples extraction to Dify's internal parser. Backend extraction gives more control, better error diagnosis, and the ability to show raw text. |
| httpx | aiohttp | aiohttp has a different API style. httpx mirrors requests' API with async support — better DX for this use case. |

### Installation (Phase 2 Additions)

```bash
# Frontend
cd frontend
npm install react-dropzone@14 react-pdf docx-preview

# Backend
cd ../backend
pip install PyMuPDF==1.27.1 python-docx httpx==0.28.1
```

## Architecture Patterns

### Recommended Project Structure (Phase 2 Additions)

```
ai-resume-localizer/
├── frontend/src/
│   ├── api/
│   │   └── client.ts              # NEW: Typed API client (fetch wrapper)
│   ├── components/
│   │   ├── upload/
│   │   │   ├── FileDropzone.tsx    # NEW: Reusable dropzone component
│   │   │   └── PhotoDropzone.tsx   # NEW: Photo upload with preview
│   │   └── review/
│   │       ├── DocumentViewer.tsx  # NEW: PDF/DOCX viewer (left panel)
│   │       └── ResumeFieldEditor.tsx # NEW: Editable form (right panel)
│   ├── steps/
│   │   ├── UploadStep.tsx         # REPLACE: Real upload UI
│   │   └── ReviewExtractionStep.tsx # REPLACE: Side-by-side view
│   ├── stores/
│   │   └── useResumeStore.ts      # NEW: Typed resume data store
│   └── types/
│       └── resume.ts              # NEW: TypeScript interfaces for schema
├── backend/app/
│   ├── api/
│   │   ├── router.py              # NEW: Aggregate route modules
│   │   └── routes/
│   │       └── upload.py          # NEW: POST /api/upload-and-extract
│   ├── services/
│   │   ├── text_extractor.py      # NEW: PDF/DOCX → plain text
│   │   └── dify_client.py         # NEW: Dify workflow API wrapper
│   └── models/
│       ├── resume.py              # NEW: Pydantic resume data models
│       └── api.py                 # NEW: Request/response models
```

### Pattern 1: Backend Text Extraction → Dify Workflow (Separation of Concerns)

**What:** The backend extracts plain text from the uploaded file (PyMuPDF for PDF, python-docx for DOCX) and sends it to the Dify extraction workflow as a string input. The backend does NOT upload files to Dify.

**Why:** Separating text extraction from AI structuring enables independent debugging, lets us display raw text to the user, and avoids coupling to Dify's internal document parser.

**Data flow:**
```
Frontend                    Backend                         Dify Cloud
   │                           │                               │
   │  POST /api/upload-and-    │                               │
   │  extract (multipart)      │                               │
   │ ────────────────────────→ │                               │
   │                           │  1. Detect file type          │
   │                           │  2. Extract text              │
   │                           │     (PyMuPDF or python-docx)  │
   │                           │  3. POST /v1/workflows/run    │
   │                           │     { resume_text: "..." }    │
   │                           │ ────────────────────────────→ │
   │                           │                               │
   │                           │  4. { cn_json }               │
   │                           │ ←──────────────────────────── │
   │  5. { raw_text,           │                               │
   │       cn_resume_data }    │                               │
   │ ←──────────────────────── │                               │
```

**Example:**

```python
# backend/app/api/routes/upload.py
from fastapi import APIRouter, UploadFile, HTTPException
from app.services.text_extractor import extract_text
from app.services.dify_client import DifyClient

router = APIRouter()

@router.post("/api/upload-and-extract")
async def upload_and_extract(file: UploadFile):
    if file.content_type not in (
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ):
        raise HTTPException(400, "Only PDF and DOCX files are accepted")

    content = await file.read()
    raw_text = extract_text(content, file.content_type)

    dify = DifyClient()
    cn_resume_data = await dify.extract_resume(raw_text)

    return {"raw_text": raw_text, "cn_resume_data": cn_resume_data}
```

### Pattern 2: Typed Zustand Store with Resume Data Slices

**What:** Replace the Phase 1 generic `stepData: Record<number, unknown>` with a fully typed store holding file blobs, extraction results, and UI state. Keep wizard navigation and resume data in the same store but organized into clear slices.

**Why:** The wizard step navigation and resume data are tightly coupled — step gates depend on whether data exists. A single store avoids cross-store synchronization bugs.

**Example:**

```typescript
// stores/useResumeStore.ts
import { create } from 'zustand';
import type { CnResumeData } from '../types/resume';

interface ResumeState {
  // Wizard navigation
  currentStep: number;
  totalSteps: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Upload state
  resumeFile: File | null;
  photoFile: File | null;
  setResumeFile: (file: File | null) => void;
  setPhotoFile: (file: File | null) => void;

  // Extraction state
  rawText: string | null;
  cnResumeData: CnResumeData | null;
  isExtracting: boolean;
  extractionError: string | null;
  setExtractionResult: (rawText: string, data: CnResumeData) => void;
  setCnResumeData: (data: CnResumeData) => void;
  setExtracting: (loading: boolean) => void;
  setExtractionError: (error: string | null) => void;
}
```

### Pattern 3: Conditional Document Viewer (PDF vs DOCX)

**What:** A single `DocumentViewer` component accepts a file blob and renders it using react-pdf for PDFs or docx-preview for DOCX, based on file type detection.

**Why:** The side-by-side review step needs to show the original document regardless of format. A unified component simplifies the ReviewExtractionStep.

**Example:**

```typescript
// components/review/DocumentViewer.tsx
import { Document, Page, pdfjs } from 'react-pdf';
import { renderAsync } from 'docx-preview';

interface Props {
  file: File;
}

export function DocumentViewer({ file }: Props) {
  if (file.type === 'application/pdf') {
    const url = URL.createObjectURL(file);
    return (
      <Document file={url}>
        <Page pageNumber={1} />
      </Document>
    );
  }

  // DOCX: render into a container ref
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    file.arrayBuffer().then(buffer => {
      if (containerRef.current) {
        renderAsync(buffer, containerRef.current);
      }
    });
  }, [file]);

  return <div ref={containerRef} />;
}
```

### Pattern 4: Side-by-Side Layout with Tailwind

**What:** The ReviewExtractionStep uses a two-column grid layout: original document on the left (scrollable), editable form on the right (scrollable independently).

**Why:** Users need to cross-reference the original document while reviewing extracted fields. Independent scrolling is critical when the form is longer than the document.

**Example:**

```tsx
// Side-by-side layout
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-16rem)]">
  {/* Left: original document */}
  <div className="overflow-y-auto rounded-lg border border-slate-200 bg-white p-4">
    <DocumentViewer file={resumeFile} />
  </div>

  {/* Right: editable form */}
  <div className="overflow-y-auto rounded-lg border border-slate-200 bg-white p-4">
    <ResumeFieldEditor data={cnResumeData} onChange={setCnResumeData} />
  </div>
</div>
```

### Anti-Patterns to Avoid

- **Uploading files directly to Dify instead of extracting text on backend:** Couples text extraction to Dify's parser, can't show raw text to user, can't diagnose extraction vs AI issues separately. Extract on backend, send text to Dify.
- **Using Dify streaming mode for structured JSON output:** Partial JSON is invalid and can't be meaningfully displayed. Use blocking mode with a loading indicator.
- **Storing file blobs in the backend or a database:** The backend is stateless. Store file blobs in the frontend Zustand store for preview display. Only send the file once via the upload endpoint.
- **Using a single dropzone for both resume and photo:** Different validation rules (file types, sizes, counts). Separate dropzones provide clearer UX and simpler state management.
- **Building the review UI before the extraction pipeline works:** The review UI depends on having real extracted data to display. Build the extraction pipeline first, test with mock/real data, then build the review UI.
- **Using `Record<string, unknown>` for resume data types:** The resume schema is the contract between frontend, backend, and Dify. Use precise TypeScript interfaces and Pydantic models. Type safety catches mismatches early.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop file upload | Custom drag event handlers | react-dropzone `useDropzone` hook | Handles drag states, file validation, keyboard accessibility, edge cases (multiple drops, drag leave). |
| PDF rendering in browser | Canvas-based custom PDF viewer | react-pdf (`Document` + `Page`) | Wraps pdfjs-dist with React lifecycle management, pagination, zoom, text layer. |
| DOCX rendering in browser | Custom DOCX parser/renderer | docx-preview `renderAsync()` | Parses OpenXML, handles styles, tables, images, page breaks. DOCX format is deeply complex. |
| PDF text extraction | Custom PDF parser | PyMuPDF `page.get_text()` | Handles fonts, encodings, layout analysis, CJK characters. PDF parsing is notoriously hard. |
| DOCX text extraction | Custom XML parser | python-docx `Document.paragraphs` + `tables` | Handles the OpenXML zip format, paragraph/table structure, embedded objects. |
| Dify API client | Raw fetch/httpx calls scattered in routes | Centralized `DifyClient` class with httpx | Encapsulates auth, timeouts, error handling, response parsing. Single place to update if API changes. |
| File type validation | Extension-based checking | MIME type from `UploadFile.content_type` + magic bytes | Extensions can be spoofed. FastAPI's UploadFile provides the browser-reported MIME type; backend should verify with content sniffing for security. |

**Key insight:** Every "simple" thing in this phase (PDF parsing, DOCX rendering, drag-and-drop) is actually deeply complex when you hit edge cases. Libraries save weeks of debugging.

## Common Pitfalls

### Pitfall 1: react-pdf Worker Configuration with Vite 7.x

**What goes wrong:** PDF viewer shows blank or throws "Setting up fake worker failed" error in production builds.
**Why it happens:** react-pdf requires pdfjs-dist web worker. Vite 7.1.0+ has a regression where `new URL()` expressions with line breaks don't bundle the worker asset correctly.
**How to avoid:** Configure the worker as a single-line expression at app initialization:
```typescript
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
```
Also import the required CSS: `import 'react-pdf/dist/Page/TextLayer.css'` and `import 'react-pdf/dist/Page/AnnotationLayer.css'`.
**Warning signs:** Works in dev mode but breaks in production build. Blank PDF viewer with no console errors.

### Pitfall 2: DOCX renderAsync Memory Leak

**What goes wrong:** Memory usage grows when users navigate back and forth between steps, re-rendering DOCX previews.
**Why it happens:** `docx-preview.renderAsync()` appends HTML to the container. If the React effect re-runs without clearing the container, HTML accumulates. Also, no explicit cleanup function is provided.
**How to avoid:** Clear the container before each render: `container.innerHTML = ''`. Use React's cleanup function to clear on unmount. Memoize the file reference to prevent unnecessary re-renders.
**Warning signs:** DOM element count growing on step navigation. Sluggish UI after navigating back and forth.

### Pitfall 3: Dify Workflow 100-Second Cloudflare Timeout

**What goes wrong:** Dify API call in blocking mode times out for complex resumes, returning a Cloudflare 524 error instead of Dify's structured response.
**Why it happens:** Dify Cloud uses Cloudflare with a 100-second timeout for blocking mode. Complex resumes with many sections may take the LLM longer to process.
**How to avoid:** Set httpx client timeout to 90 seconds (leaving 10s buffer). If extraction regularly exceeds 60s, consider: (a) simplifying the Dify workflow prompt, (b) splitting extraction into smaller calls, or (c) switching to streaming mode with progress updates.
**Warning signs:** Intermittent timeout errors, especially for longer resumes. Error response is HTML (Cloudflare error page) instead of JSON.

### Pitfall 4: python-docx Missing Table Content

**What goes wrong:** Extracted text from DOCX resumes is missing content that appears in tables (common in Chinese resume templates).
**Why it happens:** Iterating only `document.paragraphs` skips text inside table cells. Chinese resumes frequently use tables for layout (name/phone side-by-side, education in grid format).
**How to avoid:** Extract from BOTH paragraphs AND tables. Process in document order (not paragraphs-first then tables):
```python
from docx import Document

def extract_docx_text(content: bytes) -> str:
    doc = Document(io.BytesIO(content))
    text_parts = []
    for para in doc.paragraphs:
        if para.text.strip():
            text_parts.append(para.text)
    for table in doc.tables:
        for row in table.rows:
            row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
            if row_text:
                text_parts.append(" | ".join(row_text))
    return "\n".join(text_parts)
```
**Warning signs:** Missing phone numbers, addresses, or education details that are visible in the DOCX file.

### Pitfall 5: File Blob Lost on Page Refresh

**What goes wrong:** User uploads a file, extraction succeeds, user navigates to review step — then refreshes the page. The extracted data might be recoverable (if Zustand persist is used) but the file blob is gone. The document preview is broken.
**Why it happens:** `File` objects cannot be serialized to JSON/sessionStorage. Zustand's `persist` middleware only saves serializable state.
**How to avoid:** Accept that file blobs are lost on refresh. Options: (a) show a message asking the user to re-upload, (b) store only the extraction result (JSON) in persist and skip document preview after refresh, (c) don't use persist middleware and accept full state loss on refresh. For a single-session wizard, option (c) is simplest and most honest.
**Warning signs:** Zustand persist errors about unserializable data. Broken document viewer after page refresh.

### Pitfall 6: Chinese Resume Format Variation

**What goes wrong:** The Dify extraction workflow works for some resumes but produces poor results for others — missing fields, wrong field mapping, or garbled data.
**Why it happens:** Chinese resumes have no standardized format (unlike Japan's JIS 履歴書). They use varying layouts: single-column, two-column, table-based, creative designs. Section headers vary (工作经历 vs 职业经历 vs 工作经验). Some use traditional characters (繁體), some simplified (简体).
**How to avoid:** Design the Dify extraction prompt to be robust: list all common section header variants, handle both simplified and traditional Chinese, use a strict JSON output schema with field descriptions. Test with 5-10 diverse real Chinese resumes during development.
**Warning signs:** Extraction quality varies wildly between resumes. Fields appear in wrong schema positions. Null fields that clearly have data in the source.

### Pitfall 7: FastAPI UploadFile Reading Twice

**What goes wrong:** Trying to read the uploaded file content after already reading it returns empty bytes.
**Why it happens:** `UploadFile` uses a `SpooledTemporaryFile` — once read, the file pointer is at the end. A second `await file.read()` returns `b""`.
**How to avoid:** Read once and store the bytes: `content = await file.read()`. Pass bytes to both the text extractor and any other processing. Or use `await file.seek(0)` to reset the pointer before a second read.
**Warning signs:** Empty text extraction results despite valid file upload.

## Code Examples

### FastAPI Upload Endpoint with Text Extraction

```python
# backend/app/api/routes/upload.py
import io
from fastapi import APIRouter, UploadFile, HTTPException
from app.services.text_extractor import extract_text_from_pdf, extract_text_from_docx
from app.services.dify_client import DifyClient
from app.config import settings

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}

@router.post("/api/upload-and-extract")
async def upload_and_extract(file: UploadFile):
    file_type = ALLOWED_TYPES.get(file.content_type)
    if not file_type:
        raise HTTPException(400, f"Unsupported file type: {file.content_type}")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large (max 10MB)")

    if file_type == "pdf":
        raw_text = extract_text_from_pdf(content)
    else:
        raw_text = extract_text_from_docx(content)

    if not raw_text.strip():
        raise HTTPException(
            422,
            "Could not extract text from file. The PDF may be scanned/image-based.",
        )

    dify = DifyClient(
        api_key=settings.dify_extraction_api_key,
        base_url=settings.dify_base_url,
    )
    cn_resume_data = await dify.extract_resume(raw_text)

    return {"raw_text": raw_text, "cn_resume_data": cn_resume_data}
```

### Text Extractor Service

```python
# backend/app/services/text_extractor.py
import io
import pymupdf
from docx import Document

def extract_text_from_pdf(content: bytes) -> str:
    doc = pymupdf.open(stream=content, filetype="pdf")
    pages = []
    for page in doc:
        pages.append(page.get_text("text", sort=True))
    doc.close()
    return "\n\n".join(pages)

def extract_text_from_docx(content: bytes) -> str:
    doc = Document(io.BytesIO(content))
    parts = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            parts.append(text)
    for table in doc.tables:
        for row in table.rows:
            cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
            if cells:
                parts.append(" | ".join(cells))
    return "\n".join(parts)
```

### Dify Client Service

```python
# backend/app/services/dify_client.py
import json
import httpx

class DifyWorkflowError(Exception):
    pass

class DifyClient:
    def __init__(self, api_key: str, base_url: str = "https://api.dify.ai/v1"):
        self._api_key = api_key
        self._base_url = base_url
        self._http = httpx.AsyncClient(
            base_url=base_url,
            timeout=httpx.Timeout(90.0, connect=10.0),
        )

    async def extract_resume(self, resume_text: str, user: str = "default") -> dict:
        response = await self._http.post(
            "/workflows/run",
            headers={"Authorization": f"Bearer {self._api_key}"},
            json={
                "inputs": {"resume_text": resume_text},
                "response_mode": "blocking",
                "user": user,
            },
        )
        response.raise_for_status()
        result = response.json()
        data = result.get("data", {})

        if data.get("status") != "succeeded":
            error_msg = data.get("error", "Unknown Dify workflow error")
            raise DifyWorkflowError(error_msg)

        outputs = data.get("outputs", {})
        # The workflow should output a JSON string in a known key
        # Parse it if it's a string, return as-is if already a dict
        structured = outputs.get("structured_resume")
        if isinstance(structured, str):
            return json.loads(structured)
        return structured

    async def close(self):
        await self._http.aclose()
```

### Canonical Resume Data Schema (Chinese)

```python
# backend/app/models/resume.py
from pydantic import BaseModel

class EducationEntry(BaseModel):
    school: str | None = None
    major: str | None = None
    degree: str | None = None         # 本科, 硕士, 博士, 专科, etc.
    start_date: str | None = None
    end_date: str | None = None

class WorkEntry(BaseModel):
    company: str | None = None
    position: str | None = None
    department: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    description: str | None = None

class SkillEntry(BaseModel):
    name: str | None = None
    level: str | None = None          # 精通, 熟练, 了解, etc.

class CertificationEntry(BaseModel):
    name: str | None = None
    date: str | None = None

class CnResumeData(BaseModel):
    """Canonical schema for Chinese resume data extracted from uploaded file."""
    # Personal info
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    date_of_birth: str | None = None
    address: str | None = None
    nationality: str | None = None
    gender: str | None = None

    # Professional
    education: list[EducationEntry] | None = None
    work_experience: list[WorkEntry] | None = None
    skills: list[SkillEntry] | None = None
    certifications: list[CertificationEntry] | None = None
    languages: list[str] | None = None

    # Content
    self_introduction: str | None = None   # 自我评价 / 自我介绍
    career_objective: str | None = None    # 求职意向 / 职业目标
    project_experience: list[WorkEntry] | None = None  # Reuses WorkEntry shape
    awards: list[str] | None = None
    hobbies: str | None = None
```

### TypeScript Resume Interface (Frontend)

```typescript
// frontend/src/types/resume.ts
export interface EducationEntry {
  school: string | null;
  major: string | null;
  degree: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface WorkEntry {
  company: string | null;
  position: string | null;
  department: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface SkillEntry {
  name: string | null;
  level: string | null;
}

export interface CertificationEntry {
  name: string | null;
  date: string | null;
}

export interface CnResumeData {
  name: string | null;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  address: string | null;
  nationality: string | null;
  gender: string | null;
  education: EducationEntry[] | null;
  work_experience: WorkEntry[] | null;
  skills: SkillEntry[] | null;
  certifications: CertificationEntry[] | null;
  languages: string[] | null;
  self_introduction: string | null;
  career_objective: string | null;
  project_experience: WorkEntry[] | null;
  awards: string[] | null;
  hobbies: string | null;
}
```

### react-dropzone File Upload Component

```tsx
// frontend/src/components/upload/FileDropzone.tsx
import { useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

interface Props {
  onFileAccepted: (file: File) => void;
  currentFile: File | null;
}

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

export function FileDropzone({ onFileAccepted, currentFile }: Props) {
  const { t } = useTranslation('wizard');

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    if (accepted.length > 0) {
      onFileAccepted(accepted[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div
      {...getRootProps()}
      className={`rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
    >
      <input {...getInputProps()} />
      {currentFile ? (
        <p className="text-sm text-slate-600">{currentFile.name}</p>
      ) : (
        <p className="text-sm text-slate-400">{t('steps.upload.dropzone')}</p>
      )}
    </div>
  );
}
```

### react-pdf Worker Setup (Vite-Compatible)

```typescript
// frontend/src/main.tsx (add at top, before React rendering)
import { pdfjs } from 'react-pdf';

// Single-line expression required — Vite 7.x regression with multiline new URL()
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
```

### API Client

```typescript
// frontend/src/api/client.ts
const API_BASE = '/api';

export async function uploadAndExtract(file: File): Promise<{
  raw_text: string;
  cn_resume_data: CnResumeData;
}> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_BASE}/upload-and-extract`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}
```

## Dify Workflow Design Notes

### Extraction Workflow Configuration

The Dify extraction workflow must be designed with these constraints:

**Input:** Single string variable `resume_text` containing the plain text extracted from the resume.

**Output:** A JSON string or object conforming to the `CnResumeData` schema. The workflow should:
1. Parse the free-text resume into structured fields
2. Map varying Chinese section headers to canonical field names (工作经历/职业经历/工作经验 → `work_experience`)
3. Set missing/unrecognized fields to `null` (EXTR-03 requirement — never hallucinate data)
4. Preserve original Chinese text exactly (no translation at this stage)

**LLM Prompt Strategy:**
- Provide the complete `CnResumeData` JSON schema as part of the system prompt
- Include examples of varying Chinese resume formats
- Explicitly instruct: "If a field is not found in the resume, set it to null. Do not guess or generate fictional data."
- Output format: strict JSON only, no markdown fences or explanatory text

**Workflow Timeout:** The Dify workflow should complete within 60 seconds for typical resumes (1-3 pages). If it exceeds 90 seconds, the httpx client timeout will fire before Cloudflare's 100s limit.

### Dify API Key Management

Each Dify workflow has its own API key. Store in environment variables:

```bash
# backend/.env
DIFY_BASE_URL=https://api.dify.ai/v1
DIFY_EXTRACTION_API_KEY=app-xxxxxxxxxxxxxxxx
```

```python
# backend/app/config.py (updated)
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    dify_base_url: str = "https://api.dify.ai/v1"
    dify_extraction_api_key: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
```

**Note:** The current `config.py` only has `BASE_DIR`, `FONTS_DIR`, `TEMPLATES_DIR`. It needs to be expanded to load environment variables for Dify configuration. Use pydantic-settings (`pip install pydantic-settings`) for `.env` file loading with type validation.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-dropzone v14 `isDragReject` persists | v15 `isDragReject` clears after drop | Feb 2026 | Use v14.4.x to avoid migration. Use `fileRejections` for post-drop validation in v15. |
| PyMuPDF imported as `fitz` | PyMuPDF imported as `pymupdf` | 2025 | Both work but `pymupdf` is the preferred import name in v1.27.x. |
| Dify client Python SDK (dify-client-python) | Direct httpx API calls | 2025+ | Official Python SDK at v1.0.1 (June 2024) is stale. Use httpx directly for current API. |
| Manual `FormData` + XMLHttpRequest | `fetch` with `FormData` | Modern | Use native `fetch` with `FormData` for file uploads — no need for axios in this project. |

**Deprecated/outdated:**
- `dify-client-python` v1.0.1: Last updated June 2024, doesn't support latest workflow API features. Use httpx.
- `import fitz`: Still works but `import pymupdf` is the modern convention for PyMuPDF.
- react-dropzone `<Dropzone>` render prop component: Legacy pattern. Use `useDropzone` hook instead.

## Open Questions

1. **Dify extraction workflow output schema alignment**
   - What we know: The Dify workflow must output JSON matching our `CnResumeData` schema. The workflow needs to be configured in Dify Cloud with the right prompt, input/output variables, and model.
   - What's unclear: Whether the Dify workflow already exists or needs to be created. What model is selected (GPT-4, Claude, etc.). The exact output variable name in the workflow.
   - Recommendation: During implementation, create a test workflow in Dify Cloud with a simple extraction prompt. Validate the output matches the schema. Document the workflow configuration so it can be reproduced. The Dify workflow design is out of scope for the code — it's configured in the Dify Cloud UI.

2. **Photo upload timing — Step 1 (Upload) vs Step 4 (Preview)**
   - What we know: UPLD-03 says "optionally upload a photo alongside the resume file." DOCG-07 (Phase 4) says "upload and crop a photo to 3:4 ratio for the 履歴書."
   - What's unclear: Should the photo upload happen in the Upload step (Phase 2) or the Preview step (Phase 4)? The requirement says "alongside the resume file" suggesting Phase 2.
   - Recommendation: Add the photo upload zone to the Upload step (Phase 2) for UPLD-03 compliance. Store the raw photo blob in Zustand. Defer the crop-to-3:4-ratio feature to Phase 4 (DOCG-07). Phase 2 just accepts and stores the photo.

3. **Handling scanned/image-based PDFs**
   - What we know: PyMuPDF extracts text from PDFs with selectable text. Scanned PDFs contain only images — `get_text()` returns empty string. OCR (OCRR-01) is explicitly deferred to v2.
   - What's unclear: How to handle the case where a user uploads a scanned PDF.
   - Recommendation: After text extraction, check if result is empty/near-empty. If so, return a clear error message: "This PDF appears to be scanned/image-based. Text-based PDFs or DOCX files are required." This handles the edge case gracefully without OCR.

4. **Resume data schema: flat vs nested for Japanese document mapping**
   - What we know: The Chinese resume schema above is flat-ish (personal info fields + lists). But the output eventually maps to two Japanese documents: 履歴書 (personal info, education, work history, licenses) and 職務経歴書 (career summary, detailed work history, skills).
   - What's unclear: Should the Chinese schema already be split into rirekisho/shokumukeirekisho sections, or should it be a single unified schema that gets split during translation (Phase 3)?
   - Recommendation: Use a single unified `CnResumeData` schema for Phase 2. The Chinese resume is one document — splitting it into Japanese document sections is a translation/mapping concern for Phase 3. Keep the extraction schema close to how Chinese resumes are actually structured.

## Sources

### Primary (HIGH confidence)
- Dify Workflow Execution API — https://docs.dify.ai/api-reference/workflow-execution/execute-workflow — OpenAPI spec verified via WebFetch, blocking mode response schema confirmed
- Dify File Upload API — https://docs.dify.ai/api-reference/files/file-upload-for-workflow — Verified alternate approach (file upload to Dify), decided against for separation of concerns
- react-dropzone v14.4.x / v15.0.0 — https://react-dropzone.js.org/ and npm — useDropzone API, accept prop, v15 breaking change confirmed
- react-pdf v10.3.0 — https://docs.react-pdf.dev/ and npm — Document/Page components, blob URL loading, Vite worker configuration
- PyMuPDF v1.27.1 — https://pymupdf.readthedocs.io/ and https://pypi.org/project/PyMuPDF/ — page.get_text() API, sort parameter, Chinese text support
- httpx 0.28.x — https://www.python-httpx.org/ — AsyncClient, timeout configuration, file uploads
- FastAPI UploadFile — https://fastapi.tiangolo.com/tutorial/request-files/ — Multipart handling, python-multipart dependency

### Secondary (MEDIUM confidence)
- docx-preview v0.3.7 — https://www.npmjs.com/package/docx-preview — renderAsync API, DOCX→HTML rendering. 183K weekly downloads, actively maintained.
- python-docx text extraction — https://python-docx.readthedocs.io/ — Paragraph + table iteration for text extraction. Table extraction pattern from community sources.
- Vite 7.x react-pdf worker regression — https://github.com/wojtekmaj/react-pdf/issues/1843 — Single-line URL workaround. Multiple community confirmations.

### Tertiary (LOW confidence)
- Chinese resume format variation handling — Based on domain knowledge of Chinese resume conventions. Not verified against a formal standard (no such standard exists). Needs validation with real sample resumes during implementation.

## Metadata

**Confidence breakdown:**
- Standard stack (libraries/versions): HIGH — all versions verified from npm/PyPI, APIs checked against official docs
- Architecture (upload → extract → Dify → review): HIGH — follows established architecture from ARCHITECTURE.md, Dify API verified
- Side-by-side UI pattern: HIGH — standard Tailwind grid pattern, react-pdf and docx-preview APIs verified
- Resume data schema: MEDIUM — schema design is reasonable but needs validation against real Chinese resumes and alignment with Dify workflow output
- Pitfalls: HIGH — react-pdf worker issue has multiple GitHub confirmations, DOCX table extraction pitfall is well-documented

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (30 days — stable libraries, Dify API stable)

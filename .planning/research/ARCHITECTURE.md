# Architecture Research

**Domain:** Chinese-to-Japanese resume conversion web application
**Researched:** 2026-02-18
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React SPA)                        │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │  Upload   │→ │  Review  │→ │  Review  │→ │  Preview │→ │ Down │ │
│  │  Step     │  │ Extract  │  │ Translate│  │  HTML    │  │ load │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────┘ │
│       │                                          ↑           ↑     │
│  ┌────┴──────────────────────────────────────────┴───────────┴───┐ │
│  │                    Zustand Store (wizard state)                │ │
│  │  raw_text | cn_json | jp_json | preview_html | current_step   │ │
│  └───────────────────────────┬───────────────────────────────────┘ │
│                              │ HTTP (JSON / multipart)             │
├──────────────────────────────┼──────────────────────────────────────┤
│                              ↓                                     │
│                     BACKEND (FastAPI)                               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      API Router                              │   │
│  │  POST /upload-and-extract    POST /translate                 │   │
│  │  POST /preview               POST /generate-pdf             │   │
│  └──────┬──────────────┬──────────────┬──────────────┬─────────┘   │
│         ↓              ↓              ↓              ↓             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌────────────┐     │
│  │ Text      │  │ Dify      │  │ Template   │  │ PDF        │     │
│  │ Extractor │  │ Client    │  │ Renderer   │  │ Generator  │     │
│  │ (PyMuPDF) │  │ (httpx)   │  │ (Jinja2)   │  │(WeasyPrint)│     │
│  └───────────┘  └─────┬─────┘  └───────────┘  └────────────┘     │
│                        │                                           │
├────────────────────────┼───────────────────────────────────────────┤
│                        ↓ HTTPS                                     │
│                  DIFY CLOUD API                                     │
│                                                                     │
│  ┌────────────────────────┐  ┌──────────────────────────────────┐  │
│  │  Workflow 1 (API Key A) │  │  Workflow 2 (API Key B)          │  │
│  │  Information Extraction │  │  Japanese Translation            │  │
│  │  CN text → CN JSON      │  │  CN JSON → JP JSON               │  │
│  └────────────────────────┘  │  (core translate + localization)  │  │
│                               └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Wizard Shell** | Step navigation, progress indicator, step validation gates | React component with Zustand-driven step index |
| **Zustand Store** | Hold all wizard state: raw text, CN JSON, JP JSON, preview HTML, file blob, current step | Single store with slices per concern |
| **API Client** | Typed HTTP calls to backend, error handling, loading states | Thin wrapper around `fetch` or `axios` with TypeScript types |
| **Upload Step** | File selection, drag-and-drop, format validation, trigger extraction | Accepts PDF/DOCX, keeps blob locally for preview |
| **Review Extraction Step** | Side-by-side display: original file (PDF viewer) + structured CN data (editable form) | react-pdf for PDF preview, form fields bound to CN JSON |
| **Review Translation Step** | Side-by-side display: CN JSON + JP JSON (editable), field-level comparison | Two-column layout, editable Japanese fields |
| **Preview Step** | Rendered HTML preview of 履歴書 and 職務経歴書, tab switching | Sandboxed iframe rendering backend-produced HTML |
| **Download Step** | PDF download buttons for both document types | Triggers backend PDF generation, browser download |
| **FastAPI Router** | HTTP endpoint definitions, request validation, CORS | 4 endpoints, Pydantic models for validation |
| **Text Extractor** | Extract plain text from PDF/DOCX uploads | PyMuPDF for PDF, python-docx for DOCX |
| **Dify Client** | Call Dify Cloud workflows, parse responses, handle errors/timeouts | httpx async client, two API keys, blocking mode |
| **Template Renderer** | Render structured JP JSON into HTML using resume templates | Jinja2 with 履歴書 and 職務経歴書 HTML/CSS templates |
| **PDF Generator** | Convert rendered HTML to downloadable PDF with CJK fonts | WeasyPrint with bundled Noto Sans JP font files |

## Recommended Project Structure

```
ai-resume-localizer/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts              # Typed API client for all backend calls
│   │   ├── components/
│   │   │   ├── ui/                     # Base components (Button, Input, Card, etc.)
│   │   │   ├── wizard/                 # WizardShell, StepIndicator, StepNav
│   │   │   └── resume/                 # ResumeFieldEditor, SideBySide, PDFViewer
│   │   ├── steps/
│   │   │   ├── UploadStep.tsx          # File upload + extraction trigger
│   │   │   ├── ReviewExtractionStep.tsx # CN text ↔ CN JSON side-by-side
│   │   │   ├── ReviewTranslationStep.tsx # CN JSON ↔ JP JSON editable
│   │   │   ├── PreviewStep.tsx         # HTML preview of both documents
│   │   │   └── DownloadStep.tsx        # PDF download for both documents
│   │   ├── stores/
│   │   │   └── useResumeStore.ts       # Zustand store: wizard state + resume data
│   │   ├── types/
│   │   │   └── resume.ts              # Shared TypeScript types for resume JSON schema
│   │   ├── lib/
│   │   │   └── utils.ts               # Formatting, validation helpers
│   │   ├── i18n/                       # Bilingual UI strings (CN/JP)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── router.py              # Aggregate all route modules
│   │   │   └── routes/
│   │   │       ├── upload.py           # POST /upload-and-extract
│   │   │       ├── translate.py        # POST /translate
│   │   │       ├── preview.py          # POST /preview
│   │   │       └── pdf.py             # POST /generate-pdf
│   │   ├── services/
│   │   │   ├── dify_client.py         # Dify Cloud API wrapper (both workflows)
│   │   │   ├── text_extractor.py      # PDF/DOCX → plain text
│   │   │   ├── template_renderer.py   # Jinja2 → HTML string
│   │   │   └── pdf_generator.py       # HTML → PDF via WeasyPrint
│   │   ├── models/
│   │   │   ├── resume.py              # Pydantic models: ResumeDataCN, ResumeDataJP
│   │   │   └── api.py                 # Request/response Pydantic models
│   │   ├── templates/
│   │   │   ├── rirekisho.html         # 履歴書 JIS-format HTML/CSS template
│   │   │   ├── shokumukeirekisho.html # 職務経歴書 HTML/CSS template
│   │   │   └── base.css              # Shared print styles, CJK font declarations
│   │   ├── fonts/
│   │   │   └── NotoSansJP-*.ttf      # Bundled CJK font files
│   │   ├── config.py                  # Settings from environment (Dify keys, etc.)
│   │   └── main.py                    # FastAPI app, CORS, lifespan
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

### Structure Rationale

- **`frontend/steps/`:** Each wizard step is a self-contained page component. Keeps step logic isolated — a step can be developed and tested independently.
- **`frontend/stores/`:** Single Zustand store holds all wizard state. The frontend is the source of truth for resume data (stateless backend pattern).
- **`frontend/types/resume.ts`:** Shared TypeScript types matching backend Pydantic models. Kept in one file because the schema is the contract between frontend and backend.
- **`backend/services/`:** Each service encapsulates one external concern (Dify, text extraction, templating, PDF). Routes compose services but never call each other.
- **`backend/templates/`:** HTML/CSS templates for 履歴書 and 職務経歴書. These are the single source of truth for resume layout — used for both preview and PDF generation.
- **`backend/fonts/`:** Bundled CJK fonts (not system-dependent) because WeasyPrint's `local()` font loading has known issues with CJK. Using `url()` with bundled files guarantees consistent rendering across environments.

## Architectural Patterns

### Pattern 1: Stateless Backend / Client-Side Wizard State

**What:** The backend is fully stateless — it receives inputs, processes them, and returns outputs. All wizard state (current step, extracted data, translated data, file blob) lives in the frontend Zustand store.

**When to use:** No-auth applications with linear wizard flows where data progresses through steps. Each API call is self-contained.

**Trade-offs:**
- Pro: No session management, no Redis, no sticky sessions, trivially scalable
- Pro: User can refresh the page and lose nothing if Zustand uses `persist` middleware
- Pro: Simpler backend (pure request/response)
- Con: JSON payloads for translation/preview carry the full resume data (acceptable — resume JSON is <50KB)
- Con: Frontend is more complex (must manage all state)

**Data ownership per step:**

```
Upload Step      → sends: file        → receives: { raw_text, cn_json }  → stores both
Review Extract   → local edits to cn_json (no backend call)
Translate Step   → sends: cn_json     → receives: { jp_json }           → stores jp_json
Review Translate → local edits to jp_json (no backend call)
Preview Step     → sends: jp_json     → receives: { rirekisho_html, shokumukeirekisho_html }
Download Step    → sends: jp_json + type → receives: PDF binary (streamed)
```

### Pattern 2: Service Composition in Route Handlers

**What:** Route handlers compose services to fulfill a request. Services are injected via FastAPI's dependency injection. Each service is a focused unit.

**When to use:** Any FastAPI application with non-trivial business logic.

**Trade-offs:**
- Pro: Services are testable in isolation (mock Dify client, mock PDF generator)
- Pro: Clear dependency graph — route handler is the orchestrator
- Con: Slightly more boilerplate than putting logic directly in routes

**Example:**

```python
# routes/upload.py
@router.post("/upload-and-extract")
async def upload_and_extract(
    file: UploadFile,
    extractor: TextExtractor = Depends(get_text_extractor),
    dify: DifyClient = Depends(get_dify_client),
) -> ExtractionResponse:
    raw_text = await extractor.extract(file)
    cn_json = await dify.extract_resume(raw_text)
    return ExtractionResponse(raw_text=raw_text, structured_data=cn_json)
```

### Pattern 3: Shared HTML Template for Preview and PDF

**What:** One Jinja2 template produces HTML that serves both the frontend preview (rendered in an iframe) and the WeasyPrint PDF generation. CSS `@media print` rules handle print-specific adjustments.

**When to use:** When the visual output must be consistent between preview and final PDF.

**Trade-offs:**
- Pro: Single source of truth for layout — what you preview is what you get
- Pro: Template changes automatically affect both preview and PDF
- Con: Must ensure CSS works in both browser rendering (iframe) and WeasyPrint's CSS engine
- Con: WeasyPrint doesn't support all CSS features (no flexbox, limited grid) — use CSS table layout and absolute positioning for the JIS rirekisho grid

**Key constraint:** WeasyPrint uses its own CSS engine, not a browser. The 履歴書 JIS format is a rigid grid layout — use CSS `table` or `position: absolute` with explicit dimensions, not flexbox or CSS grid.

### Pattern 4: Typed JSON Contract Between Frontend and Backend

**What:** Define the resume data schema as Pydantic models on the backend and matching TypeScript interfaces on the frontend. All API communication uses this shared schema.

**When to use:** Any project where structured data flows between frontend and backend.

**Trade-offs:**
- Pro: Type safety catches schema mismatches at compile time (TS) and runtime (Pydantic)
- Pro: Self-documenting API via FastAPI's auto-generated OpenAPI docs
- Con: Must keep TypeScript types manually in sync with Pydantic models (or use codegen)

**Schema structure (key fields):**

```python
class RirekishoData(BaseModel):
    name: str | None = None
    furigana: str | None = None
    date_of_birth: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    education: list[EducationEntry] | None = None
    work_history: list[WorkHistoryEntry] | None = None
    licenses: list[LicenseEntry] | None = None
    self_pr: str | None = None
    motivation: str | None = None
    commute_time: str | None = None
    special_requests: str | None = None

class ShokumuKeirekishoData(BaseModel):
    summary: str | None = None
    skills: list[str] | None = None
    career_history: list[CareerEntry] | None = None
    self_pr: str | None = None

class ResumeData(BaseModel):
    """Complete resume data — used for both CN and JP versions."""
    rirekisho: RirekishoData
    shokumukeirekisho: ShokumuKeirekishoData
```

**Null handling:** Every field is `Optional` with `None` default. Templates check for `None` and render gracefully (empty cell, placeholder text, or omitted section). This is critical because Chinese resumes often lack Japan-specific fields like furigana, commute time, or dependents.

## Data Flow

### Complete Request Flow

```
USER                    FRONTEND                   BACKEND                  DIFY CLOUD
 │                         │                          │                         │
 │  1. Select file         │                          │                         │
 │ ──────────────────────→ │                          │                         │
 │                         │  2. POST /upload-and-     │                         │
 │                         │     extract (multipart)   │                         │
 │                         │ ────────────────────────→ │                         │
 │                         │                          │  3a. Extract text       │
 │                         │                          │      (PyMuPDF/docx)     │
 │                         │                          │                         │
 │                         │                          │  3b. POST /workflows/   │
 │                         │                          │      run (Workflow 1)   │
 │                         │                          │ ──────────────────────→ │
 │                         │                          │                         │
 │                         │                          │  3c. { cn_json }        │
 │                         │                          │ ←────────────────────── │
 │                         │  4. { raw_text, cn_json } │                         │
 │                         │ ←──────────────────────── │                         │
 │  5. Review/edit CN data │                          │                         │
 │ ←─────────────────────→ │                          │                         │
 │                         │                          │                         │
 │  6. Confirm extraction  │                          │                         │
 │ ──────────────────────→ │                          │                         │
 │                         │  7. POST /translate       │                         │
 │                         │     { cn_json }           │                         │
 │                         │ ────────────────────────→ │                         │
 │                         │                          │  8. POST /workflows/    │
 │                         │                          │     run (Workflow 2)    │
 │                         │                          │ ──────────────────────→ │
 │                         │                          │                         │
 │                         │                          │  9. { jp_json }         │
 │                         │                          │ ←────────────────────── │
 │                         │  10. { jp_json }          │                         │
 │                         │ ←──────────────────────── │                         │
 │  11. Review/edit JP data│                          │                         │
 │ ←─────────────────────→ │                          │                         │
 │                         │                          │                         │
 │  12. Request preview    │                          │                         │
 │ ──────────────────────→ │                          │                         │
 │                         │  13. POST /preview        │                         │
 │                         │      { jp_json }          │                         │
 │                         │ ────────────────────────→ │                         │
 │                         │                          │  14. Jinja2 render      │
 │                         │  15. { rirekisho_html,    │                         │
 │                         │       shokumu_html }      │                         │
 │                         │ ←──────────────────────── │                         │
 │  16. View preview       │                          │                         │
 │ ←────────────────────── │                          │                         │
 │                         │                          │                         │
 │  17. Download PDF       │                          │                         │
 │ ──────────────────────→ │                          │                         │
 │                         │  18. POST /generate-pdf   │                         │
 │                         │      { jp_json, type }    │                         │
 │                         │ ────────────────────────→ │                         │
 │                         │                          │  19. Jinja2 → HTML      │
 │                         │                          │  20. WeasyPrint → PDF   │
 │                         │  21. PDF binary (stream)  │                         │
 │                         │ ←──────────────────────── │                         │
 │  22. Save file          │                          │                         │
 │ ←────────────────────── │                          │                         │
```

### Key Data Flows

1. **Upload → Extraction:** File (multipart) → backend text extraction (PyMuPDF) → plain text string → Dify Workflow 1 (blocking mode, ~15-30s) → structured Chinese JSON. Backend returns both `raw_text` and `cn_json`. Frontend stores file blob locally for PDF preview display.

2. **Extraction → Translation:** User-edited `cn_json` → Dify Workflow 2 (blocking mode, ~10-20s) → structured Japanese JSON. The translation workflow has two internal nodes: core translation + localization (handles Japan-specific conventions like date format 令和X年, address order, etc.).

3. **Translation → Preview:** User-edited `jp_json` → Jinja2 template rendering → two HTML strings (one per document type). Frontend renders HTML in sandboxed iframes for WYSIWYG preview.

4. **Preview → PDF:** Same `jp_json` → same Jinja2 templates → HTML → WeasyPrint with CJK font configuration → PDF binary streamed to client. The HTML used for PDF is identical to preview HTML (same template, same data).

### State Management

```
Zustand Store
├── currentStep: number (0-4)
├── fileBlob: File | null           ← kept for PDF viewer in extraction review
├── rawText: string | null          ← original extracted text
├── cnResumeData: ResumeData | null ← structured Chinese JSON (editable)
├── jpResumeData: ResumeData | null ← structured Japanese JSON (editable)
├── previewHtml: {                  ← cached preview HTML
│     rirekisho: string | null
│     shokumukeirekisho: string | null
│   }
├── isLoading: boolean
├── error: string | null
└── actions: {
      setStep, setFileBlob, setCnData, setJpData, setPreview, reset
    }
```

**Step gating:** Each step validates that required data exists before allowing navigation forward:
- Step 1 (Upload): No prerequisite
- Step 2 (Review Extract): Requires `cnResumeData` to be populated
- Step 3 (Review Translate): Requires `jpResumeData` to be populated
- Step 4 (Preview): Requires `previewHtml` to be populated
- Step 5 (Download): Requires preview to have been generated

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 concurrent users | Current architecture is sufficient. Single FastAPI instance handles requests. WeasyPrint generates PDFs synchronously in route handlers. No database needed. |
| 100-1k concurrent users | Move PDF generation to background tasks (`BackgroundTasks` or a task queue). Add request rate limiting per IP. Consider caching Dify responses by content hash. |
| 1k+ concurrent users | Celery + Redis for PDF generation queue. Multiple FastAPI workers behind a load balancer. Dify Cloud rate limits become the bottleneck — contact Dify for enterprise tier or self-host. |

### Scaling Priorities

1. **First bottleneck: Dify API rate limits and latency.** Each conversion requires 2 sequential Dify API calls (extraction ~15-30s, translation ~10-20s). This is the slowest part of the pipeline and the most likely to hit rate limits under load. Mitigation: cache results by content hash, implement retry with exponential backoff.

2. **Second bottleneck: PDF generation CPU.** WeasyPrint is CPU-bound. Under heavy load, many simultaneous PDF generations will starve the event loop. Mitigation: offload to background tasks or a worker process. But this is unlikely to be an issue at <100 concurrent users.

## Anti-Patterns

### Anti-Pattern 1: Server-Side Session State for Wizard Data

**What people do:** Store extracted JSON, translated JSON, and file references in server-side sessions (Redis, in-memory dict keyed by session ID).
**Why it's wrong:** Adds infrastructure complexity (session store), introduces stale state bugs (session expiry mid-wizard), and requires sticky sessions or shared state for multi-instance deployment. Resume JSON is small (<50KB) — there's no reason to keep it server-side.
**Do this instead:** Stateless backend. Frontend Zustand store holds all wizard data. Each API call sends the needed input and receives the output. Optionally use Zustand `persist` middleware (sessionStorage) to survive page refresh.

### Anti-Pattern 2: Streaming Dify Responses for Structured JSON Output

**What people do:** Use Dify's `streaming` response mode and try to parse partial JSON tokens as they arrive.
**Why it's wrong:** The output of both workflows is structured JSON, not prose text. Partial JSON is invalid and can't be meaningfully displayed to users. Streaming adds SSE complexity for no UX benefit.
**Do this instead:** Use `blocking` response mode. Show a loading indicator with an estimated time message. The 100-second Cloudflare timeout for blocking mode is more than sufficient for resume processing (~15-30s per workflow).

### Anti-Pattern 3: Extracting Text Inside the Dify Workflow

**What people do:** Upload the resume file to Dify and let the workflow handle text extraction within its nodes.
**Why it's wrong:** You lose control over extraction quality, can't show the raw extracted text to the user for verification, and add file upload latency to the Dify API call. If extraction fails, the entire workflow fails and you can't diagnose whether it was an extraction or AI issue.
**Do this instead:** Extract text on the backend (PyMuPDF for PDF, python-docx for DOCX). Send clean text to Dify. Return both `raw_text` and structured JSON to the frontend. This separates concerns and makes debugging easier.

### Anti-Pattern 4: Using CSS Flexbox/Grid in Resume PDF Templates

**What people do:** Build the 履歴書 template with modern CSS flexbox or grid, then wonder why WeasyPrint renders it incorrectly.
**Why it's wrong:** WeasyPrint has limited CSS flexbox support and no CSS grid support. The 履歴書 JIS format requires a precise grid of cells with specific proportions.
**Do this instead:** Use CSS `table` layout or `position: absolute` with explicit `mm`-based dimensions for the 履歴書 grid. Use `@page` rules for A4/B5 sizing. Test the template with WeasyPrint early — don't build it in Chrome and assume it will work.

### Anti-Pattern 5: Building the PDF Template Last

**What people do:** Build the entire extraction/translation pipeline first, then tackle the HTML-to-PDF template at the end, assuming it's "just HTML."
**Why it's wrong:** The 履歴書 JIS format has a very specific grid layout that is notoriously difficult to reproduce in HTML/CSS, especially with WeasyPrint's CSS limitations. If you leave this to the end, you may discover the template requires significant rework or a different PDF engine.
**Do this instead:** Build a static HTML template with hardcoded sample data as one of the early phases. Verify it renders correctly in WeasyPrint before building the dynamic pipeline. This de-risks the most uncertain part of the system.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Dify Cloud — Workflow 1 (Extraction)** | `POST https://api.dify.ai/v1/workflows/run` with `Authorization: Bearer {EXTRACTION_API_KEY}`, `response_mode: blocking`, `inputs: { resume_text: "..." }` | Each workflow has its own API key. Use `httpx.AsyncClient` with a 90-second timeout (Dify's Cloudflare limit is 100s). Always set a `user` identifier. |
| **Dify Cloud — Workflow 2 (Translation)** | Same endpoint pattern with `Authorization: Bearer {TRANSLATION_API_KEY}`, `inputs: { cn_resume_json: "..." }` | Send the CN JSON as a stringified JSON input. The workflow's two nodes (core translation + localization) are internal to Dify — our backend just sends and receives. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Frontend ↔ Backend** | REST over HTTP. Multipart for file upload, JSON for all other requests/responses. | CORS configured for frontend origin. No auth tokens — open API. Consider rate limiting by IP. |
| **Route Handler ↔ Services** | FastAPI dependency injection (`Depends()`). Services are async classes/functions. | Routes compose services. Services never import or call other services directly — the route handler orchestrates. |
| **Template Renderer ↔ PDF Generator** | Renderer produces HTML string → PDF generator consumes HTML string. | Same Jinja2 template, same data. The PDF generator adds `FontConfiguration` for CJK fonts. These can be composed in the route handler or the PDF generator can call the renderer internally. |
| **Backend ↔ File System** | Temp file for uploaded resume (cleaned up after text extraction). Font files read from `backend/app/fonts/`. Jinja2 templates from `backend/app/templates/`. | No persistent storage. No database. All temp files cleaned up in `finally` blocks. |

### Dify API Client Design

```python
class DifyClient:
    def __init__(self, extraction_key: str, translation_key: str, base_url: str):
        self._http = httpx.AsyncClient(base_url=base_url, timeout=90.0)
        self._extraction_key = extraction_key
        self._translation_key = translation_key

    async def extract_resume(self, text: str, user_id: str) -> dict:
        return await self._run_workflow(
            api_key=self._extraction_key,
            inputs={"resume_text": text},
            user=user_id,
        )

    async def translate_resume(self, cn_json: dict, user_id: str) -> dict:
        return await self._run_workflow(
            api_key=self._translation_key,
            inputs={"cn_resume_json": json.dumps(cn_json, ensure_ascii=False)},
            user=user_id,
        )

    async def _run_workflow(self, api_key: str, inputs: dict, user: str) -> dict:
        response = await self._http.post(
            "/workflows/run",
            headers={"Authorization": f"Bearer {api_key}"},
            json={"inputs": inputs, "response_mode": "blocking", "user": user},
        )
        response.raise_for_status()
        data = response.json()["data"]
        if data["status"] != "succeeded":
            raise DifyWorkflowError(data.get("error", "Unknown error"))
        return data["outputs"]
```

## Build Order (Dependencies Between Components)

The dependency graph determines what must be built first:

```
                    ┌─────────────────┐
                    │ 1. Project Setup │
                    │ (FastAPI + React │
                    │  skeletons)      │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
   ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐
   │ 2a. Data     │  │ 2b. Wizard   │  │ 2c. HTML Templates │
   │ Schema       │  │ Shell (UI)   │  │ (static 履歴書 +    │
   │ (Pydantic +  │  │              │  │  職務経歴書)         │
   │  TypeScript) │  │              │  │ + WeasyPrint verify │
   └──────┬───────┘  └──────┬───────┘  └─────────┬──────────┘
          │                 │                     │
          ↓                 ↓                     │
   ┌──────────────────────────────┐               │
   │ 3. Upload + Text Extraction  │               │
   │ (file upload UI + PyMuPDF)   │               │
   └──────────────┬───────────────┘               │
                  ↓                               │
   ┌──────────────────────────────┐               │
   │ 4. Dify Extraction Workflow  │               │
   │ (API client + review UI)     │               │
   └──────────────┬───────────────┘               │
                  ↓                               │
   ┌──────────────────────────────┐               │
   │ 5. Dify Translation Workflow │               │
   │ (API client + review UI)     │               │
   └──────────────┬───────────────┘               │
                  │              ┌─────────────────┘
                  ↓              ↓
   ┌──────────────────────────────┐
   │ 6. Dynamic Template Rendering│
   │ (Jinja2 + preview endpoint   │
   │  + preview UI)               │
   └──────────────┬───────────────┘
                  ↓
   ┌──────────────────────────────┐
   │ 7. PDF Generation + Download │
   │ (WeasyPrint + download UI)   │
   └──────────────┬───────────────┘
                  ↓
   ┌──────────────────────────────┐
   │ 8. Polish                    │
   │ (error handling, bilingual   │
   │  UI, null field handling,    │
   │  loading states, responsive) │
   └──────────────────────────────┘
```

**Critical path insight:** Phase 2c (HTML templates + WeasyPrint verification) can be built in parallel with the upload/extraction pipeline (2a, 2b, 3, 4). This is important because the 履歴書 grid layout in WeasyPrint is the highest-risk component — starting it early de-risks the project. If WeasyPrint can't handle the layout, the fallback is Playwright (which supports full CSS but requires a browser binary).

**Build order rationale:**
- **Schema first (2a)** because it's the contract everything depends on
- **Templates early (2c)** because JIS grid layout in WeasyPrint is the riskiest technical unknown
- **Upload before Dify** because you need text to test the Dify integration
- **Extraction before Translation** because translation depends on extraction output
- **Preview before PDF** because preview validates the template rendering before adding WeasyPrint
- **Polish last** because it touches all components and benefits from a working end-to-end flow

## Sources

- Dify Workflow Execution API: https://docs.dify.ai/api-reference/workflow-execution/execute-workflow (HIGH confidence — official docs, verified via WebFetch)
- Dify File Upload API: https://docs.dify.ai/api-reference/files/file-upload-for-workflow (HIGH confidence — official docs, verified via WebFetch)
- Dify API authentication and best practices: https://docs.dify.ai/en/use-dify/publish/developing-with-apis (HIGH confidence — official docs)
- WeasyPrint CJK font handling: https://stackoverflow.com/questions/59666234 and https://github.com/Kozea/WeasyPrint/issues/1337 (MEDIUM confidence — community sources, consistent findings)
- WeasyPrint vs Playwright comparison: https://pdfbolt.com/blog/python-html-to-pdf-library (MEDIUM confidence — multiple sources agree)
- FastAPI pipeline patterns: https://oneuptime.com/blog/post/2026-01-25-background-task-processing-fastapi/view (MEDIUM confidence — recent source, verified patterns)
- React multi-step wizard with Zustand: https://www.buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps (MEDIUM confidence — community best practice, multiple sources agree)
- Japanese resume (履歴書) JIS format structure: https://japanhandbook.com/writing-a-japanese-resume-rirekisho-template-and-tips-for-expats/ (MEDIUM confidence — multiple sources agree on format)
- 職務経歴書 format structure: https://www.daijob.com/en/guide/tipsadvice/resume/syokureki/ and https://japan-dev.com/blog/japanese-cv-shokumu-keirekisho (MEDIUM confidence — multiple sources agree)
- PyMuPDF for PDF text extraction: https://github.com/pymupdf/PyMuPDF (HIGH confidence — official repository)
- FastAPI file upload patterns: https://noone-m.github.io/2025-12-10-fastapi-file-upload/ (MEDIUM confidence — recent, aligns with FastAPI docs)

---
*Architecture research for: Chinese-to-Japanese resume conversion web application*
*Researched: 2026-02-18*

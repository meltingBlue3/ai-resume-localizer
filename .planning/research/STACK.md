# Stack Research

**Domain:** Chinese-to-Japanese Resume Conversion Web Application
**Researched:** 2026-02-18
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2.x | Frontend UI framework | Current stable (19.2.4). Hooks-first API, concurrent features, massive ecosystem. Industry standard for SPAs. |
| Vite | 7.3.x | Frontend build tool | Current stable (7.3.1). Sub-second cold starts, native ESM, 10-100x faster than webpack. CRA is deprecated since Feb 2025 — Vite is the standard replacement. |
| TypeScript | 5.9.x | Type safety (frontend + config) | Current stable (5.9.3). Catches data-shape bugs at compile time — critical for the complex CN/JP data models flowing between frontend and backend. |
| Tailwind CSS | 4.x | Utility-first CSS framework | Current stable (4.1.18). CSS-first config in v4, Flexbox/Grid utilities, responsive design out of the box. Pairs with Vite via first-party plugin. |
| Python | 3.12+ | Backend runtime | LTS with performance improvements. FastAPI 0.129.0 requires 3.10+; target 3.12 for best async perf and typing support. |
| FastAPI | 0.129.x | Backend API framework | Current stable (0.129.0). Async-native, auto OpenAPI docs, Pydantic integration for request/response validation. Best Python framework for this workload. |
| Pydantic | 2.12.x | Data validation & serialization | Current stable (2.12.5). Core of FastAPI's validation layer. Type-safe models for resume data structures flowing between OCR → Dify → PDF pipeline. |
| WeasyPrint | 68.x | HTML/CSS → PDF generation | Current stable (68.1). No browser dependency, strong CSS Paged Media support (@page, print layouts). Ideal for structured JIS-format resume PDFs. |
| PaddleOCR | 3.4.x | Chinese document OCR | Current stable (3.4.0). #1 open-source Chinese OCR. PP-OCRv5 models, 100+ language support, handles mixed CN/EN text in resume layouts. Apache 2.0 license. |

### Supporting Libraries — Frontend

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-i18next | 16.5.x | Internationalization (CN/JP UI) | Always — bilingual UI is a core requirement. Hook-based API (`useTranslation`), JSON translation files per locale. |
| i18next | 25.8.x | i18n core engine | Always — required by react-i18next. Language detection, interpolation, namespace splitting. |
| react-router | 7.13.x | Client-side routing | Always — step-by-step user flow needs distinct routes (upload → review → translate → preview → download). |
| react-dropzone | 14.4.x | File upload drag-and-drop | Upload step — provides `useDropzone` hook, file type validation, drag state detection. Stick with v14.4.x (v15 has breaking `isDragReject` change). |
| zustand | 5.0.x | Lightweight state management | Always — resume data flows through multiple steps. Zustand is simpler than Redux, no providers needed, hook-based. Stores extraction results, translation edits, user selections. |
| axios | 1.7.x | HTTP client | API calls to backend — auto JSON parsing, interceptors for error handling, request cancellation. Better DX than raw fetch for multi-endpoint apps. |
| react-pdf | 10.3.x | PDF preview in browser | Preview step — renders generated PDF in-browser using pdf.js. `<Document>` + `<Page>` components with built-in TypeScript support. |

### Supporting Libraries — Backend

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| httpx | 0.28.x | Async HTTP client | Dify API calls — async-native, streaming support (`aiter_lines()`), SSE parsing for Dify workflow streaming responses. Drop-in upgrade from requests. |
| python-multipart | 0.0.22 | Multipart form parsing | Always — required by FastAPI for file upload endpoints (`UploadFile`). |
| Jinja2 | 3.1.x | HTML template engine | PDF generation — renders resume data into JIS-format HTML templates before WeasyPrint converts to PDF. FastAPI has built-in Jinja2 support. |
| uvicorn | 0.34.x | ASGI server | Always — production ASGI server for FastAPI. Use with `--workers` for multi-process deployment. |
| aiofiles | 24.x | Async file I/O | File handling — async read/write for uploaded resumes and generated PDFs. Prevents blocking the event loop on disk I/O. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint + Prettier | Frontend linting & formatting | Use `eslint-config-prettier` to avoid conflicts. Tailwind plugin for class sorting. |
| Ruff | Python linting & formatting | Replaces flake8 + black + isort. Single tool, 10-100x faster (written in Rust). |
| pytest | Python testing | Use `pytest-asyncio` for async endpoint tests. |
| Docker | Containerization | Especially important for WeasyPrint (system dependencies) and PaddleOCR (PaddlePaddle runtime). |

### Fonts (Critical for PDF Output)

| Font | License | Purpose | Notes |
|------|---------|---------|-------|
| Noto Sans JP | SIL OFL 1.1 | Japanese text in PDFs | 65,535 glyphs covering Hiragana, Katakana, Kanji, Latin. Free for commercial use. Bundle with the app — don't rely on system fonts. |
| Noto Sans SC | SIL OFL 1.1 | Chinese text (if needed in output) | Simplified Chinese coverage. Same family as Noto Sans JP for visual consistency. |

## Installation

```bash
# Frontend
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install react-router react-i18next i18next zustand axios react-dropzone react-pdf
npm install -D tailwindcss @tailwindcss/vite typescript @types/react @types/react-dom eslint prettier eslint-config-prettier

# Backend
cd ../backend
python -m venv .venv
pip install fastapi==0.129.0 uvicorn[standard] pydantic==2.12.5 httpx==0.28.1
pip install python-multipart==0.0.22 jinja2==3.1.6 aiofiles
pip install weasyprint==68.1
pip install paddleocr==3.4.0 paddlepaddle==3.2.0
pip install ruff pytest pytest-asyncio
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| WeasyPrint | Playwright (headless Chromium) | If resume templates require complex JavaScript rendering or dynamic content. WeasyPrint wins here because resumes are static HTML/CSS — no JS needed. Playwright adds ~200MB Chromium download and ~700ms warm / ~2200ms cold startup per render. |
| WeasyPrint | wkhtmltopdf | Never — deprecated, uses ancient QtWebKit, poor CSS3 support, no active maintenance. |
| PaddleOCR | Tesseract | If deployment size is critical and Chinese accuracy is acceptable at lower quality. PaddleOCR vastly outperforms Tesseract on Chinese text recognition accuracy, especially for complex layouts. |
| PaddleOCR | Cloud OCR (Google Vision, Azure) | If you want zero-deployment OCR and can accept per-call costs + network latency. PaddleOCR is free and runs locally. |
| Zustand | Redux Toolkit | If the team already knows Redux. Zustand is simpler for this app's complexity level — no providers, no action creators, just hooks. |
| Zustand | React Context | Never for this app — Context causes unnecessary re-renders when resume data changes frequently during edit steps. Zustand uses external store with selective subscriptions. |
| axios | Native fetch | If you want zero dependencies and the app has simple HTTP needs. This app has multiple endpoints, error handling patterns, and streaming — axios provides better DX. |
| react-dropzone | Native `<input type="file">` | If you don't need drag-and-drop UX. react-dropzone provides superior UX with drag states, file validation, and accessibility — worth the small dependency. |
| httpx | requests | Never for FastAPI async — requests is synchronous and blocks the event loop. httpx provides the same API but with native async support. |
| httpx | aiohttp | If you need WebSocket client support. httpx has a cleaner API and better typing. For REST-only Dify API calls, httpx is the better choice. |
| Dify direct API (httpx) | dify-client-python | If the official client gets updated and well-maintained. Currently at v1.0.1 (June 2024) — stale. Use httpx with direct API calls for better control over streaming, error handling, and async patterns. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Create React App (CRA) | Officially deprecated Feb 2025. No longer maintained, slow builds, bloated dependencies (140MB+ vs Vite's 31MB). | Vite with `react-ts` template |
| wkhtmltopdf | Abandoned project, uses ancient QtWebKit engine, poor CSS3/Flexbox/Grid support, known security issues. | WeasyPrint |
| Tesseract (as primary OCR) | Significantly lower accuracy on Chinese text vs PaddleOCR, especially for complex resume layouts with mixed fonts and formatting. | PaddleOCR |
| requests (in async FastAPI) | Synchronous HTTP library blocks the async event loop, degrading server throughput when calling Dify API. | httpx with AsyncClient |
| dify-client-python | Last updated June 2024 (v1.0.1), likely doesn't support latest Dify API features. Adds unnecessary abstraction. | Direct httpx calls to Dify REST API |
| Redux | Overkill for this app's state complexity. Adds boilerplate (actions, reducers, selectors) without proportional benefit. | Zustand |
| Next.js / Remix | SSR/SSG frameworks add complexity without benefit — this is a client-side SPA with a Python backend. No SEO requirements (it's a tool, not a content site). | Vite + React SPA |
| pdf-lib / jsPDF | Client-side PDF generation libraries. Resume PDFs need precise JIS-format layout with CJK fonts — server-side WeasyPrint with bundled fonts is far more reliable. | WeasyPrint (server-side) |
| MongoDB | No complex querying or relational data needed. This app is stateless — data flows through the pipeline and doesn't need persistence beyond temporary files. | Filesystem (temp files) or no DB |

## Stack Patterns by Variant

**If Dify workflows are slow (>30s):**
- Use streaming response mode with SSE from Dify → backend → frontend
- httpx `aiter_lines()` parses Dify SSE stream, FastAPI `StreamingResponse` forwards to frontend
- Frontend uses `EventSource` or fetch with `ReadableStream` for real-time progress

**If PaddleOCR is too heavy for deployment (>2GB with PaddlePaddle):**
- Use PaddleOCR's mobile/lightweight models (PP-OCRv5_mobile series)
- Or offload OCR to a separate microservice/container
- Or skip OCR entirely and accept only text-based input (PDF with selectable text, Word docs)

**If WeasyPrint CJK fonts cause issues:**
- Bundle Noto Sans JP/SC .otf files in the project
- Reference via `url()` in @font-face (not `local()`) for cross-platform reliability
- Use `FontConfiguration()` with absolute paths
- Test with both Docker and local environments

**If the app needs to scale beyond single-server:**
- Add Redis for job queue (Celery or arq) to handle PDF generation async
- Store files in S3-compatible object storage instead of local filesystem
- But: start simple with local filesystem — optimize only when needed

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| FastAPI 0.129.x | Pydantic 2.12.x | FastAPI deeply integrates with Pydantic v2. Do not use Pydantic v1. |
| FastAPI 0.129.x | Python 3.10+ | Dropped 3.9 support in 0.129.0. Target 3.12 for best performance. |
| PaddleOCR 3.4.x | PaddlePaddle 3.2.0 | Must install matching PaddlePaddle version. GPU optional (CPU works for resume-scale docs). |
| WeasyPrint 68.x | Python 3.10+ | Requires system libraries: Pango, Cairo, GDK-Pixbuf. Docker is the cleanest way to manage these. |
| React 19.2.x | react-router 7.13.x | React Router v7 supports React 18+. Works with React 19. |
| React 19.2.x | zustand 5.0.x | Zustand v5 requires React 18+, uses native `useSyncExternalStore`. |
| Vite 7.3.x | Tailwind CSS 4.x | Use `@tailwindcss/vite` plugin for first-party integration. |
| Vite 7.3.x | Node.js 20.19+ | Vite 7 requires Node 20.19+ or 22.12+. |
| react-pdf 10.3.x | pdfjs-dist 5.4.x | Bundled dependency, no separate install needed. |

## Sources

- React 19.2.4 — npmjs.com/package/react (verified Feb 2026) — **HIGH confidence**
- Vite 7.3.1 — npmjs.com/package/vite (verified Feb 2026) — **HIGH confidence**
- TypeScript 5.9.3 — npmjs.com/package/typescript (verified Feb 2026) — **HIGH confidence**
- Tailwind CSS 4.1.18 — npmjs.com/package/tailwindcss, tailwindcss.com/blog/tailwindcss-v4 — **HIGH confidence**
- FastAPI 0.129.0 — pypi.org/project/fastapi (verified Feb 2026) — **HIGH confidence**
- Pydantic 2.12.5 — pypi.org/project/pydantic (verified Feb 2026) — **HIGH confidence**
- WeasyPrint 68.1 — pypi.org/project/weasyprint (verified Feb 2026) — **HIGH confidence**
- PaddleOCR 3.4.0 — pypi.org/project/paddleocr (verified Feb 2026) — **HIGH confidence**
- httpx 0.28.1 — github.com/encode/httpx (verified Feb 2026) — **HIGH confidence**
- react-i18next 16.5.4 — npmjs.com/package/react-i18next (verified Feb 2026) — **HIGH confidence**
- react-router 7.13.0 — npmjs.com/package/react-router (verified Feb 2026) — **HIGH confidence**
- react-dropzone 14.4.x — npmjs.com/package/react-dropzone (verified Feb 2026) — **HIGH confidence**
- zustand 5.0.11 — npmjs.com/package/zustand (verified Feb 2026) — **HIGH confidence**
- react-pdf 10.3.0 — npmjs.com/package/react-pdf (verified Feb 2026) — **HIGH confidence**
- Jinja2 3.1.6 — pypi.org/project/Jinja2 (verified Feb 2026) — **HIGH confidence**
- python-multipart 0.0.22 — pypi.org/project/python-multipart (verified Feb 2026) — **HIGH confidence**
- Dify Workflow API — docs.dify.ai/api-reference/workflow-execution/execute-workflow — **HIGH confidence**
- WeasyPrint CJK support — stackoverflow.com/questions/59666234, github.com/Kozea/WeasyPrint/issues — **MEDIUM confidence** (community sources, not official docs)
- Noto Sans JP — fontsource.org/fonts/noto-sans-jp, notofonts.github.io — **HIGH confidence**
- Playwright PDF perf benchmarks — garstecki.gitlab.io/articles/crafting-gorgeous-pdfs-with-chromium — **MEDIUM confidence** (single-source benchmark)

---
*Stack research for: Chinese-to-Japanese Resume Conversion Web Application*
*Researched: 2026-02-18*

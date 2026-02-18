# Phase 4: Preview & PDF Generation - Research

**Researched:** 2026-02-18
**Domain:** HTML→PDF rendering with Jinja2 templates, React document preview, image cropping, inline editing
**Confidence:** HIGH

## Summary

Phase 4 connects the translated Japanese resume data (JpResumeData from Phase 3) to the validated HTML templates (from Phase 1) via Jinja2 template rendering. The core workflow is: frontend sends JpResumeData → backend renders Jinja2 template → returns HTML for preview or PDF bytes for download. The existing `pdf_generator.py` already handles WeasyPrint font configuration; it needs extension to accept Jinja2-rendered HTML rather than static template files.

The static HTML templates (`rirekisho.html`, `shokumukeirekisho.html`) must be converted to Jinja2 templates with `{{ variable | default('未記入') }}` for null field handling (DOCG-11). Photo handling requires both frontend cropping (react-easy-crop with 3:4 aspect ratio) and backend embedding as base64 data URIs in the HTML template. The preview architecture uses an iframe with `srcdoc` to display backend-rendered HTML, which guarantees visual fidelity between preview and PDF since both use identical HTML.

**Primary recommendation:** Convert static templates to Jinja2, render HTML on the backend for both preview (iframe srcdoc) and PDF (WeasyPrint), use react-easy-crop for photo cropping, and extend the existing JpResumeFieldEditor for inline preview editing with real-time re-rendering.

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| WeasyPrint | 63.1 | HTML→PDF conversion | Already validated in Phase 1; CJK font handling solved |
| Jinja2 | 3.1.6 | Template rendering with data | Already in requirements.txt but unused; standard Python templating |
| FastAPI | 0.115.8 | API endpoints for preview/PDF | Existing backend framework |
| react-pdf | 10.3.0 | PDF display in browser | Already installed for document viewer |
| Zustand | 5.0.11 | Frontend state management | Existing store pattern |

### New Frontend Dependencies
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-easy-crop | 5.5.6 | Photo upload cropping to 3:4 ratio | DOCG-07: Photo crop before embedding in 履歴書 |

### No New Backend Dependencies Needed
Jinja2 is already in `requirements.txt`. WeasyPrint, python-multipart (for file upload) are already installed. No additional packages required.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-easy-crop | react-image-crop | react-easy-crop has 1.1M weekly downloads, simpler API, built-in zoom/rotate; react-image-crop is lighter but more manual |
| iframe srcdoc preview | React component rendering | iframe guarantees visual fidelity with PDF output since both use identical HTML; React rendering would diverge from WeasyPrint rendering |
| Base64 photo embedding | File URL reference | Base64 is self-contained in HTML string, works identically in iframe preview and WeasyPrint; file URLs require disk persistence and platform-specific paths |

**Installation:**
```bash
cd frontend && npm install react-easy-crop
```

## Architecture Patterns

### Recommended Project Structure
```
backend/app/
├── templates/
│   ├── base.css                        # (exists) Shared print CSS
│   ├── rirekisho.html                  # Convert to Jinja2 template
│   └── shokumukeirekisho.html          # Convert to Jinja2 template
├── services/
│   ├── pdf_generator.py                # Extend: accept rendered HTML + photo
│   └── template_renderer.py            # NEW: Jinja2 rendering service
├── api/routes/
│   ├── preview.py                      # NEW: Preview HTML + PDF download endpoints
│   └── photo.py                        # NEW: Photo upload + crop endpoint
└── models/
    └── resume.py                       # (exists) Add photo_base64 field

frontend/src/
├── components/
│   ├── preview/
│   │   ├── PreviewPanel.tsx            # NEW: iframe srcdoc viewer with A4 scaling
│   │   ├── PhotoCropper.tsx            # NEW: react-easy-crop modal
│   │   └── PreviewToolbar.tsx          # NEW: Download PDF buttons, photo upload trigger
│   └── review/
│       └── JpResumeFieldEditor.tsx     # (exists) Reuse for inline editing
├── api/
│   └── client.ts                       # Extend: preview + PDF download + photo upload
└── stores/
    └── useResumeStore.ts               # Extend: croppedPhoto, previewHtml states
```

### Pattern 1: Backend-Rendered Preview (iframe srcdoc)
**What:** Frontend sends JpResumeData to backend → backend renders Jinja2 → returns HTML string → frontend displays in `<iframe srcdoc={html}>`.
**When to use:** Always, for both preview and PDF, to guarantee visual fidelity.
**Why:** The same HTML that renders in the iframe is the exact HTML WeasyPrint converts to PDF. No divergence between preview and final output.
**Example:**
```python
# backend/app/services/template_renderer.py
from jinja2 import Environment, FileSystemLoader
from app.config import TEMPLATES_DIR

env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=True,
)

def render_rirekisho(data: dict, photo_base64: str | None = None) -> str:
    template = env.get_template("rirekisho.html")
    return template.render(
        data=data,
        photo_base64=photo_base64,
        placeholder_text="未記入",
    )
```

```typescript
// Frontend: display in iframe
<iframe
  srcdoc={previewHtml}
  style={{ width: '210mm', height: '297mm', transform: `scale(${scale})` }}
  sandbox="allow-same-origin"
/>
```

### Pattern 2: Jinja2 Null-Field Handling with "未記入"
**What:** Use Jinja2 `default` filter to show "未記入" for null/empty fields.
**When to use:** Every dynamic field in both templates.
**Example:**
```html
<!-- In Jinja2 template -->
<td class="name-content">{{ data.personal_info.name | default('未記入', boolean=False) }}</td>

<!-- For conditional photo display -->
{% if photo_base64 %}
  <img src="data:image/jpeg;base64,{{ photo_base64 }}"
       style="width: 30mm; height: 40mm; object-fit: cover;">
{% else %}
  <div class="photo-area">写真を貼る位置<br><br>縦40mm×横30mm</div>
{% endif %}
```
**Critical:** The `boolean=False` parameter on `default` filter ensures `None` values are caught, not just undefined variables.

### Pattern 3: Photo Upload → Crop → Base64 Embedding
**What:** Frontend crops photo to 3:4 → sends as multipart to backend → backend converts to base64 → stores in session/memory → embeds in template.
**When to use:** DOCG-07 (photo upload) and DOCG-08 (placeholder when no photo).
**Example:**
```typescript
// Frontend: react-easy-crop with 3:4 aspect
<Cropper
  image={imageSrc}
  crop={crop}
  zoom={zoom}
  aspect={3 / 4}
  onCropChange={setCrop}
  onCropComplete={(_, croppedAreaPixels) => setCroppedPixels(croppedAreaPixels)}
  onZoomChange={setZoom}
/>
```

```python
# Backend: Convert uploaded image to base64 for template embedding
import base64
from fastapi import UploadFile

async def process_photo(file: UploadFile) -> str:
    contents = await file.read()
    return base64.b64encode(contents).decode("utf-8")
```

### Pattern 4: Dual-Endpoint Architecture (Preview HTML + PDF Download)
**What:** Two separate endpoints sharing the same Jinja2 rendering pipeline.
**When to use:** Preview returns HTML string; download returns PDF bytes.
**Example:**
```python
# Preview endpoint — returns HTML for iframe
@router.post("/api/preview/{doc_type}")
async def preview_document(doc_type: str, request: PreviewRequest):
    html = render_template(doc_type, request.jp_resume, request.photo_base64)
    return {"html": html}

# Download endpoint — returns PDF bytes
@router.post("/api/download/{doc_type}")
async def download_pdf(doc_type: str, request: PreviewRequest):
    html = render_template(doc_type, request.jp_resume, request.photo_base64)
    pdf_bytes = generate_pdf(html)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{doc_type}.pdf"'},
    )
```

### Anti-Patterns to Avoid
- **Rendering HTML in React then trying to match it to PDF:** The React rendering engine and WeasyPrint CSS engine differ. Always render HTML on the backend so preview === PDF.
- **Storing photo files on disk:** Base64 embedding in the HTML string is self-contained. Disk storage adds cleanup complexity, platform path issues, and WeasyPrint file:// URL headaches already solved in Phase 1.
- **Using flexbox/grid in templates:** Prior decision [01-02] mandates CSS tables with border-collapse: separate. WeasyPrint's CSS table support is validated; flexbox/grid support is partial.
- **Passing font_config to only one of CSS() or write_pdf():** Prior decision [01-03] — must pass to BOTH or get tofu glyphs.
- **Putting Jinja2 Environment creation inside request handlers:** Create it once at module level. Template compilation is cached by Jinja2's `Environment`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image cropping with aspect ratio | Canvas-based crop widget | react-easy-crop | Touch/zoom/rotation, output as pixel coordinates, 1.1M weekly downloads |
| Null field display | Manual `if/else` in every template tag | Jinja2 `default('未記入', boolean=False)` filter | Single-point control, handles None and undefined consistently |
| PDF generation from HTML | Custom PDF builder | WeasyPrint `generate_pdf()` (existing) | Already validated with CJK fonts, CSS tables, A4 page sizing |
| Cropped image to blob | Manual pixel manipulation | Canvas `toBlob()` with getCroppedImg utility | Standard pattern for react-easy-crop, handles all formats |
| Wareki date conversion | Date parsing in templates | Existing `toWareki()` utility from Phase 3 | Already handles gannen, all era boundaries, browser-native Intl |

**Key insight:** The hardest part of this phase (CJK font rendering, A4 layout, CSS table compatibility) was already solved in Phase 1. Phase 4 is primarily plumbing — connecting validated components through Jinja2 templating and API endpoints.

## Common Pitfalls

### Pitfall 1: Jinja2 autoescape Breaking HTML Structure
**What goes wrong:** Jinja2's `autoescape=True` escapes HTML entities in template variables, turning `<br>` into `&lt;br&gt;`.
**Why it happens:** Default security measure against XSS.
**How to avoid:** Use `autoescape=True` (safe default) but apply `| safe` filter only on trusted HTML content like the photo `<img>` tag. For text fields, autoescaping is correct — resume data should not contain HTML.
**Warning signs:** `&lt;` or `&amp;` visible in rendered preview.

### Pitfall 2: Preview-PDF Visual Divergence
**What goes wrong:** Preview in browser looks different from downloaded PDF.
**Why it happens:** If frontend renders its own HTML (React components) while PDF uses WeasyPrint.
**How to avoid:** ALWAYS render HTML on backend. Preview shows the exact same HTML string that WeasyPrint renders. Use iframe `srcdoc` to display it.
**Warning signs:** Fields appearing in different positions between preview and PDF.

### Pitfall 3: Photo Sizing in WeasyPrint vs Browser
**What goes wrong:** Photo appears at wrong size in PDF even though it looks correct in browser preview.
**Why it happens:** WeasyPrint interprets CSS dimensions in mm/pt for print; browser uses px. The `@page { size: A4 }` rule and mm-based dimensions in base.css handle this, but the photo `<img>` must also use mm dimensions.
**How to avoid:** Always style the photo with `width: 30mm; height: 40mm; object-fit: cover` (matching the JIS standard photo area). Never use px dimensions in the template.
**Warning signs:** Photo overflowing its cell or appearing tiny in PDF.

### Pitfall 4: Base64 Photo String Too Large for JSON Response
**What goes wrong:** A high-resolution photo encoded as base64 bloats the preview HTML JSON response.
**Why it happens:** Base64 encoding increases size by ~33%, and a 5MB photo becomes ~6.7MB base64 string in the HTML.
**How to avoid:** Resize/compress the cropped photo on the frontend (via canvas) before uploading. Target: 30mm×40mm at 300 DPI = 354×472 pixels. At JPEG quality 85, this should be ~30-80KB.
**Warning signs:** Slow preview loading, large network payloads.

### Pitfall 5: FONTCONFIG_FILE Must Be Set Before WeasyPrint Import
**What goes wrong:** CJK fonts render as tofu (□□□) despite correct font-face declarations.
**Why it happens:** Prior decision [02-03] — on Windows, the FONTCONFIG_FILE env var must be set before WeasyPrint is imported. If a new module imports WeasyPrint without this guard, fonts break.
**How to avoid:** The existing `pdf_generator.py` already sets this at module top-level. Import `generate_pdf` from that module; never import WeasyPrint directly in new modules.
**Warning signs:** □ characters in PDF output.

### Pitfall 6: Jinja2 Template Variables Missing from Context
**What goes wrong:** `UndefinedError` when rendering template because a field path like `data.personal_info.name` fails when `personal_info` is None.
**Why it happens:** Jinja2 cannot traverse into None objects.
**How to avoid:** Use the `default` filter at each level, or pass pre-processed data where None objects are replaced with empty dicts. The recommended approach: create a `prepare_template_context(jp_resume: JpResumeData)` function that normalizes all None sub-objects to empty instances.
**Warning signs:** 500 errors on preview with partial data.

### Pitfall 7: iframe srcdoc CSP and Sandbox Restrictions
**What goes wrong:** Styles or fonts don't load in iframe preview.
**Why it happens:** `sandbox` attribute on iframe restricts capabilities; some browsers block inline styles in srcdoc.
**How to avoid:** Use `sandbox="allow-same-origin"` to allow style application. All CSS should be inlined in the HTML (the templates already use `<style>` blocks). Don't reference external stylesheets in srcdoc content — inline everything including base.css.
**Warning signs:** Unstyled content in iframe preview.

## Code Examples

### Converting Static Template to Jinja2 (rirekisho.html)
```html
<!-- Before (static) -->
<td class="name-content">山田　太郎</td>

<!-- After (Jinja2) -->
<td class="name-content">{{ data.personal_info.name | default('未記入', boolean=False) }}</td>
```

```html
<!-- Photo area: conditional display -->
{% if photo_base64 %}
<td rowspan="3" class="photo-area" style="border: none; padding: 0;">
    <img src="data:image/jpeg;base64,{{ photo_base64 }}"
         style="width: 30mm; height: 40mm; object-fit: cover;">
</td>
{% else %}
<td rowspan="3" class="photo-area">
    写真を貼る位置<br><br>
    縦40mm×横30mm<br><br>
    裏面に氏名を記入
</td>
{% endif %}
```

### Template Renderer Service
```python
# backend/app/services/template_renderer.py
from jinja2 import Environment, FileSystemLoader
from app.config import TEMPLATES_DIR
from app.models.resume import JpResumeData

env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=True,
)

def prepare_context(jp_resume: JpResumeData) -> dict:
    """Normalize None sub-objects to avoid Jinja2 UndefinedError."""
    data = jp_resume.model_dump()
    if data.get("personal_info") is None:
        data["personal_info"] = {}
    if data.get("education") is None:
        data["education"] = []
    if data.get("work_history") is None:
        data["work_history"] = []
    if data.get("skills") is None:
        data["skills"] = []
    if data.get("certifications") is None:
        data["certifications"] = []
    return data

def render_document(template_name: str, jp_resume: JpResumeData,
                    photo_base64: str | None = None) -> str:
    template = env.get_template(template_name)
    context = prepare_context(jp_resume)
    return template.render(data=context, photo_base64=photo_base64)
```

### Preview Endpoint
```python
# backend/app/api/routes/preview.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.models.resume import JpResumeData
from app.services.template_renderer import render_document
from app.services.pdf_generator import generate_pdf

router = APIRouter()

TEMPLATE_MAP = {
    "rirekisho": "rirekisho.html",
    "shokumukeirekisho": "shokumukeirekisho.html",
}

class PreviewRequest(BaseModel):
    jp_resume: JpResumeData
    photo_base64: str | None = None

@router.post("/api/preview/{doc_type}")
async def preview_html(doc_type: str, request: PreviewRequest):
    filename = TEMPLATE_MAP.get(doc_type)
    if not filename:
        raise HTTPException(status_code=404, detail=f"Unknown document type: {doc_type}")
    html = render_document(filename, request.jp_resume, request.photo_base64)
    return {"html": html}

@router.post("/api/download/{doc_type}")
async def download_pdf(doc_type: str, request: PreviewRequest):
    filename = TEMPLATE_MAP.get(doc_type)
    if not filename:
        raise HTTPException(status_code=404, detail=f"Unknown document type: {doc_type}")
    html = render_document(filename, request.jp_resume, request.photo_base64)
    pdf_bytes = generate_pdf(html)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{doc_type}.pdf"'},
    )
```

### Photo Cropper Component (react-easy-crop)
```tsx
// frontend/src/components/preview/PhotoCropper.tsx
import Cropper from 'react-easy-crop';
import { useState, useCallback } from 'react';
import type { Area } from 'react-easy-crop';

interface PhotoCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function PhotoCropper({ imageSrc, onCropComplete, onCancel }: PhotoCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState<Area | null>(null);

  const onCropDone = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedPixels(croppedAreaPixels);
  }, []);

  return (
    <div>
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        aspect={3 / 4}
        onCropChange={setCrop}
        onCropComplete={onCropDone}
        onZoomChange={setZoom}
      />
      {/* Confirm/Cancel buttons trigger getCroppedImg utility */}
    </div>
  );
}
```

### getCroppedImg Canvas Utility
```typescript
// frontend/src/utils/cropImage.ts
import type { Area } from 'react-easy-crop';

const TARGET_WIDTH = 354;   // 30mm at 300 DPI
const TARGET_HEIGHT = 472;  // 40mm at 300 DPI

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, TARGET_WIDTH, TARGET_HEIGHT,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.85);
  });
}
```

### Inline CSS Inlining for iframe srcdoc
```python
# In template_renderer.py: inline base.css into rendered HTML for srcdoc
def render_document_for_preview(template_name: str, jp_resume: JpResumeData,
                                photo_base64: str | None = None) -> str:
    """Render with inlined base.css for iframe srcdoc display."""
    html = render_document(template_name, jp_resume, photo_base64)
    base_css = (TEMPLATES_DIR / "base.css").read_text(encoding="utf-8")
    # Replace the <link rel="stylesheet" href="base.css"> with inline <style>
    html = html.replace(
        '<link rel="stylesheet" href="base.css">',
        f'<style>{base_css}</style>',
    )
    return html
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static HTML templates with hardcoded data | Jinja2 templates with dynamic rendering | Phase 4 (now) | Enables actual resume data in documents |
| `generate_pdf_from_template()` reading file directly | `generate_pdf()` with Jinja2-rendered HTML string | Phase 4 (now) | Dynamic data flows through same PDF pipeline |
| PhotoDropzone (upload only, no crop) | react-easy-crop with 3:4 ratio → canvas resize | Phase 4 (now) | DOCG-07 compliance, correct photo dimensions |
| No preview — test-pdf endpoint only | Dual preview+download endpoints | Phase 4 (now) | Users see documents before downloading |

**Note:** The existing `generate_pdf_from_template()` in `pdf_generator.py` and the test-pdf endpoints in `main.py` were scaffolding for Phase 1 validation. Phase 4 replaces them with the Jinja2-rendered pipeline. The `generate_pdf(html_content)` function remains unchanged — it already accepts arbitrary HTML strings.

## Open Questions

1. **Preview re-render debouncing**
   - What we know: Users edit fields → preview updates. Each edit triggers a backend render call.
   - What's unclear: Optimal debounce interval for re-rendering. Too fast = excessive API calls; too slow = sluggish UX.
   - Recommendation: Use 500ms debounce on field changes before sending preview render request. Show loading indicator during render.

2. **Photo persistence across page refreshes**
   - What we know: `useResumeStore` has `photoFile: File | null` but no persistence. Prior decision [02-02] states no persist middleware because File objects aren't serializable.
   - What's unclear: Whether users expect photo to survive page refresh.
   - Recommendation: Accept the ephemeral nature for now. Photo re-upload is fast. Base64 string could be persisted in localStorage as a future enhancement.

3. **Two-document preview layout**
   - What we know: Users need to preview BOTH 履歴書 and 職務経歴書.
   - What's unclear: Side-by-side vs tabs vs vertical scroll.
   - Recommendation: Tab-based switching between documents. Each tab shows its own preview. Both download as separate PDFs (not merged).

## Sources

### Primary (HIGH confidence)
- WeasyPrint 63.1 API Reference — https://doc.courtbouillon.org/weasyprint/v63.1/api_reference.html — write_pdf(), CSS(), FontConfiguration API, DEFAULT_OPTIONS verified
- Existing codebase (`pdf_generator.py`, `rirekisho.html`, `shokumukeirekisho.html`, `base.css`) — Template structure, font handling, CSS table patterns verified
- react-easy-crop npm — https://www.npmjs.com/package/react-easy-crop — v5.5.6, aspect prop, onCropComplete API verified

### Secondary (MEDIUM confidence)
- Jinja2 `default` filter with `boolean=False` — verified via multiple StackOverflow sources and Jinja2 docs; handles None values specifically
- Base64 image embedding in WeasyPrint — verified via GitHub issue #689 and StackOverflow; use `style` attribute for sizing, not HTML width/height attributes
- getCroppedImg canvas utility — verified pattern from react-easy-crop documentation and multiple community implementations

### Tertiary (LOW confidence)
- iframe srcdoc sandbox behavior with inline styles — varies by browser; needs testing in target browsers (Chrome, Edge at minimum)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All core libraries already installed and validated; only react-easy-crop is new
- Architecture: HIGH — Backend-rendered HTML for both preview and PDF is the proven pattern; existing pdf_generator.py already supports this workflow
- Pitfalls: HIGH — Most pitfalls (font config, CSS tables, FONTCONFIG_FILE) were discovered and solved in Phase 1; Jinja2 null handling is well-documented
- Photo handling: MEDIUM — Base64 embedding is verified but optimal resize dimensions (354×472px at 300DPI) need validation with actual WeasyPrint output

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (30 days — all libraries are stable releases)

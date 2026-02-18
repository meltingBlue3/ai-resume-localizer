# Phase 1: Foundation & Risk Mitigation - Research

**Researched:** 2026-02-18
**Domain:** React SPA scaffolding, i18n, WeasyPrint PDF generation, JIS 履歴書/職務経歴書 HTML templates
**Confidence:** HIGH

## Summary

Phase 1 builds the project skeleton (React frontend + FastAPI backend), a navigable 5-step wizard shell with bilingual UI (Chinese/Japanese), and — most critically — validates that static JIS 履歴書 and 職務経歴書 HTML templates render correctly as A4 PDFs through WeasyPrint with CJK fonts.

The highest-risk item is the 履歴書 HTML template. The JIS format is a rigid tabular grid with exact cell dimensions, photo placement, and dense CJK text. WeasyPrint's CSS engine is not a browser — it has partial flexbox support (buggy), partial grid support, and known issues with `border-collapse: collapse` on tables. The safest path is **CSS tables with `table-layout: fixed` and explicit mm-based dimensions**, avoiding flexbox/grid entirely for the resume template. Existing open-source JIS 履歴書 HTML templates (resume.jp, resume-maker) use flexbox or browser-only features — they cannot be used with WeasyPrint directly and must be reimplemented using WeasyPrint-compatible CSS.

The frontend wizard is straightforward: Zustand for step state management, react-i18next for bilingual UI, and independent step components. The i18n setup is low-risk with well-documented patterns.

**Primary recommendation:** Build the 履歴書 HTML/CSS template first using only CSS tables and absolute positioning with mm units, test it through WeasyPrint immediately, and iterate until the grid renders correctly at A4 dimensions. Everything else in Phase 1 is standard React/FastAPI scaffolding with low risk.

## Standard Stack

### Core (Phase 1 Specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | Frontend UI framework | Current stable. Hooks-first API, concurrent features. |
| Vite | 7.x | Build tool + dev server | Current stable. Sub-second HMR, native ESM. CRA deprecated. |
| TypeScript | 5.9.x | Type safety | Catches data shape bugs at compile time. |
| Tailwind CSS | 4.x | UI styling (wizard shell, layout) | CSS-first config in v4. Use `@tailwindcss/vite` plugin. NOT for resume PDF templates. |
| Python | 3.12+ | Backend runtime | Required by FastAPI 0.129+ and WeasyPrint 68.x. |
| FastAPI | 0.129.x | Backend API framework | Async-native, auto OpenAPI docs, Pydantic integration. |
| WeasyPrint | 68.1 | HTML/CSS → PDF generation | No browser dependency, strong CSS Paged Media support. The chosen PDF engine. |

### Supporting (Phase 1 Specific)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-i18next | 16.x | Internationalization (CN/JP UI) | Always — bilingual UI is a Phase 1 requirement. `useTranslation` hook, JSON translation files. |
| i18next | 25.x | i18n core engine | Always — required by react-i18next. Language detection, interpolation, namespace support. |
| i18next-browser-languagedetector | latest | Auto-detect browser language | Init — detects user's browser language on first visit. |
| zustand | 5.x | Wizard step state management | Always — stores current step index and placeholder data. Persist middleware optional for page refresh survival. |
| react-router | 7.x | Client-side routing | Always — each wizard step maps to a route for direct linking and browser back/forward. |
| Jinja2 | 3.1.x | HTML template engine | PDF generation — renders resume data into HTML before WeasyPrint converts to PDF. |
| uvicorn | 0.34.x | ASGI server | Always — production ASGI server for FastAPI. |
| Noto Sans JP | — | CJK font for PDFs | Always — bundled .ttf/.otf files, referenced via `url()` in @font-face. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS tables for 履歴書 grid | CSS flexbox | WeasyPrint flexbox is ~58% compliant (470/810 tests), known crashes with certain patterns. Tables are CSS 2.1 — rock-solid in WeasyPrint. **Use tables.** |
| CSS tables for 履歴書 grid | CSS Grid | WeasyPrint grid support is even more limited than flexbox: no auto-sizing, no subgrid, no inline-grid. **Do not use.** |
| WeasyPrint | Playwright (headless Chromium) | Full CSS support but +200MB Chromium binary, ~700ms warm / ~2200ms cold start per render. Reserve as fallback only if WeasyPrint proves impossible for the 履歴書 grid. |
| Zustand | React Context | Context causes unnecessary re-renders when wizard data changes. Zustand uses external store with selective subscriptions. |
| react-i18next | FormatJS (react-intl) | react-intl is ICU MessageFormat-based — heavier, steeper learning curve, overkill for simple label translation. react-i18next has simpler JSON files and `t()` API. |

### Installation (Phase 1)

```bash
# Frontend
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install react-router react-i18next i18next i18next-browser-languagedetector zustand
npm install -D tailwindcss @tailwindcss/vite

# Backend
cd ../backend
python -m venv .venv
pip install fastapi==0.129.0 uvicorn[standard] jinja2==3.1.6
pip install weasyprint==68.1
```

## Architecture Patterns

### Recommended Project Structure (Phase 1 Deliverables)

```
ai-resume-localizer/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                     # Shared UI components (Button, etc.)
│   │   │   └── wizard/                 # WizardShell, StepIndicator, StepNavigation
│   │   ├── steps/
│   │   │   ├── UploadStep.tsx          # Placeholder content
│   │   │   ├── ReviewExtractionStep.tsx
│   │   │   ├── ReviewTranslationStep.tsx
│   │   │   ├── PreviewStep.tsx
│   │   │   └── DownloadStep.tsx
│   │   ├── stores/
│   │   │   └── useWizardStore.ts       # Zustand: currentStep, stepData, navigation actions
│   │   ├── i18n/
│   │   │   ├── index.ts               # i18next init config
│   │   │   └── locales/
│   │   │       ├── zh/                 # Chinese translations (primary)
│   │   │       │   ├── common.json
│   │   │       │   └── wizard.json
│   │   │       └── ja/                 # Japanese translations (secondary)
│   │   │           ├── common.json
│   │   │           └── wizard.json
│   │   ├── App.tsx                     # Router + WizardShell
│   │   └── main.tsx                    # Entry, i18n import
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── templates/
│   │   │   ├── rirekisho.html          # 履歴書 JIS-format HTML/CSS (static)
│   │   │   ├── shokumukeirekisho.html  # 職務経歴書 HTML/CSS (static)
│   │   │   └── base.css               # Shared print styles, @font-face
│   │   ├── fonts/
│   │   │   ├── NotoSansJP-Regular.ttf
│   │   │   ├── NotoSansJP-Bold.ttf
│   │   │   └── NotoSansJP-Light.ttf
│   │   ├── services/
│   │   │   └── pdf_generator.py        # WeasyPrint PDF generation service
│   │   ├── config.py                   # Settings
│   │   └── main.py                     # FastAPI app, CORS, health endpoint
│   ├── tests/
│   │   └── test_pdf_generation.py      # PDF rendering validation tests
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

### Pattern 1: Zustand Wizard Store

**What:** A single Zustand store manages the wizard's step index, navigation actions, and placeholder data for each step. Each step component reads/writes its own slice of the store.

**When to use:** Multi-step wizard where data must persist across step navigation (back/forward) without loss.

**Example:**

```typescript
// stores/useWizardStore.ts
import { create } from 'zustand';

interface WizardState {
  currentStep: number;
  totalSteps: number;
  stepData: Record<number, unknown>;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStepData: (step: number, data: unknown) => void;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  currentStep: 0,
  totalSteps: 5,
  stepData: {},
  setStep: (step) => {
    if (step >= 0 && step < get().totalSteps) {
      set({ currentStep: step });
    }
  },
  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },
  setStepData: (step, data) =>
    set((state) => ({
      stepData: { ...state.stepData, [step]: data },
    })),
}));
```

### Pattern 2: i18n Configuration with Chinese Primary

**What:** Initialize i18next with Chinese (zh) as the default language, Japanese (ja) as fallback-secondary, namespace-based JSON files, and browser language detection.

**Example:**

```typescript
// i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCommon from './locales/zh/common.json';
import zhWizard from './locales/zh/wizard.json';
import jaCommon from './locales/ja/common.json';
import jaWizard from './locales/ja/wizard.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zh: { common: zhCommon, wizard: zhWizard },
      ja: { common: jaCommon, wizard: jaWizard },
    },
    lng: 'zh',
    fallbackLng: 'zh',
    defaultNS: 'common',
    ns: ['common', 'wizard'],
    interpolation: { escapeValue: false },
  });

export default i18n;
```

**Language switcher pattern:**

```typescript
// LanguageSwitcher component
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div>
      <button onClick={() => i18n.changeLanguage('zh')}>中文</button>
      <button onClick={() => i18n.changeLanguage('ja')}>日本語</button>
    </div>
  );
}
```

### Pattern 3: WeasyPrint PDF Generation with Bundled CJK Fonts

**What:** A service that renders Jinja2 HTML templates to PDF using WeasyPrint with explicitly bundled Noto Sans JP font files via `url()` in `@font-face`. Font files are referenced by absolute path to avoid resolution issues.

**Example:**

```python
# services/pdf_generator.py
from pathlib import Path
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

FONTS_DIR = Path(__file__).parent.parent / "fonts"
TEMPLATES_DIR = Path(__file__).parent.parent / "templates"

def generate_pdf(html_content: str) -> bytes:
    font_config = FontConfiguration()

    font_css = CSS(string=f"""
        @font-face {{
            font-family: 'Noto Sans JP';
            font-weight: 400;
            src: url('file://{FONTS_DIR / "NotoSansJP-Regular.ttf"}');
        }}
        @font-face {{
            font-family: 'Noto Sans JP';
            font-weight: 700;
            src: url('file://{FONTS_DIR / "NotoSansJP-Bold.ttf"}');
        }}
    """, font_config=font_config)

    html = HTML(string=html_content)
    return html.write_pdf(
        stylesheets=[font_css],
        font_config=font_config,
    )
```

### Pattern 4: 履歴書 HTML Template with CSS Tables (WeasyPrint-Compatible)

**What:** The 履歴書 template uses HTML `<table>` elements with `table-layout: fixed`, explicit `mm`-based widths and heights, and `@page { size: A4 }` — zero flexbox, zero CSS grid.

**Critical constraints:**
- WeasyPrint renders with its own CSS engine, not a browser
- `border-collapse: collapse` has known bugs in WeasyPrint — use `border-collapse: separate; border-spacing: 0;` with borders on individual cells instead
- All dimensions in `mm` for print accuracy
- Use `page-break-before: always` for page 2
- Photo area: 30mm × 40mm, positioned via table cell or absolute positioning

**Example CSS approach:**

```css
/* base.css — shared print styles for resume templates */
@page {
    size: A4;
    margin: 15mm 15mm 15mm 15mm;
}

body {
    font-family: 'Noto Sans JP', sans-serif;
    font-size: 10.5pt;
    line-height: 1.4;
    margin: 0;
    padding: 0;
}

/* Use separate borders to avoid WeasyPrint border-collapse bugs */
table {
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
}

th, td {
    border: 0.5pt solid black;
    padding: 2mm;
    vertical-align: top;
    font-weight: normal;
    text-align: left;
}

/* Merge adjacent borders visually */
td + td, th + th, td + th, th + td {
    border-left: none;
}
tr + tr > td, tr + tr > th {
    border-top: none;
}

.page {
    width: 180mm; /* A4 width minus margins */
    position: relative;
}

.page-break {
    page-break-before: always;
}

/* Photo area */
.photo-cell {
    width: 30mm;
    height: 40mm;
    text-align: center;
    vertical-align: middle;
}

/* Ruby/furigana support */
ruby {
    ruby-align: center;
}
rt {
    font-size: 0.5em;
}
```

### Anti-Patterns to Avoid

- **Using flexbox or CSS Grid in resume PDF templates:** WeasyPrint's flexbox is ~58% compliant with known crashes. CSS Grid is even less complete. Use CSS tables with `table-layout: fixed` for the 履歴書 grid.
- **Using `border-collapse: collapse` in WeasyPrint tables:** Known bugs cause double borders, missing borders on page breaks, and crashes. Use `border-collapse: separate; border-spacing: 0` and manage border visibility with cell-level rules.
- **Using `local()` in @font-face for CJK fonts:** WeasyPrint's `local()` font loading is unreliable for CJK. Use `url()` with explicit file paths.
- **Testing resume templates only in a browser:** The template MUST be tested through WeasyPrint, not Chrome. What renders in Chrome will NOT render identically in WeasyPrint.
- **Using relative font paths:** WeasyPrint resolves paths relative to the HTML base URI, which varies between API and CLI contexts. Use absolute `file://` paths.
- **Building the wizard shell first and templates last:** The 履歴書 template is the highest-risk item. Build and validate it with WeasyPrint early.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Internationalization | Custom locale lookup/string replacement | react-i18next + i18next | Handles plurals, interpolation, namespace loading, language detection, React Suspense integration. 100+ edge cases. |
| Step wizard navigation | Custom state with useState/useReducer | Zustand store with step actions | Zustand handles cross-component state without prop drilling, supports persist middleware, no Context provider needed. |
| PDF generation from HTML | Custom PDF library (jsPDF, pdf-lib) | WeasyPrint (server-side) | Client-side PDF generation cannot handle CJK font embedding, precise mm-unit layouts, or multi-page tables reliably. |
| CJK font rendering | System font dependencies | Bundled Noto Sans JP via @font-face url() | System fonts vary by OS and deployment environment. Bundled fonts guarantee consistent rendering everywhere. |
| CSS framework for print layout | Tailwind/Bootstrap for PDF templates | Hand-written CSS with mm units | CSS frameworks target screen display, not print. Resume PDFs need exact mm dimensions, @page rules, and print-specific CSS that frameworks don't support. |

**Key insight:** The resume PDF templates live in a completely different CSS domain from the web UI. The wizard shell uses Tailwind for modern responsive design; the PDF templates use raw CSS with mm units, @page rules, and @font-face. These two CSS worlds must never mix.

## Common Pitfalls

### Pitfall 1: WeasyPrint Flexbox Crashes

**What goes wrong:** Template uses flexbox for layout. Works in browser. WeasyPrint crashes with `IndexError` or renders layout completely wrong.
**Why it happens:** WeasyPrint v65+ rewrote flexbox support but only passes ~58% of W3C tests. SVG children in flexboxes crash. Intrinsic sizing doesn't work. Fragmentation across pages breaks.
**How to avoid:** Use CSS tables exclusively for the 履歴書 grid. Reserve flexbox only for simple, non-critical inline layouts if needed.
**Warning signs:** Any `display: flex` in the resume template CSS.

### Pitfall 2: Tofu Glyphs (□) in PDF Output

**What goes wrong:** Japanese characters render as empty rectangles in the PDF. The PDF generates without errors.
**Why it happens:** CJK fonts not loaded by WeasyPrint. Using `local()` instead of `url()` in @font-face. FontConfiguration not passed to both CSS and write_pdf(). Font file path is wrong.
**How to avoid:** Bundle Noto Sans JP .ttf files in `backend/app/fonts/`. Use `url('file:///absolute/path/NotoSansJP-Regular.ttf')` in @font-face. Create `FontConfiguration()` and pass to BOTH `CSS(string=..., font_config=font_config)` and `html.write_pdf(font_config=font_config)`.
**Warning signs:** PDF file is suspiciously small (<50KB for a multi-page document with CJK text). Opening PDF on a system without CJK fonts shows rectangles.

### Pitfall 3: WeasyPrint border-collapse Bugs

**What goes wrong:** Table borders appear doubled, disappear on page breaks, or cause crashes when using `border-collapse: collapse`.
**Why it happens:** WeasyPrint has documented bugs with collapsed borders (#2333, #1278, #1523). When table cells split across pages, border arrays can become mismatched causing IndexError.
**How to avoid:** Use `border-collapse: separate; border-spacing: 0`. Apply borders to individual cells. Remove duplicate borders using `td + td { border-left: none }` and `tr + tr > td { border-top: none }` patterns.
**Warning signs:** Double-thick borders, missing borders on page 2, crashes during PDF generation with table content.

### Pitfall 4: Resume Template Looks Different in Browser vs WeasyPrint

**What goes wrong:** Template looks perfect in Chrome but renders incorrectly in WeasyPrint — wrong spacing, broken layout, missing features.
**Why it happens:** WeasyPrint has its own CSS engine. It doesn't support: viewport units (vw, vh), box-shadow, `::first-line`, CSS Grid auto-sizing, many flexbox features. Computed values may differ from Chrome.
**How to avoid:** Test EVERY template change through WeasyPrint's actual PDF output, not in a browser. Write a test script that generates a PDF and opens it. Limit CSS to features known to work: tables, positioning, basic box model, @page, @font-face.
**Warning signs:** Template development happening entirely in browser DevTools without WeasyPrint verification.

### Pitfall 5: WeasyPrint System Dependencies on Windows

**What goes wrong:** `pip install weasyprint` succeeds but import fails with missing Pango/Cairo/GDK-Pixbuf errors on Windows.
**Why it happens:** WeasyPrint depends on system libraries (Pango, Cairo, GDK-Pixbuf) which are not Python packages. On Linux they install via apt. On Windows they require GTK3 runtime or MSYS2.
**How to avoid:** Install GTK3 runtime for Windows (e.g., via MSYS2 `pacman -S mingw-w64-x86_64-pango`), or use Docker for the backend. Docker is the most reliable approach for WeasyPrint across all platforms.
**Warning signs:** `OSError: cannot load library 'libpango'` or similar on Windows.

### Pitfall 6: i18n Keys Mismatch Between Chinese and Japanese

**What goes wrong:** UI shows raw translation keys like `wizard.step.upload` instead of translated text in one language.
**Why it happens:** JSON translation files for zh and ja have different key structures. One language has the key, the other doesn't. No compile-time validation.
**How to avoid:** Use TypeScript to define translation key types. Keep zh and ja JSON files structurally identical. Add a simple CI check that both locale files have the same keys.
**Warning signs:** Untranslated keys visible in the UI when switching languages.

### Pitfall 7: JIS Standard Confusion (Deprecated vs MHLW Format)

**What goes wrong:** Building a template based on the old JIS B4/A3-folded format instead of the modern A4 format.
**Why it happens:** JIS 規格 for 履歴書 was officially deprecated in July 2020. The current recommendation is 厚生労働省推奨様式 (MHLW recommended format). However, both are widely accepted. Many online resources still reference the old JIS format.
**How to avoid:** Use A4 size (210mm × 297mm). Follow the MHLW-recommended field layout, which removes gender as a required field and simplifies some sections. Both formats are accepted by employers.
**Warning signs:** Template targets B5 or A3 landscape format. Template has mandatory gender field (removed from MHLW format in 2021).

## Code Examples

### WeasyPrint A4 PDF Generation Test

```python
# tests/test_pdf_generation.py
"""
Validation test: generate a static 履歴書 PDF with CJK text
and verify it renders correctly.
"""
from pathlib import Path
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

FONTS_DIR = Path(__file__).parent.parent / "app" / "fonts"
TEMPLATES_DIR = Path(__file__).parent.parent / "app" / "templates"

def test_rirekisho_pdf_generation():
    font_config = FontConfiguration()

    base_css = CSS(filename=str(TEMPLATES_DIR / "base.css"), font_config=font_config)
    font_css = CSS(string=f"""
        @font-face {{
            font-family: 'Noto Sans JP';
            font-weight: 400;
            src: url('file://{FONTS_DIR / "NotoSansJP-Regular.ttf"}');
        }}
        @font-face {{
            font-family: 'Noto Sans JP';
            font-weight: 700;
            src: url('file://{FONTS_DIR / "NotoSansJP-Bold.ttf"}');
        }}
    """, font_config=font_config)

    html_path = TEMPLATES_DIR / "rirekisho.html"
    html = HTML(filename=str(html_path))
    pdf_bytes = html.write_pdf(
        stylesheets=[base_css, font_css],
        font_config=font_config,
    )

    assert len(pdf_bytes) > 10_000, "PDF too small — fonts likely not embedded"

    output_path = Path(__file__).parent / "output" / "rirekisho_test.pdf"
    output_path.parent.mkdir(exist_ok=True)
    output_path.write_bytes(pdf_bytes)
    print(f"Test PDF written to: {output_path}")
```

### Minimal 履歴書 HTML Template Structure (WeasyPrint-Compatible)

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="base.css">
    <style>
        .header-row td { height: 8mm; }
        .name-cell { height: 20mm; font-size: 18pt; }
        .furigana-cell { height: 10mm; font-size: 8pt; color: #666; }
        .history-row td { height: 8mm; }
        .year-col { width: 18mm; text-align: center; }
        .month-col { width: 12mm; text-align: center; }
        .photo-area {
            width: 30mm;
            height: 40mm;
            border: 0.5pt dashed #999;
            text-align: center;
            vertical-align: middle;
            font-size: 8pt;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="page">
        <!-- Title + Date row -->
        <table>
            <tr>
                <td style="width: 70%; border: none; font-size: 18pt; letter-spacing: 0.5em;">
                    履 歴 書
                </td>
                <td style="border: none; text-align: right;">
                    令和7年 2月 18日現在
                </td>
            </tr>
        </table>

        <!-- Personal info section -->
        <table>
            <colgroup>
                <col style="width: 15mm;">
                <col style="width: auto;">
                <col style="width: 30mm;">
            </colgroup>
            <!-- Furigana row -->
            <tr class="header-row">
                <td class="furigana-cell">ふりがな</td>
                <td class="furigana-cell">ヤマダ タロウ</td>
                <td rowspan="2" class="photo-area">
                    写真<br>縦40mm<br>横30mm
                </td>
            </tr>
            <!-- Name row -->
            <tr>
                <td>氏名</td>
                <td class="name-cell">山田 太郎</td>
            </tr>
            <!-- DOB + gender -->
            <tr class="header-row">
                <td>生年月日</td>
                <td colspan="2">平成7年 4月 1日 (満30歳)</td>
            </tr>
        </table>

        <!-- Education/Work history -->
        <table>
            <colgroup>
                <col class="year-col">
                <col class="month-col">
                <col>
            </colgroup>
            <thead>
                <tr><th>年</th><th>月</th><th>学歴・職歴</th></tr>
            </thead>
            <tbody>
                <tr><td></td><td></td><td style="text-align: center; font-weight: bold;">学歴</td></tr>
                <tr class="history-row"><td>平成23</td><td>3</td><td>○○中学校 卒業</td></tr>
                <tr class="history-row"><td>平成23</td><td>4</td><td>○○高等学校 入学</td></tr>
                <!-- ... more rows ... -->
                <tr><td></td><td></td><td style="text-align: center; font-weight: bold;">職歴</td></tr>
                <tr class="history-row"><td>平成30</td><td>4</td><td>株式会社○○ 入社</td></tr>
                <tr><td></td><td></td><td style="text-align: right;">以上</td></tr>
            </tbody>
        </table>
    </div>

    <!-- Page 2 -->
    <div class="page page-break">
        <table>
            <colgroup>
                <col class="year-col">
                <col class="month-col">
                <col>
            </colgroup>
            <thead>
                <tr><th>年</th><th>月</th><th>免許・資格</th></tr>
            </thead>
            <tbody>
                <tr class="history-row"><td>平成27</td><td>8</td><td>普通自動車第一種運転免許</td></tr>
            </tbody>
        </table>

        <!-- Motivation, hobbies, etc. -->
        <table>
            <tr>
                <td style="width: 25mm; font-weight: bold;">志望動機</td>
                <td style="height: 40mm;">貴社の事業に強い関心を持っております。</td>
            </tr>
            <tr>
                <td style="font-weight: bold;">趣味・特技</td>
                <td style="height: 20mm;">読書、プログラミング</td>
            </tr>
        </table>
    </div>
</body>
</html>
```

### Vite + Tailwind CSS 4 Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
```

```css
/* src/index.css — Tailwind v4 uses @import, not @tailwind directives */
@import "tailwindcss";
```

### FastAPI Minimal Server (Phase 1)

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Resume Localizer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health():
    return {"status": "ok"}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CRA (Create React App) | Vite with react-ts template | Feb 2025 (CRA deprecated) | Must use Vite. CRA is dead. |
| Tailwind v3 (`@tailwind` directives, tailwind.config.js) | Tailwind v4 (`@import "tailwindcss"`, `@tailwindcss/vite` plugin) | 2025 | CSS-first config. No PostCSS or Autoprefixer needed. |
| JIS規格 履歴書 (B4 folded, mandatory gender) | 厚生労働省推奨様式 (A4, gender optional) | July 2020 | Target A4 format. Gender field optional. |
| WeasyPrint without flexbox | WeasyPrint v65+ with partial flexbox (58%) | Late 2024 | Flexbox is usable for simple layouts but unreliable for complex grids. Still use tables for 履歴書. |
| i18next v20 with @loadable namespaces | i18next v25 with built-in lazy loading | 2025 | Simpler setup, better React 19 integration. |

**Deprecated/outdated:**
- Create React App: deprecated Feb 2025, do not use
- JIS B4/A3 履歴書 format: deprecated July 2020, use A4
- `@tailwind base; @tailwind components; @tailwind utilities;`: Tailwind v3 syntax, use `@import "tailwindcss"` in v4
- WeasyPrint `local()` for CJK fonts: unreliable, always use `url()` with file paths

## Open Questions

1. **WeasyPrint table rendering for complex 履歴書 grid**
   - What we know: Basic CSS tables work in WeasyPrint. `border-collapse: collapse` is buggy. `table-layout: fixed` with mm dimensions is the recommended approach.
   - What's unclear: Can the full JIS 履歴書 grid (with merged cells, rowspan/colspan, photo area) render pixel-perfectly at A4 dimensions? The photo area placement (absolute or as a table cell?) needs experimentation.
   - Recommendation: Build a prototype template in the first plan and validate through WeasyPrint immediately. If the table approach fails for complex cell merging, fall back to absolute positioning with explicit coordinates.

2. **WeasyPrint on Windows development**
   - What we know: WeasyPrint requires Pango, Cairo, GDK-Pixbuf system libraries. These are native on Linux, installable on macOS via Homebrew, but complex on Windows.
   - What's unclear: Whether the developer's Windows environment can run WeasyPrint natively or needs Docker.
   - Recommendation: Try `pip install weasyprint` first. If it fails, set up a Docker container for the backend with WeasyPrint pre-installed. GTK3 for Windows (MSYS2) is the native alternative.

3. **Noto Sans JP font weights and file sizes**
   - What we know: Noto Sans JP comes in multiple weights. The full font family is large (100MB+). Resume PDFs need Regular and Bold at minimum.
   - What's unclear: Whether WeasyPrint subsets fonts automatically or embeds the entire font file.
   - Recommendation: Bundle only Regular (400) and Bold (700) weight .ttf files. Test PDF file size. If PDFs are >5MB, investigate WeasyPrint's `--full-fonts` option vs default subsetting.

4. **Ruby (furigana) support in WeasyPrint**
   - What we know: The `<ruby>` and `<rt>` HTML elements are part of the 履歴書 format (furigana above name/address). Browser rendering is well-defined.
   - What's unclear: How well WeasyPrint renders `<ruby>` elements — alignment, font size, spacing.
   - Recommendation: Include ruby markup in the test template and verify rendering in WeasyPrint early. If ruby rendering is poor, fall back to a two-row table pattern (small furigana row above main text row).

## Sources

### Primary (HIGH confidence)
- WeasyPrint 68.1 official documentation — https://doc.courtbouillon.org/weasyprint/stable/ — API reference, @page rules, @font-face, FontConfiguration
- WeasyPrint features list (CSS support) — https://doc.courtbouillon.org/weasyprint/v0.42.3/features.html — CSS 2.1 tables, positioning, @page fully supported
- WeasyPrint v65 release notes — https://www.courtbouillon.org/blog/00057-weasyprint-65/ — flexbox rewrite, 470/810 tests passing
- react-i18next official docs — https://react.i18next.com/ — quick start, namespaces, useTranslation hook
- i18next namespaces docs — https://www.i18next.com/principles/namespaces — file structure, configuration
- Tailwind CSS v4 Vite installation — https://tailwindcss.com/docs/installation/using-vite — `@tailwindcss/vite` plugin, `@import "tailwindcss"`
- Vite official docs — scaffolding with `npm create vite@latest`

### Secondary (MEDIUM confidence)
- WeasyPrint GitHub issues: #2333 (border-collapse bug), #2145 (grid enhancement tracking), #2400 (flexbox issues), #1337 (CJK font @font-face), #1523 (table crash with page breaks) — multiple community reports confirming patterns
- resume.jp (stsysd/resume.jp) — JIS 履歴書 HTML template reference, A3 landscape → 2× A4 page layout, LESS-based CSS with flexbox
- PruneMazui/resume-maker — JIS 履歴書 from JSON config, template structure reference
- Zustand multi-step wizard pattern — https://www.buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps — Zustand + React Hook Form + Zod pattern
- JIS 履歴書 format overview — https://japanhandbook.com/writing-a-japanese-resume-rirekisho-template-and-tips-for-expats/ — 8-section structure, photo 30×40mm, standard fields
- 厚生労働省推奨様式 (JIS deprecated July 2020) — https://keireki.net/rrjiskkdr/ — A4 standard, gender field now optional

### Tertiary (LOW confidence)
- WeasyPrint @font-face on Windows — unclear if fully supported in v68; open issue #2227 suggests native Windows font backends not yet implemented. Needs validation in developer's environment.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified from npm/PyPI, existing project research (STACK.md) cross-referenced
- Architecture (wizard + i18n): HIGH — well-documented patterns from official docs, multiple community sources agree
- Architecture (WeasyPrint + 履歴書 template): MEDIUM — WeasyPrint CSS tables work per CSS 2.1 spec, but the specific 履歴書 grid complexity hasn't been validated through actual rendering. Known bugs with border-collapse add risk.
- Pitfalls: HIGH — documented in WeasyPrint GitHub issues with reproducible examples

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (30 days — stable libraries, no major releases expected)

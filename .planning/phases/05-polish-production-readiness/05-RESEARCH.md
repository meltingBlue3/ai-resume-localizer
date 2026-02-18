# Phase 5: Polish & Production Readiness - Research

**Researched:** 2026-02-19
**Domain:** Frontend UX polish (loading states, error handling, completeness tracking)
**Confidence:** HIGH

## Summary

Phase 5 is a pure frontend enhancement phase. The three requirements (UXUI-06, UXUI-07, UXUI-08) target improving existing UI with better loading feedback, graceful error handling, and a data completeness indicator. No new libraries are needed -- everything builds on the existing React 19 + Zustand + Tailwind + react-i18next stack.

The codebase already has basic loading states (`isExtracting`, `isTranslating`, `isPreviewLoading`, `isDownloading`) and basic error handling (`extractionError`, `translationError`, local `previewError`/`downloadError`). Phase 5 elevates these from minimal to production-quality: multi-stage progress messages during long AI operations, structured error classification with actionable user guidance, and a computed completeness percentage across all resume fields.

**Primary recommendation:** Enhance the existing Zustand store with stage-specific progress state and a computed completeness selector, upgrade error banners to classify errors by type (network, timeout, API config, validation) with specific recovery actions, and add a completeness indicator component that reads from JpResumeData. No new npm dependencies required.

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.2.4 | UI rendering | Already in use |
| Zustand | ^5.0.11 | State management | Already managing all loading/error state |
| Tailwind CSS | ^4.1.18 | Styling | Already in use for all UI |
| react-i18next | ^16.5.4 | Internationalization | All UI text via t() |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-tooltip | ^1.2.8 | Accessible tooltips | Already used for culture tips |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom progress component | react-circular-progressbar / radix-ui Progress | Overkill -- a simple Tailwind-styled div with width percentage is sufficient for a linear completeness bar |
| Toast library (react-hot-toast, sonner) | Custom error banners | Existing inline error banners are better UX for this wizard flow -- errors should persist at point-of-action, not disappear after timeout |
| React Error Boundary | Custom try/catch | Error Boundaries are for render crashes; our errors are async API failures already caught in handlers |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Current State Assessment

**Loading states (UXUI-06 gap):**
- UploadStep: Shows spinner + "AI正在分析简历..." during extraction -- single message, no stage indication
- ReviewTranslationStep: Shows spinner + "正在翻译..." -- single message
- PreviewStep: Shows spinner for preview rendering -- no descriptive message
- DownloadStep: Shows spinner + "正在生成PDF..."
- GAP: No multi-stage progress (e.g., "Uploading file... Extracting text... AI analyzing..."). The 90-second Dify timeout means users stare at a single spinner for up to 90 seconds with no feedback change.

**Error handling (UXUI-07 gap):**
- UploadStep: Shows `extractionError` with retry button -- good base but error message is raw backend text (e.g., "Dify API returned 502")
- ReviewTranslationStep: Shows `translationError` in red banner -- no retry button, raw message
- PreviewStep: Shows `previewError` and `downloadError` -- minimal messages
- DownloadStep: Shows `downloadError` -- minimal
- Backend returns specific HTTP codes: 422 (validation), 502 (Dify error), 503 (missing config), 504 (timeout)
- GAP: Frontend does not classify error types or provide user-actionable guidance. All errors show raw message strings.

**Completeness indicator (UXUI-08 gap):**
- Currently: No completeness tracking exists
- JpResumeData has ~30+ fields across personal_info, summary, work_history, education, skills, certifications, motivation, strengths, other
- CnResumeData has ~25+ fields
- GAP: Need a utility function that walks the data structure, counts filled vs total fields, and returns a percentage

### Recommended Project Structure
```
src/
├── components/
│   ├── ui/
│   │   └── CompletenessIndicator.tsx    # NEW: reusable progress bar
│   └── wizard/
│       └── StepIndicator.tsx            # MODIFY: optionally show completeness
├── stores/
│   └── useResumeStore.ts               # MODIFY: add progressStage state
├── utils/
│   ├── completeness.ts                 # NEW: field counting logic
│   └── errorClassifier.ts              # NEW: error type classification
├── steps/
│   ├── UploadStep.tsx                   # MODIFY: stage-specific progress, better errors
│   ├── ReviewTranslationStep.tsx        # MODIFY: stage-specific progress, better errors
│   ├── PreviewStep.tsx                  # MODIFY: better errors
│   └── DownloadStep.tsx                 # MODIFY: better errors
└── i18n/locales/
    ├── zh/wizard.json                   # MODIFY: add progress/error/completeness keys
    └── ja/wizard.json                   # MODIFY: add progress/error/completeness keys
```

### Pattern 1: Stage-Specific Loading Progress
**What:** Replace single-message loading with multi-stage progress that updates as the operation progresses.
**When to use:** For the extraction and translation flows which involve multiple backend steps (upload -> text extraction -> Dify API call).

Since the backend endpoint is a single POST that blocks until complete (no streaming/SSE), true stage tracking from the server is not possible without changing the API. However, we can use **time-based estimated progress stages** -- showing different messages at timed intervals to give the user a sense of forward movement.

**Example:**
```typescript
// In useResumeStore.ts
interface ResumeState {
  // ... existing
  extractionStage: string | null;  // i18n key for current stage message
}

// In UploadStep.tsx
const EXTRACTION_STAGES = [
  { delay: 0, key: 'progress.uploading' },        // Immediate
  { delay: 2000, key: 'progress.extractingText' }, // After 2s
  { delay: 5000, key: 'progress.aiAnalyzing' },    // After 5s
  { delay: 15000, key: 'progress.almostDone' },    // After 15s
];

// Use useEffect with timeouts to advance through stages
const handleExtract = async () => {
  setExtracting(true);
  setExtractionStage('progress.uploading');

  const timers = EXTRACTION_STAGES.slice(1).map(({ delay, key }) =>
    setTimeout(() => setExtractionStage(key), delay)
  );

  try {
    const response = await uploadAndExtract(resumeFile);
    // ...
  } finally {
    timers.forEach(clearTimeout);
    setExtractionStage(null);
  }
};
```

### Pattern 2: Error Classification
**What:** Classify backend HTTP errors into user-understandable categories with specific recovery guidance.
**When to use:** All API call error handlers.

**Example:**
```typescript
// utils/errorClassifier.ts
export interface ClassifiedError {
  type: 'network' | 'timeout' | 'server' | 'validation' | 'config';
  titleKey: string;     // i18n key for error title
  messageKey: string;   // i18n key for user-facing message
  rawMessage: string;   // original error for dev info
  retryable: boolean;
}

export function classifyError(error: unknown): ClassifiedError {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return { type: 'network', titleKey: 'errors.network.title', messageKey: 'errors.network.message', rawMessage: error.message, retryable: true };
  }

  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('timed out') || msg.includes('504')) {
      return { type: 'timeout', titleKey: 'errors.timeout.title', messageKey: 'errors.timeout.message', rawMessage: msg, retryable: true };
    }
    if (msg.includes('503') || msg.includes('not configured')) {
      return { type: 'config', titleKey: 'errors.config.title', messageKey: 'errors.config.message', rawMessage: msg, retryable: false };
    }
    if (msg.includes('502') || msg.includes('Dify')) {
      return { type: 'server', titleKey: 'errors.server.title', messageKey: 'errors.server.message', rawMessage: msg, retryable: true };
    }
    if (msg.includes('422')) {
      return { type: 'validation', titleKey: 'errors.validation.title', messageKey: 'errors.validation.message', rawMessage: msg, retryable: false };
    }
  }

  return { type: 'server', titleKey: 'errors.unknown.title', messageKey: 'errors.unknown.message', rawMessage: String(error), retryable: true };
}
```

### Pattern 3: Completeness Calculation
**What:** A pure utility function that walks JpResumeData (or CnResumeData) and computes filled/total field counts.
**When to use:** Called as a derived computation from store data, displayed in the UI.

**Example:**
```typescript
// utils/completeness.ts
export interface CompletenessResult {
  filled: number;
  total: number;
  percentage: number;
  sections: Record<string, { filled: number; total: number }>;
}

export function computeCompleteness(data: JpResumeData | null): CompletenessResult {
  if (!data) return { filled: 0, total: 0, percentage: 0, sections: {} };

  let filled = 0;
  let total = 0;
  const sections: Record<string, { filled: number; total: number }> = {};

  // Personal info fields
  const pi = data.personal_info;
  const piFields = [pi?.name, pi?.name_katakana, pi?.birth_date, pi?.gender, pi?.address, pi?.phone, pi?.email];
  const piCount = { filled: piFields.filter(isFilled).length, total: piFields.length };
  sections['personalInfo'] = piCount;
  filled += piCount.filled;
  total += piCount.total;

  // ... similar for each section

  return { filled, total, percentage: total > 0 ? Math.round((filled / total) * 100) : 0, sections };
}

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}
```

### Anti-Patterns to Avoid
- **Polling the backend for progress:** The Dify API calls are blocking. Adding SSE/WebSocket for progress would be massive overengineering. Time-based client-side stages are the right approach.
- **Storing classified errors in Zustand:** Keep error classification in the component layer. The store should hold raw error strings; classification is a view concern.
- **Over-counting completeness fields:** Don't count every nested array item's fields individually -- weight them as "has at least one entry" to avoid confusing percentages (e.g., 5 empty work entries each with 6 fields = 30 empty fields dominating the score).
- **Making completeness blocking:** The indicator should be informational only, never prevent the user from proceeding. Some fields are optional.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible tooltips | Custom tooltip component | @radix-ui/react-tooltip (already installed) | Focus management, screen readers, positioning |
| Progress bar animation | CSS animation from scratch | Tailwind `transition-all` + width style binding | Smooth, consistent, no JS overhead |
| i18n interpolation | Manual string concatenation | react-i18next `t('key', { value })` interpolation | Handles plurals, formatting, fallback |

**Key insight:** This phase adds no new technical domains. Everything is UI enhancement using existing tools. The risk is scope creep (adding toast notifications, undo, auto-save, etc.) -- stay focused on the three requirements.

## Common Pitfalls

### Pitfall 1: Timer Cleanup on Unmount
**What goes wrong:** Stage progress timers continue running after the user navigates away from the step, causing "setState on unmounted component" warnings or stale state updates.
**Why it happens:** `setTimeout` callbacks fire regardless of component lifecycle.
**How to avoid:** Clear all timers in the `finally` block of the async handler AND in a useEffect cleanup. Use a ref to track active timers.
**Warning signs:** Console warnings about state updates on unmounted components.

### Pitfall 2: Raw Backend Error Messages Leaking to UI
**What goes wrong:** User sees "Dify API returned 502" or Python traceback details, which is meaningless and alarming.
**Why it happens:** The API client throws `new Error(message)` with the backend's `detail` field verbatim.
**How to avoid:** The error classifier intercepts these and maps to user-friendly i18n messages. Keep the raw message available for a "show details" toggle if needed.
**Warning signs:** Error messages containing HTTP status codes, stack traces, or technical terms in production.

### Pitfall 3: Completeness Percentage Misleading Users
**What goes wrong:** User sees 30% complete and thinks their resume is terrible, when actually many fields are optional.
**Why it happens:** Treating all fields as equally important. A resume with name, education, and work history is usable even if skills/certifications/hobbies are empty.
**How to avoid:** Either (a) weight required vs optional fields differently, or (b) label the indicator as "fields filled" not "completeness" to avoid judgment connotation. The requirement says "percentage of fields filled" so option (b) is closest to spec.
**Warning signs:** Users confused about what "75% complete" means; asking if they need to fill everything.

### Pitfall 4: Error State Not Cleared on Retry
**What goes wrong:** User clicks retry, the old error banner stays visible during the retry attempt, then a new error replaces it -- jarring double-error flash.
**Why it happens:** Error clearing happens at the start of the handler but the banner persists if the component re-renders before the state update batches.
**How to avoid:** Clear error state AND set loading state in the same state update (already done for extraction; verify for all paths). The classified error object should replace, not accumulate.

### Pitfall 5: Forgetting i18n for New UI Text
**What goes wrong:** Hardcoded English or Chinese strings appear in production.
**Why it happens:** Adding new progress messages or error text and forgetting to add keys to both zh/wizard.json and ja/wizard.json.
**How to avoid:** Add i18n keys to BOTH locale files as the first action when adding any new UI text. Use a checklist during implementation.
**Warning signs:** Missing translation warnings in console, untranslated text visible when switching language.

## Code Examples

### Completeness Indicator Component
```tsx
// Source: custom pattern using Tailwind + Zustand
interface CompletenessIndicatorProps {
  filled: number;
  total: number;
  percentage: number;
}

function CompletenessIndicator({ filled, total, percentage }: CompletenessIndicatorProps) {
  const { t } = useTranslation('wizard');

  const color = percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-400';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
        {t('completeness.label', { filled, total, percentage })}
      </span>
    </div>
  );
}
```

### Structured Error Banner
```tsx
// Source: custom pattern using classified errors + i18n
function ErrorBanner({ error, onRetry, onDismiss }: {
  error: ClassifiedError;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  const { t } = useTranslation('wizard');

  const styles = {
    network: 'border-orange-200 bg-orange-50 text-orange-800',
    timeout: 'border-amber-200 bg-amber-50 text-amber-800',
    server: 'border-red-200 bg-red-50 text-red-800',
    validation: 'border-red-200 bg-red-50 text-red-800',
    config: 'border-purple-200 bg-purple-50 text-purple-800',
  };

  return (
    <div className={`rounded-lg border px-4 py-3 ${styles[error.type]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">{t(error.titleKey)}</p>
          <p className="mt-1 text-sm opacity-80">{t(error.messageKey)}</p>
        </div>
        <div className="flex gap-2">
          {error.retryable && onRetry && (
            <button onClick={onRetry} className="text-sm font-medium underline">
              {t('errors.retry')}
            </button>
          )}
          {onDismiss && (
            <button onClick={onDismiss} className="text-sm opacity-60 hover:opacity-100">
              {t('errors.dismiss')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Time-Based Progress Stages
```typescript
// Source: custom pattern for simulated multi-stage progress
function useProgressStages(
  isActive: boolean,
  stages: { delay: number; key: string }[]
): string | null {
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!isActive) {
      setCurrentStage(null);
      return;
    }

    setCurrentStage(stages[0]?.key ?? null);

    timersRef.current = stages.slice(1).map(({ delay, key }) =>
      setTimeout(() => setCurrentStage(key), delay)
    );

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [isActive, stages]);

  return currentStage;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single loading boolean | Multi-stage progress with time estimates | Common by 2024 | Users feel less anxiety during long operations |
| Raw error strings | Classified errors with recovery actions | Standard UX practice | Users can self-recover instead of giving up |
| No data completeness | Progress bars / field counters | Standard in form UX | Users know what's missing without scrolling through every section |

**Deprecated/outdated:**
- None applicable -- this phase uses no new libraries.

## Open Questions

1. **Where should the completeness indicator be displayed?**
   - What we know: Requirement says "at any point in the workflow." Most natural placements: (a) in the StepIndicator header, (b) as a sidebar element in review/preview steps, (c) as a floating badge.
   - What's unclear: Whether it should show CnResumeData completeness (steps 1-2), JpResumeData completeness (steps 2-5), or both.
   - Recommendation: Show CnResumeData completeness during ReviewExtractionStep (step 1), and JpResumeData completeness from ReviewTranslationStep onward (steps 2-4). Display as a compact bar below the step title in each relevant step. This avoids cluttering the global header while keeping it visible "at any point."

2. **Should error state be stored in Zustand (global) or local component state?**
   - What we know: Currently mixed -- `extractionError` and `translationError` are in Zustand; `previewError` and `downloadError` are in local useState.
   - What's unclear: Whether to unify.
   - Recommendation: Keep the current split. Extraction and translation errors persist across step navigation (user goes back and returns), so Zustand is correct. Preview/download errors are transient within one step, so local state is fine. Unifying would add complexity with no user-facing benefit.

3. **Should classified errors include a "Show details" expandable section?**
   - What we know: The raw backend error messages contain technical details useful for debugging.
   - Recommendation: Include a small "Show details" toggle in the error banner that reveals the raw message. This helps technically-inclined users self-diagnose without confusing casual users.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis of all frontend components, stores, API client, and backend routes
- Zustand v5 API (already in use, verified against installed version)
- react-i18next interpolation syntax (already in use throughout codebase)

### Secondary (MEDIUM confidence)
- Time-based progress staging pattern: common in production apps (Vercel deploy status, GitHub Actions, etc.)
- Error classification pattern: standard UX practice documented across multiple design systems

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new libraries, everything already installed and in use
- Architecture: HIGH - patterns are straightforward enhancements to existing code
- Pitfalls: HIGH - identified from direct analysis of current codebase gaps

**Research date:** 2026-02-19
**Valid until:** indefinite (no external dependencies to go stale)

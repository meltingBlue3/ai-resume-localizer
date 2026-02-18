---
phase: 03-translation-data-processing
plan: 02
subsystem: frontend
tags: [typescript, zustand, intl, wareki, i18n, radix-ui]

requires:
  - phase: 02-upload-extraction
    plan: 02
    provides: "useResumeStore, CnResumeData types, uploadAndExtract API client"
provides:
  - "JpResumeData TypeScript interfaces mirroring backend Pydantic models"
  - "toWareki() Gregorian-to-Japanese-era conversion with gannen handling"
  - "mapDegreeToJapanese() Chinese credential to Japanese degree mapping"
  - "useResumeStore translation state slice (jpResumeData, isTranslating, translationError)"
  - "translateResume() typed API client for POST /api/translate"
affects: [03-translation-data-processing, 04-review-generation]

tech-stack:
  added: ["@radix-ui/react-tooltip@1.2.8"]
  patterns: [Intl.DateTimeFormat with ja-JP-u-ca-japanese calendar, static lookup table for credential mapping, Zustand store slice expansion]

key-files:
  created:
    - frontend/src/utils/wareki.ts
    - frontend/src/utils/credentials.ts
  modified:
    - frontend/src/types/resume.ts
    - frontend/src/stores/useResumeStore.ts
    - frontend/src/api/client.ts
    - frontend/package.json

key-decisions:
  - "Intl.DateTimeFormat('ja-JP-u-ca-japanese') for wareki — zero library dependency, browser-native"
  - "Gannen (元年) handled via regex replace of era-year-1 pattern, not hardcoded era boundaries"
  - "Store keeps pure state with setters — no translate action; step component orchestrates API calls"
  - "@radix-ui/react-tooltip installed here for 03-03 UI plan to avoid package.json churn"

patterns-established:
  - "Utility function pattern: null/undefined guard returning empty string, graceful fallback"
  - "Static lookup table with nullish coalescing fallback to original value"
  - "Store expansion pattern: add fields to interface, initialState, and create() in lockstep"

duration: 4min
completed: 2026-02-18
---

# Phase 3 Plan 2: Frontend Data Layer for Translation Summary

**JpResumeData TypeScript types, wareki/credential utilities using Intl.DateTimeFormat, Zustand translation state slice, and translateResume API client**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-18
- **Completed:** 2026-02-18
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- JpResumeData and 5 nested interfaces (JpPersonalInfo, JpEducationEntry, JpWorkEntry, JpSkillEntry, JpCertificationEntry) appended to types/resume.ts — all fields optional with `| null` matching backend Pydantic models
- toWareki() utility using browser-native Intl.DateTimeFormat with ja-JP-u-ca-japanese calendar — handles YYYY/MM input, year-only input, null/undefined, and gannen (元年) edge case via Unicode regex
- mapDegreeToJapanese() utility with 10 Chinese degree variants mapped to standard Japanese credential strings, passthrough for unmapped values
- useResumeStore expanded with jpResumeData, isTranslating, translationError fields plus setters, all included in initialState and reset
- translateResume() API client POSTing to /api/translate with JSON body, typed JpResumeData return, and error detail extraction matching existing uploadAndExtract pattern
- @radix-ui/react-tooltip@1.2.8 installed for upcoming 03-03 UI components

## Task Commits

Each task was committed atomically:

1. **Task 1: JpResumeData types, wareki.ts, credentials.ts** — `de9aed2` (feat)
2. **Task 2: Zustand store expansion, translateResume API client, tooltip install** — `ec10ac3` (feat)

## Files Created/Modified
- `frontend/src/types/resume.ts` — Added JpResumeData and 5 nested interfaces (58 new lines)
- `frontend/src/utils/wareki.ts` — Created: toWareki() with Intl.DateTimeFormat and gannen fix
- `frontend/src/utils/credentials.ts` — Created: mapDegreeToJapanese() with 10-entry lookup
- `frontend/src/stores/useResumeStore.ts` — Added jpResumeData, isTranslating, translationError state + setters
- `frontend/src/api/client.ts` — Added translateResume() fetch function with typed return
- `frontend/package.json` — Added @radix-ui/react-tooltip dependency

## Decisions Made
- Used Intl.DateTimeFormat with ja-JP-u-ca-japanese locale for wareki conversion — zero external dependencies, handles era boundaries automatically
- Gannen edge case fixed via Unicode Script=Han regex rather than hardcoded era year checks
- Store keeps pure state; no translate action — step component will call translateResume() directly and use setJpResumeData(), matching the UploadStep pattern
- Installed @radix-ui/react-tooltip in this plan to consolidate package.json changes before 03-03 UI work

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
- None. TypeScript compilation passed cleanly for both tasks.

## Self-Check: PASSED

- All 5 key files verified on disk
- Both commit hashes (de9aed2, ec10ac3) found in git log
- TypeScript compilation passes with zero errors
- @radix-ui/react-tooltip@1.2.8 confirmed installed

---
*Phase: 03-translation-data-processing*
*Completed: 2026-02-18*

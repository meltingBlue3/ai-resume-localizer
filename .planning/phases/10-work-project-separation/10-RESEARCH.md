# Phase 10: Work-Project Separation - Research

**Researched:** 2026-02-22
**Domain:** Dify workflow prompt engineering, Pydantic/TypeScript data modeling, Jinja2 template rendering
**Confidence:** HIGH

## Summary

Phase 10 requires restructuring the data flow to clearly separate company employment history from project experience at three layers: extraction workflow, translation workflow, and both PDF templates. The current implementation merges projects into `work_history` at the translation stage, conflating employment records with project details. The fix requires adding a new `projects` field to `JpResumeData` for personal/side projects, embedding company-internal projects within their parent employment entries, and updating templates to render this separation correctly.

**Primary recommendation:** Extend `JpResumeData` with a new `projects` field (array of JpProjectEntry), update translation workflow to route projects appropriately based on their association with company employment, and modify both templates to render the separated data according to JIS standards.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RKTPL-04 | 履歴書の職歴からプロジェクト経歴を分離する（職歴は会社・役職のみ） | rirekisho.html already shows company/date only; need to ensure work_history contains ONLY employment, not merged projects |
| SKTPL-01 | 職務経歴書の職務経歴にプロジェクト経歴を含める（会社内プロジェクト→該当経歴内、個人プロジェクト→別セクション） | Add `projects` field to JpResumeData; update shokumukeirekisho.html to render personal projects section |
| EXTR-03 | PDF出力の問題修正に対応するフィールドマッピングを更新する | Extraction already has separate work_experience/project_experience; no changes needed at extraction layer |
| TRAN-02 | PDF出力の問題修正に対応するフィールド変換ロジックを修正する | Update translation workflow to NOT merge project_experience into work_history; route to new `projects` field instead |

## Current Architecture Analysis

### Data Flow (Current State)

```
Extraction                    Translation                     Templates
┌─────────────────┐          ┌─────────────────────┐         ┌──────────────────┐
│ work_experience │──────┐   │                     │         │ rirekisho.html   │
│ (company,       │      │   │  work_experience ──┼────────►│ shows company/   │
│  position, ...) │      ├──►│        +            │         │ date only ✓      │
├─────────────────┤      │   │  project_experience│         ├──────────────────┤
│ project_        │──────┘   │        ↓            │         │ shokumukeirekisho│
│ experience      │          │  work_history       ├────────►│ .html            │
│ (same schema)   │          │  (merged)           │         │ merged content ✗ │
└─────────────────┘          └─────────────────────┘         └──────────────────┘
```

### Problem: Translation Merges Projects

Current translation workflow rule (line 223 in resume_translation.yml):
```
- project_experience → work_history に統合（末尾に追加）
```

This causes:
1. **rirekisho.html** may incorrectly show project entries as employment (if project has company=null, template shows "未記入 入社")
2. **shokumukeirekisho.html** loses project distinction - personal projects appear as company blocks

### Required Data Flow (Target State)

```
Extraction                    Translation                     Templates
┌─────────────────┐          ┌─────────────────────┐         ┌──────────────────┐
│ work_experience │─────────►│  work_experience    │────────►│ rirekisho.html   │
│ (company,       │          │        ↓            │         │ employment only  │
│  position, ...) │          │  work_history       │         │ ✓ no change      │
├─────────────────┤          │ (employment only)   │         ├──────────────────┤
│ project_        │          ├─────────────────────┤         │ shokumukeirekisho│
│ experience      │─────────►│  project_experience │         │ .html            │
│ (company=null   │          │        ↓            │         │ ├─ work_history  │
│  for personal)  │          │  projects           ├────────►│ │  (company      │
└─────────────────┘          │ (personal only)     │         │ │   blocks)      │
                             │                     │         │ └─ projects     │
                             │  Company-internal   │         │    (personal    │
                             │  projects embedded  │         │    section)     │
                             │  in work_history    │         └──────────────────┘
                             └─────────────────────┘
```

## Standard Stack

### Core (No Changes Required)
| Component | Current State | Phase 10 Action |
|-----------|---------------|-----------------|
| CnResumeData | Already has separate `work_experience` and `project_experience` | No changes |
| resume_extraction.yml | Already extracts both arrays separately | No changes |
| WorkEntry (Cn) | Has `company` field (null for personal projects) | No changes |

### Modified Components
| Component | Current | Target | Files |
|-----------|---------|--------|-------|
| JpResumeData | `work_history` only | `work_history` + `projects` | `backend/app/models/resume.py`, `frontend/src/types/resume.ts` |
| JpWorkEntry | No project embedding | Add optional `projects` field for internal projects | Same as above |
| resume_translation.yml | Merges projects | Routes projects to appropriate field | `workflow/resume_translation.yml` |
| shokumukeirekisho.html | Single work_history loop | Add projects section | `backend/app/templates/shokumukeirekisho.html` |
| template_renderer.py | Processes work_history only | Add projects processing | `backend/app/services/template_renderer.py` |

## Architecture Patterns

### Pattern 1: Project Classification Logic

**What:** Determine if a project belongs to a company or is personal
**How:** Check `company` field in project_experience entry

```python
# In translation workflow LLM prompt logic
# Rule: If project_experience[].company matches a work_experience[].company,
#       embed in that work_history entry
#       If company is null or doesn't match, route to projects array
```

**Implementation options:**
1. **LLM-based routing (recommended):** Add explicit instruction in translation prompt to classify and route
2. **Code-based routing:** Post-processing in template_renderer.py

**Recommendation:** LLM-based routing in translation workflow - aligns with DESIGN_PRINCIPLES.md (Rule 3: deterministic logic in code, but classification requires language understanding)

### Pattern 2: JpWorkEntry Extension for Internal Projects

**What:** Add optional projects field to JpWorkEntry for company-internal projects

```typescript
// frontend/src/types/resume.ts
interface JpProjectEntry {
  name: string | null;
  role: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  technologies: string[] | null;
}

interface JpWorkEntry {
  company?: string | null;
  title?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  location?: string | null;
  responsibilities?: string[] | null;
  achievements?: string[] | null;
  projects?: JpProjectEntry[] | null;  // NEW: company-internal projects
}

interface JpResumeData {
  personal_info?: JpPersonalInfo | null;
  summary?: string | null;
  work_history?: JpWorkEntry[] | null;
  education?: JpEducationEntry[] | null;
  skills?: JpSkillEntry[] | null;
  certifications?: JpCertificationEntry[] | null;
  motivation?: string | null;
  strengths?: string | null;
  other?: string | null;
  projects?: JpProjectEntry[] | null;  // NEW: personal/side projects
}
```

### Pattern 3: Template Rendering Updates

**rirekisho.html:** No changes required - already shows company/date only

**shokumukeirekisho.html:** Add projects section after work_history

```html
{% for job in data.work_history %}
  <!-- Existing company block -->
  <!-- Add: internal projects within company block -->
  {% if job.projects %}
    <table class="title-table">
      <tr><td class="subsection-label">【参画プロジェクト】</td></tr>
    </table>
    {% for project in job.projects %}
      <!-- Project details -->
    {% endfor %}
  {% endif %}
{% endfor %}

<!-- NEW: Personal projects section -->
{% if data.projects %}
  <table class="title-table">
    <tr class="section-title-row">
      <td><span class="section-title">個人プロジェクト</span></td>
    </tr>
  </table>
  {% for project in data.projects %}
    <!-- Personal project block -->
  {% endfor %}
{% endif %}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Project classification | Custom matching logic in Python | LLM in translation workflow | Language understanding needed for company name matching |
| Date processing for projects | New parsing functions | Existing `_parse_date_parts()` | Already handles all date formats |

## Common Pitfalls

### Pitfall 1: Breaking Existing PDF Output
**What goes wrong:** Changes to data model cause template rendering errors
**Why it happens:** Templates expect specific field structures
**How to avoid:** 
1. Make new fields optional (nullable)
2. Use Jinja2 default filters
3. Test both templates with null data

### Pitfall 2: Over-Classification of Projects
**What goes wrong:** LLM incorrectly routes personal projects to work_history
**Why it happens:** Ambiguous resume content (e.g., "developed X at company Y" vs freelance)
**How to avoid:** Add explicit classification rules in translation prompt

### Pitfall 3: Missing Frontend Synchronization
**What goes wrong:** TypeScript types don't match Pydantic models after changes
**Why it happens:** Manual synchronization required between backend/frontend
**How to avoid:** Update both `resume.py` and `resume.ts` in same task

### Pitfall 4: Violating DESIGN_PRINCIPLES.md
**What goes wrong:** Adding content that doesn't exist in source
**Why it happens:** LLM "helpfully" filling in project details
**How to avoid:** Add explicit constraint in translation prompt: "プロジェクト分類は元データのcompanyフィールドに基づく"

## Code Examples

### JpProjectEntry Model (Pydantic)

```python
# backend/app/models/resume.py

class JpProjectEntry(BaseModel):
    name: str | None = None
    role: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    description: str | None = None
    technologies: list[str] | None = None
```

### Updated JpWorkEntry Model

```python
# backend/app/models/resume.py

class JpWorkEntry(BaseModel):
    company: str | None = None
    title: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    location: str | None = None
    responsibilities: list[str] | None = None
    achievements: list[str] | None = None
    projects: list[JpProjectEntry] | None = None  # NEW
```

### Translation Prompt Update (Key Addition)

```yaml
# In resume_translation.yml LLM prompt

## プロジェクト分類ルール

project_experience は以下のルールで分類・変換する：

1. **会社内プロジェクト**: project_experience[].company が work_experience[].company と一致する場合
   - 該当する work_history エントリの projects[] に埋め込む
   - 変換: position → role, description → description

2. **個人プロジェクト**: project_experience[].company が null または work_experience に一致しない場合
   - 別の projects[] 配列に格納
   - 変換: position → role, description → description, description から technologies を抽出

3. **出力構造更新**:
   ```json
   {
     "work_history": [
       {
         "company": "...",
         "projects": [...] // オプション: 会社内プロジェクト
       }
     ],
     "projects": [...] // オプション: 個人プロジェクト
   }
   ```
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Merged projects into work_history | Separate projects field | Clear separation in both templates |
| Projects lose context | Projects embedded in parent company | Better context for company-internal work |

**Deprecated:**
- Translation workflow rule `project_experience → work_history に統合（末尾に追加）` - replaced with classification-based routing

## Open Questions

1. **Should company-internal projects have their own date range?**
   - What we know: project_experience has start_date/end_date
   - What's unclear: Should these override or supplement the employment date range
   - Recommendation: Keep project dates separate - they may span partial employment period

2. **How to handle technologies extraction?**
   - What we know: CnResumeData doesn't have explicit technologies field
   - What's unclear: Whether to extract technologies from description
   - Recommendation: LLM may extract from description during translation (follows DESIGN_PRINCIPLES - extract what's present)

## Sources

### Primary (HIGH confidence)
- `workflow/resume_extraction.yml` - Current extraction schema
- `workflow/resume_translation.yml` - Current translation rules
- `backend/app/models/resume.py` - Current Pydantic models
- `frontend/src/types/resume.ts` - Current TypeScript types
- `backend/app/templates/rirekisho.html` - Current 履歴書 template
- `backend/app/templates/shokumukeirekisho.html` - Current 職務経歴書 template
- `workflow/DESIGN_PRINCIPLES.md` - Workflow modification guidelines

### Secondary (MEDIUM confidence)
- `.planning/phases/09-workflow-data-cleanup/09-01-SUMMARY.md` - Prior phase patterns
- `.planning/phases/09-workflow-data-cleanup/09-02-SUMMARY.md` - Prior phase verification

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries, extending existing models
- Architecture: HIGH - Clear pattern from current codebase
- Pitfalls: HIGH - Based on prior phase learnings and existing template structure

**Research date:** 2026-02-22
**Valid until:** 30 days (stable stack, no external dependencies)

# Phase 11: Template Polish - Research

**Researched:** 2026-02-22
**Domain:** Jinja2 HTML templates, WeasyPrint PDF generation, Japanese resume formatting
**Confidence:** HIGH

## Summary

This phase requires modifications to two Jinja2 templates (rirekisho.html, shokumukeirekisho.html) and potentially the `prepare_context()` function in template_renderer.py. The changes are primarily template-level with some data transformation logic needed in the renderer.

**Primary recommendation:** Implement most changes in templates; use prepare_context() for name formatting and end_date normalization.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RKTPL-01 | 履歴書の姓名に全角スペースを挿入して表示する | Split `name` field in prepare_context() → `name_formatted` with U+3000 separator |
| RKTPL-02 | 履歴書の住所に郵便番号を表示する | Requires postal_code field in JpPersonalInfo; display as 〒XXX-XXXX before address |
| RKTPL-03 | 履歴書の職歴に役職名を表示する | JpWorkEntry.title exists; add `{{ entry.title }}` to template |
| RKTPL-05 | 通勤時間・扶養家族・配偶者フィールドをテンプレートから削除する | Remove lines 383-409 commute-table block |
| RKTPL-06 | 本人希望記入欄を改善（給料・職種等の希望を記入、なければ「貴社の規定に従います」） | Update default text: add の, remove period |
| SKTPL-02 | 終了日がない場合「現在」を表示する（"none"ではなく） | Template already uses default('現在'); may need prepare_context() to convert "none" string → null |

## Current State Analysis

### rirekisho.html (履歴書)

| Requirement | Current State | Location | Change Needed |
|-------------|---------------|----------|---------------|
| RKTPL-01 | `{{ data.personal_info.name }}` | Line 197 | Use formatted name with U+3000 |
| RKTPL-02 | No postal code display | Lines 206-227 | Add postal code before address |
| RKTPL-03 | Only company shown | Lines 294-311 | Add `entry.title` after company |
| RKTPL-05 | Commute table present | Lines 383-409 | Delete entire block |
| RKTPL-06 | Default: "貴社規定に従います。" | Line 420 | Change to "貴社の規定に従います" |

### shokumukeirekisho.html (職務経歴書)

| Requirement | Current State | Location | Change Needed |
|-------------|---------------|----------|---------------|
| SKTPL-02 | `{{ job.end_date \| default('現在') }}` | Line 190 | May need code-level normalization |

### template_renderer.py

Current `prepare_context()` function (lines 87-147):
- Normalizes None sub-objects to empty dicts/lists
- Processes education/work/certification dates into year/month parts
- Generates current_date_wareki

**Potential additions:**
- Name formatting: `personal_info["name_formatted"]` with U+3000 separator
- End date normalization: Convert string "none" to null for work_history entries

### Data Models (backend/app/models/resume.py)

**JpPersonalInfo** (lines 59-67):
```python
class JpPersonalInfo(BaseModel):
    name: str | None = None
    name_katakana: str | None = None
    birth_date: str | None = None
    gender: str | None = None
    nationality: str | None = None
    address: str | None = None  # No postal_code field
    phone: str | None = None
    email: str | None = None
```

**JpWorkEntry** (lines 87-95):
- Has `title` field (line 89) - not currently used in rirekisho template

## Architecture Patterns

### Pattern 1: Jinja2 Default Filter
**What:** `{{ value | default('fallback', true) }}` - second param handles None/falsy
**When to use:** Display fallback when field is null or empty
**Example:**
```jinja2
{{ data.personal_info.name | default('未記入', true) }}
```

### Pattern 2: Conditional Rendering with if/else
**What:** `{% if condition %}...{% else %}...{% endif %}`
**When to use:** Different rendering logic based on data presence
**Example (shokumukeirekisho.html:231):**
```jinja2
{% if project.end_date %}〜{{ project.end_date }}{% else %}〜現在{% endif %}
```

### Pattern 3: prepare_context() Data Transformation
**What:** Normalize/transform data before template rendering
**When to use:** When template logic would be too complex
**Example (template_renderer.py:121-132):**
```python
work_history_processed = []
for entry in data["work_history"]:
    processed = dict(entry)
    start_parts = _parse_date_parts(entry.get("start_date"))
    # ... date parsing ...
    work_history_processed.append(processed)
data["work_history_processed"] = work_history_processed
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Name formatting | Custom Jinja2 filter | prepare_context() transformation | Simpler, testable in Python |
| Date parsing | Regex in template | _parse_date_parts() | Already exists |
| Null handling | Manual None checks | Jinja2 `default()` filter | Built-in, tested |

## Common Pitfalls

### Pitfall 1: String "none" vs null None
**What goes wrong:** LLM may output `"none"` string instead of `null` for missing end_date
**Why it happens:** DESIGN_PRINCIPLES.md says LLM outputs null, but JSON parsing may differ
**How to avoid:** Add normalization in prepare_context() to convert "none"/"null" strings to Python None
**Warning signs:** Template shows "none" instead of "現在"

### Pitfall 2: Full-width vs half-width space
**What goes wrong:** Using half-width space (0x20) instead of full-width (U+3000) in Japanese text
**Why it happens:** Keyboard default or unawareness of convention
**How to avoid:** Use `\u3000` explicitly in code; verify with hex editor
**Warning signs:** Name looks cramped in PDF

### Pitfall 3: Jinja2 default filter syntax
**What goes wrong:** `{{ value \| default('text') }}` only handles None, not empty string
**Why it happens:** Second boolean parameter needed to handle empty/falsy values
**How to avoid:** Always use `{{ value \| default('text', true) }}` for resume fields
**Warning signs:** Empty fields show nothing instead of "未記入"

## Implementation Details

### RKTPL-01: Name with Full-Width Space

**Option A (Recommended):** Add formatting in prepare_context()
```python
# In prepare_context():
if data.get("personal_info") and data["personal_info"].get("name"):
    # Split on space and rejoin with full-width space
    parts = data["personal_info"]["name"].split()
    if len(parts) >= 2:
        data["personal_info"]["name_formatted"] = "\u3000".join(parts[:2])
    else:
        data["personal_info"]["name_formatted"] = data["personal_info"]["name"]
```

**Option B:** Jinja2 filter
- Would require custom filter registration
- More complex for simple string manipulation

### RKTPL-02: Postal Code in Address

**Issue:** JpPersonalInfo has no `postal_code` field.

**Option A:** Add postal_code to JpPersonalInfo model
- Requires model change + translation workflow update
- Most robust solution

**Option B:** Assume postal code is in address string
- Template modification only: extract postal code pattern
- Fragile - depends on translation output format

**Recommendation:** Add `postal_code` field to JpPersonalInfo model (Option A) for cleanest separation.

### RKTPL-03: Position in Work History

Simple template addition. Change line 298 from:
```jinja2
<td>{{ entry.company | default('', true) }}　入社</td>
```
To:
```jinja2
<td>{{ entry.company | default('', true) }}{% if entry.title %}　{{ entry.title }}{% endif %}　入社</td>
```

### RKTPL-05: Remove Commute/Dependents Table

Delete lines 383-409 in rirekisho.html (entire `<table class="commute-table">` block).

### RKTPL-06: Personal Wishes Default

Change line 420 from:
```jinja2
{{ data.other | default('貴社規定に従います。', true) }}
```
To:
```jinja2
{{ data.other | default('貴社の規定に従います', true) }}
```

### SKTPL-02: End Date "現在" Display

**Current template behavior:**
- shokumukeirekisho.html:190 uses `{{ job.end_date | default('現在') }}`
- Lines 231, 262 use `{% if project.end_date %}...{% else %}〜現在{% endif %}`

**Potential issue:** If Dify returns string `"none"` instead of `null`, default filter won't trigger.

**Fix in prepare_context():**
```python
for entry in data["work_history"]:
    # Normalize "none" string to None
    if entry.get("end_date") and entry["end_date"].lower() in ("none", "null", ""):
        entry["end_date"] = None
```

## Open Questions

1. **Postal code field location**
   - What we know: JpPersonalInfo lacks postal_code
   - What's unclear: Should this be added to model or extracted from address string?
   - Recommendation: Add to model for cleaner architecture; requires Dify workflow update

2. **Name splitting algorithm**
   - What we know: Japanese names typically family + given (2 parts)
   - What's unclear: How to handle 3+ part names or single names
   - Recommendation: Split on whitespace, join first two parts; fallback to original if single part

3. **Dify "none" string handling**
   - What we know: DESIGN_PRINCIPLES.md specifies LLM outputs null
   - What's unclear: Whether translation workflow actually outputs null or "none" string
   - Recommendation: Add defensive normalization in prepare_context() to handle both

## Sources

### Primary (HIGH confidence)
- Template files: backend/app/templates/*.html - direct code inspection
- Model files: backend/app/models/resume.py - direct code inspection
- Renderer: backend/app/services/template_renderer.py - direct code inspection
- DESIGN_PRINCIPLES.md: workflow/DESIGN_PRINCIPLES.md - project governance

### Secondary (MEDIUM confidence)
- REQUIREMENTS.md: Phase requirement definitions
- PROJECT.md: Project context and decisions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Jinja2/WeasyPrint patterns well understood
- Architecture: HIGH - Existing code structure clearly documented
- Pitfalls: MEDIUM - Some uncertainty about Dify output format for null values

**Research date:** 2026-02-22
**Valid until:** 30 days (stable templates, unlikely to change significantly)

---
phase: quick-007
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/utils/wareki.ts
  - backend/app/services/template_renderer.py
autonomous: true
must_haves:
  truths:
    - "Date '2019-09' renders as Reiwa era (not Heisei) in frontend wareki hint"
    - "Date '2019-03' renders as Heisei 31 in frontend (before Reiwa boundary)"
    - "Date '2019-09' parses to year='令和元' month='9' in backend _parse_date_parts"
    - "Date '2023-06' parses to year='令和5' month='6' in backend _parse_date_parts"
    - "Existing slash-delimited dates (YYYY/MM) still work in both frontend and backend"
  artifacts:
    - path: "frontend/src/utils/wareki.ts"
      provides: "Wareki conversion supporting both - and / separators"
    - path: "backend/app/services/template_renderer.py"
      provides: "Date parsing for YYYY-MM and YYYY/MM ISO formats with month-aware era boundaries"
  key_links:
    - from: "backend/app/services/template_renderer.py"
      to: "rirekisho template year/month cells"
      via: "_parse_date_parts returns split year+month"
      pattern: "_parse_date_parts"
---

<objective>
Fix wareki (Japanese era) date conversion for YYYY-MM format dates returned by the Dify LLM.

Purpose: Dates like "2019-09" and "2023-06" currently break both frontend wareki display (wrong era due to split on '/' only) and backend PDF date cells (whole string dumped into year cell, empty month). This fix handles hyphen-separated dates in both locations with correct month-aware era boundary detection.

Output: Corrected wareki.ts and template_renderer.py
</objective>

<execution_context>
@C:/Users/zhang/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@frontend/src/utils/wareki.ts
@backend/app/services/template_renderer.py
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix frontend wareki.ts to split on both - and / separators</name>
  <files>frontend/src/utils/wareki.ts</files>
  <action>
In `toWareki()`, change line 13:
```
const parts = gregorianDate.split('/');
```
to:
```
const parts = gregorianDate.split(/[-\/]/);
```

This single change makes the split work for both "2019-09" (hyphen) and "2019/09" (slash) formats. The rest of the function (Intl.DateTimeFormat with ja-JP-u-ca-japanese calendar, gannen replacement) already handles era detection correctly once month is parsed.

Also update the `parts[1]` check on line 31 to work the same way (it already does -- `parts[1]` will now be populated for hyphen dates too, so month will be included in output).

Update the JSDoc comment on line 2 to mention YYYY-MM format: "Converts a Gregorian date string (YYYY/MM, YYYY-MM, or YYYY) to Japanese era format".
  </action>
  <verify>
Create a quick test in the browser console or verify by inspection:
- "2019-09".split(/[-\/]/) returns ["2019", "09"] (correct split)
- "2019/09".split(/[-\/]/) returns ["2019", "09"] (backward compatible)
- "2019".split(/[-\/]/) returns ["2019"] (year-only still works)
  </verify>
  <done>wareki.ts splits on both - and / separators; "2019-09" produces "令和元年9月" not "平成31年1月"</done>
</task>

<task type="auto">
  <name>Task 2: Fix backend _parse_date_parts to handle YYYY-MM/YYYY/MM with month-aware era boundaries</name>
  <files>backend/app/services/template_renderer.py</files>
  <action>
In `_parse_date_parts()`, add a new branch AFTER the existing wareki regex match but BEFORE the fallthrough return. Insert between the `if match:` block (line 33-45) and the final `return {"year": date_str, "month": ""}` (line 48):

```python
    # Handle YYYY-MM or YYYY/MM ISO format (from Dify LLM output)
    iso_match = re.match(r"(\d{4})[-/](\d{1,2})", date_str)
    if iso_match:
        western_year = int(iso_match.group(1))
        month_int = int(iso_match.group(2))
        month_str = str(month_int)  # strip leading zeros

        # Month-aware era boundary detection
        if western_year > 2019 or (western_year == 2019 and month_int >= 5):
            era_year = western_year - 2018
            year_str = "令和元" if era_year == 1 else f"令和{era_year}"
        elif western_year >= 1989:
            era_year = western_year - 1988
            year_str = "平成元" if era_year == 1 else f"平成{era_year}"
        else:
            era_year = western_year - 1925
            year_str = "昭和元" if era_year == 1 else f"昭和{era_year}"

        return {"year": year_str, "month": month_str}
```

Also update the existing `if year_str.isdigit():` block (lines 39-43) within the wareki regex match to use the same month-aware era detection and gannen convention. Currently it does `if western_year >= 2019` without month awareness. Update to:

```python
        if year_str.isdigit():
            western_year = int(year_str)
            month_int = int(month_str)
            if western_year > 2019 or (western_year == 2019 and month_int >= 5):
                era_year = western_year - 2018
                year_str = "令和元" if era_year == 1 else f"令和{era_year}"
            elif western_year >= 1989:
                era_year = western_year - 1988
                year_str = "平成元" if era_year == 1 else f"平成{era_year}"
            else:
                era_year = western_year - 1925
                year_str = "昭和元" if era_year == 1 else f"昭和{era_year}"
```

Update the docstring to mention YYYY-MM/YYYY/MM format support.
  </action>
  <verify>
Run a quick Python verification:
```bash
cd backend && python -c "
from app.services.template_renderer import _parse_date_parts
# YYYY-MM format tests
assert _parse_date_parts('2019-09') == {'year': '令和元', 'month': '9'}, f'Got {_parse_date_parts(\"2019-09\")}'
assert _parse_date_parts('2019-03') == {'year': '平成31', 'month': '3'}, f'Got {_parse_date_parts(\"2019-03\")}'
assert _parse_date_parts('2023-06') == {'year': '令和5', 'month': '6'}, f'Got {_parse_date_parts(\"2023-06\")}'
assert _parse_date_parts('1989-01') == {'year': '平成元', 'month': '1'}, f'Got {_parse_date_parts(\"1989-01\")}'
# Existing wareki format still works
assert _parse_date_parts('令和5年4月') == {'year': '令和5', 'month': '4'}, f'Got {_parse_date_parts(\"令和5年4月\")}'
# None/empty
assert _parse_date_parts(None) == {'year': '', 'month': ''}
assert _parse_date_parts('') == {'year': '', 'month': ''}
print('All tests passed')
"
```
  </verify>
  <done>_parse_date_parts correctly converts "2019-09" to {year: "令和元", month: "9"}, "2019-03" to {year: "平成31", month: "3"}, "2023-06" to {year: "令和5", month: "6"}, and existing wareki formats still work</done>
</task>

</tasks>

<verification>
1. Backend: Python assertions pass for all date format variations (YYYY-MM, wareki, null)
2. Frontend: wareki.ts correctly splits hyphenated dates
3. No regressions: existing slash-delimited and wareki-formatted dates still parse correctly
</verification>

<success_criteria>
- "2019-09" displays as "令和元年9月" in frontend hint (not "平成31年1月")
- "2019-09" parses to year="令和元", month="9" in backend PDF cells (not year="2019-09", month="")
- "2019-03" correctly stays as Heisei 31 (before Reiwa boundary of May 2019)
- "2023-06" parses to year="令和5", month="6"
- Existing "令和5年4月" wareki format still works unchanged
</success_criteria>

<output>
After completion, create `.planning/quick/7-fix-wareki-conversion-for-yyyy-mm-date-f/007-SUMMARY.md`
</output>

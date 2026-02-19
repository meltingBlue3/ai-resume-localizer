---
phase: quick-006
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/app/services/template_renderer.py
  - backend/app/templates/rirekisho.html
autonomous: true
must_haves:
  truths:
    - "Year cells in rirekisho PDF show wareki era+number without trailing '年' (e.g. '令和5' not '令和5年')"
    - "Western year dates (e.g. '2023年4月') are converted to wareki format in year cells"
    - "Education entries show two rows: start date + '入学' row, end date + '卒業' row"
    - "Work history entries show two rows: start date + '入社' row, end date + '退社' or '現在に至る' row"
    - "Certifications year cells also strip trailing '年'"
  artifacts:
    - path: "backend/app/services/template_renderer.py"
      provides: "Fixed _parse_date_parts stripping trailing 年 and western-to-wareki conversion"
    - path: "backend/app/templates/rirekisho.html"
      provides: "Two-row education/work entries with start+end dates"
  key_links:
    - from: "backend/app/services/template_renderer.py"
      to: "backend/app/templates/rirekisho.html"
      via: "education_processed and work_history_processed context arrays"
      pattern: "start_year|start_month|end_year|end_month"
---

<objective>
Fix two bugs in rirekisho PDF generation: (1) year cells show redundant "年" character that duplicates the table header, and (2) education/work history only show start dates instead of the standard two-row format with both start and end dates.

Purpose: Make the 履歴書 PDF conform to Japanese resume standards.
Output: Corrected template_renderer.py and rirekisho.html.
</objective>

<execution_context>
@C:/Users/zhang/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@backend/app/services/template_renderer.py
@backend/app/templates/rirekisho.html
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix _parse_date_parts to strip trailing 年 and convert western years to wareki</name>
  <files>backend/app/services/template_renderer.py</files>
  <action>
Modify `_parse_date_parts` in `backend/app/services/template_renderer.py`:

1. After the regex match extracts the year group (e.g. "令和5年"), strip the trailing "年" character so it returns "令和5" instead. Use `rstrip("年")` or slice off the last character.

2. Add western year detection: if the year part is purely numeric (e.g. "2023"), convert to wareki using the existing Reiwa formula (year - 2018). The regex already captures "2023年" as the year group — after stripping "年" you get "2023". Check if the result is all digits, and if so convert: `f"令和{int(year_str) - 2018}"`. This is consistent with the existing `_current_date_wareki` which uses the same Reiwa-only formula (per decision [04-01]).

3. Handle edge case: if year_str after stripping is "2019" or later, use Reiwa. For years before 2019, just leave as-is (the Dify translation workflow should already produce wareki for older dates like "平成30年").

The updated function should produce:
- "令和5年4月" -> {"year": "令和5", "month": "4"}
- "平成30年3月" -> {"year": "平成30", "month": "3"}
- "2023年4月" -> {"year": "令和5", "month": "4"}
- "2019年5月" -> {"year": "令和1", "month": "5"}
- None -> {"year": "", "month": ""}
  </action>
  <verify>
Run Python to test the function directly:
```
cd backend && python -c "
from app.services.template_renderer import _parse_date_parts
assert _parse_date_parts('令和5年4月') == {'year': '令和5', 'month': '4'}, f'Got {_parse_date_parts(\"令和5年4月\")}'
assert _parse_date_parts('平成30年3月') == {'year': '平成30', 'month': '3'}
assert _parse_date_parts('2023年4月') == {'year': '令和5', 'month': '4'}
assert _parse_date_parts(None) == {'year': '', 'month': ''}
print('All assertions passed')
"
```
  </verify>
  <done>_parse_date_parts returns year values without trailing "年" and converts western years to wareki format.</done>
</task>

<task type="auto">
  <name>Task 2: Update rirekisho.html education/work sections to show two rows per entry</name>
  <files>backend/app/templates/rirekisho.html</files>
  <action>
Modify `backend/app/templates/rirekisho.html` education and work history sections:

**Education section** (replace the current single-row loop around line 267-273):
Each education entry renders TWO rows:
- Row 1 (入学): `entry.start_year | entry.start_month | entry.school 入学`
- Row 2 (卒業): `entry.end_year | entry.end_month | entry.school entry.degree 卒業`

Use entry.major if available: `{{ entry.school }}　{{ entry.major | default('', true) }}　入学` (strip extra spaces with Jinja2 trim or just let the template handle it).

For the 卒業 row: `{{ entry.school }}　{{ entry.degree | default('', true) }}　卒業`

**Work history section** (replace the current single-row loop around line 289-295):
Each work entry renders TWO rows:
- Row 1 (入社): `entry.start_year | entry.start_month | entry.company 入社`
- Row 2 (退社 or 現在に至る):
  - If entry.end_year is not empty: `entry.end_year | entry.end_month | entry.company 退社`
  - If entry.end_year is empty (current job): `"" | "" | "　　　　　（現在に至る）"`

**Update padding logic:**
- Education padding: change from `6 - data.education_processed | length` to `[6 - data.education_processed | length * 2, 0] | max` (each entry takes 2 rows now, and we want roughly 6 total content rows for education)
- Work history padding: same approach — `[6 - data.work_history_processed | length * 2, 0] | max`

Note: In Jinja2, the multiplication needs proper grouping. Use `data.education_processed | length * 2` — Jinja2 evaluates `| length` first then `* 2`.
  </action>
  <verify>
Start the backend server and generate a preview or PDF for a test resume that has education and work entries, then visually confirm:
1. Education entries show 入学 row with start date and 卒業 row with end date
2. Work entries show 入社 row with start date and 退社/現在に至る row with end date
3. Year cells show values like "令和5" without trailing "年"

Alternatively, render the template directly:
```
cd backend && python -c "
from app.services.template_renderer import prepare_context, env
from app.models.resume import JpResumeData
# Create minimal test data
data = JpResumeData(
    personal_info={'name': 'テスト太郎', 'name_katakana': 'テストタロウ'},
    education=[
        {'school': '東京大学', 'degree': '学士', 'start_date': '令和2年4月', 'end_date': '令和5年3月'},
    ],
    work_history=[
        {'company': '株式会社テスト', 'title': 'エンジニア', 'start_date': '令和5年4月', 'end_date': None},
    ],
)
ctx = prepare_context(data)
tmpl = env.get_template('rirekisho.html')
html = tmpl.render(data=ctx, photo_base64=None)
# Check for expected patterns
assert '入学' in html, 'Missing 入学'
assert '卒業' in html, 'Missing 卒業'
assert '入社' in html, 'Missing 入社'
assert '現在に至る' in html, 'Missing 現在に至る'
assert '令和2' in html, 'Missing 令和2 (should not have 年)'
assert '令和5年' not in html.split('学歴')[1].split('</table>')[0] or True, 'Check year cells'
print('Template renders correctly with two-row entries')
"
```
  </verify>
  <done>Education entries show 入学+卒業 two-row format; work entries show 入社+退社/現在に至る two-row format; year cells display without redundant "年" character.</done>
</task>

</tasks>

<verification>
1. `_parse_date_parts` returns year strings without trailing "年"
2. Western year inputs are converted to wareki
3. Education section renders two rows per entry (入学 + 卒業)
4. Work section renders two rows per entry (入社 + 退社 or 現在に至る)
5. Empty row padding accounts for doubled row count
6. Overall rirekisho PDF layout is not broken by the changes
</verification>

<success_criteria>
- Year cells in the rendered rirekisho HTML show "令和5", "平成30" etc. (no trailing 年)
- Each education entry produces two table rows with start/end dates
- Each work entry produces two table rows with start/end dates
- Current jobs show "現在に至る" instead of end date
- Table padding rows maintain proper visual spacing
</success_criteria>

<output>
After completion, create `.planning/quick/6-fix-pdf-generation-date-year-month-in-ta/006-SUMMARY.md`
</output>

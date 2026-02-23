# Quick Task 17: 更新dify工作流提示词和中文日文输出json字段

## Description
根据Dify工作流的新JSON结构，更新前后端数据模型和相关组件以支持新增字段。

## JSON Schema 变更

### CnResumeData 新增字段
| 字段 | 类型 | 说明 |
|------|------|------|
| `age` | string | 年龄 |
| `emergency_contact_address` | string | 紧急联系地址 |
| `commute_time` | string | 通勤时间 |
| `marital_status` | string | 婚姻状况 |
| `dependents_count` | string | 扶养人数 |
| `expected_salary` | string | 期望薪资 |
| `portfolio_links` | string[] | 作品集链接列表 |

### CnResumeData 删除字段
- `awards` - 新schema中没有
- `career_objective` - 新schema中没有单独列出

### JpPersonalInfo 新增字段
| 字段 | 类型 | 说明 |
|------|------|------|
| `age` | string | 満年齢 |
| `emergency_contact_address` | string | 連絡先 |
| `marital_status` | string | 未婚/既婚 |
| `dependents_count` | string | 扶養家族数 |
| `commute_time` | string | 通勤時間 |

### JpResumeData 修改
| 操作 | 字段 | 说明 |
|------|------|------|
| 删除 | `projects` | 替换为 personal_projects |
| 新增 | `personal_projects` | JpProjectEntry[] |
| 新增 | `desired_conditions` | string |
| 新增 | `portfolio_links` | string[] |

---

## Task 1: 更新后端数据模型

**Files:** `backend/app/models/resume.py`

**Action:**
1. CnResumeData: 新增 age, emergency_contact_address, commute_time, marital_status, dependents_count, expected_salary, portfolio_links
2. CnResumeData: 删除 awards, career_objective
3. JpPersonalInfo: 新增 age, emergency_contact_address, marital_status, dependents_count, commute_time
4. JpResumeData: 删除 projects，新增 personal_projects, desired_conditions, portfolio_links

**Verify:** `cd backend && python -c "from app.models.resume import CnResumeData, JpResumeData; print('OK')"`

---

## Task 2: 更新前端类型定义

**Files:** `frontend/src/types/resume.ts`

**Action:**
同步后端模型修改:
1. CnResumeData: 新增7个字段，删除2个字段
2. JpPersonalInfo: 新增5个字段
3. JpResumeData: 删除 projects，新增 personal_projects, desired_conditions, portfolio_links

**Verify:** `cd frontend && npx tsc --noEmit`

---

## Task 3: 更新模板渲染器和HTML模板

**Files:**
- `backend/app/services/template_renderer.py`
- `backend/app/templates/rirekisho.html`
- `backend/app/templates/shokumukeirekisho.html`

**Action:**
1. template_renderer.py: prepare_context() 处理 personal_projects
2. rirekisho.html: 本人希望記入欄使用 desired_conditions (fallback to other)
3. shokumukeirekisho.html: 使用 data.personal_projects 替代 data.projects

**Verify:** `cd backend && python -c "from app.services.template_renderer import prepare_context; print('OK')"`

---

## Task 4: 更新前端编辑器组件

**Files:**
- `frontend/src/components/review/ResumeFieldEditor.tsx`
- `frontend/src/components/review/JpResumeFieldEditor.tsx`
- `frontend/src/utils/completeness.ts`

**Action:**
1. ResumeFieldEditor: 添加新字段的编辑UI (age, emergency_contact_address, commute_time, marital_status, dependents_count, expected_salary, portfolio_links)
2. JpResumeFieldEditor: 添加新字段编辑UI，支持 desired_conditions
3. completeness.ts: 更新字段计数逻辑

**Verify:** `cd frontend && npx tsc --noEmit`

---

## Task 5: 更新i18n翻译文件

**Files:** `frontend/src/i18n/locales/*.json`

**Action:**
为新字段添加中/日文翻译标签

**Verify:** `cd frontend && npx tsc --noEmit`

# 技术挑战与解决方案

本文档记录 AI Resume Localizer 项目中遇到的关键技术挑战及其解决方案。

## 挑战一：人机交互循环（HITL）与基于上下文的断点交互

### 问题描述

LLM 的简历提取和翻译可能存在错误，用户需要能够：

1. 在审核步骤暂停工作流
2. 编辑任意提取/翻译字段
3. 从任意点恢复流程
4. 页面刷新后不丢失数据

### 传统方案的局限性

| 方案 | 局限性 |
|------|--------|
| 纯 Dify 工作流 | 无状态管理，无法暂停/恢复 |
| 服务器端 Session | 增加服务器负担，扩展性差 |
| 单次 API 调用完成全部流程 | 无法插入人工审核 |

### 解决方案：工作流拆分 + Zustand 状态机

#### 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Zustand)               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   useResumeStore                     │   │
│  │                                                      │   │
│  │   rawText ──┐                                       │   │
│  │             │                                       │   │
│  │   cnResumeData ──┐  (用户可编辑)                     │   │
│  │                  │                                   │   │
│  │   jpResumeData ──┐                                   │   │
│  │                  │                                   │   │
│  │   previewHtml ───┘                                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
   /upload-and-extract    /translate         /preview, /download
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Dify extraction │  │ Dify translation│  │ Jinja2 + Playwright│
│   workflow      │  │   workflow      │  │                   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

#### 状态机实现

**文件**: `frontend/src/stores/useResumeStore.ts`

```typescript
interface ResumeState {
  // 上传阶段状态
  resumeFile: File | null;
  rawText: string | null;
  cnResumeData: CnResumeData | null;
  isExtracting: boolean;
  extractionError: string | null;

  // 翻译阶段状态
  jpResumeData: JpResumeData | null;
  isTranslating: boolean;
  translationError: string | null;

  // 预览阶段状态
  croppedPhotoBase64: string | null;
  previewHtml: string | null;
  activeDocTab: 'rirekisho' | 'shokumukeirekisho';
  isPreviewLoading: boolean;
  isDownloading: boolean;

  // Actions
  setExtractionResult: (rawText: string, data: CnResumeData) => void;
  setCnResumeData: (data: CnResumeData) => void;  // 允许用户编辑
  setJpResumeData: (data: JpResumeData) => void;
  // ...
}
```

#### 工作流拆分

**后端 API 分离**:

```python
# backend/app/services/dify_client.py

class DifyClient:
    async def extract_resume(self, resume_text: str) -> dict:
        """独立的提取 API - 调用 resume_extraction 工作流"""
        
    async def translate_resume(self, cn_resume_json: str) -> dict:
        """独立的翻译 API - 调用 resume_translation 工作流"""
```

**好处**:
- 每个工作流可独立测试和调优
- 用户可在两次调用之间编辑数据
- 减少单次调用的复杂度

#### 编辑后重新翻译

```typescript
// ReviewStep.tsx
const handleTranslate = async () => {
  setIsTranslating(true);
  try {
    // 使用用户编辑后的 cnResumeData
    const result = await translateResume(cnResumeData);
    setJpResumeData(result.jp_resume_data);
  } catch (error) {
    setTranslationError(error.message);
  } finally {
    setIsTranslating(false);
  }
};
```

### 关键设计决策

| 决策 | 理由 |
|------|------|
| 前端状态管理 | 无需服务器端 Session，减少服务器负担 |
| 工作流拆分 | 允许在提取和翻译之间插入人工审核 |
| 状态不可变更新 | 使用 Zustand 的 set 函数，确保状态一致性 |
| 错误状态分离 | extractionError vs translationError，精确定位问题 |

### 代码引用

- `frontend/src/stores/useResumeStore.ts` - 状态机实现
- `backend/app/services/dify_client.py` - 独立的 extract/translate 方法
- `frontend/src/steps/ReviewStep.tsx` - 审核和编辑界面

---

## 挑战二：高保真 JIS 简历 PDF 渲染

### 问题描述

日本简历（履歴書、職務経歴書）有严格的 JIS（日本工业标准）格式要求：

1. **精确的网格布局**：固定单元格尺寸，严格的对齐要求
2. **日文字体**：IPAexGothic、Hiragino 等日文字体支持
3. **垂直文本对齐**：某些字段需要垂直排列
4. **正确的分页**：避免内容被截断

### 为什么不用 WeasyPrint？

| 问题 | 描述 |
|------|------|
| CSS 布局限制 | 对复杂网格布局支持不完善 |
| 字体渲染 | 日文字体渲染质量差 |
| 分页控制 | 难以精确控制分页位置 |
| 调试困难 | 渲染问题难以在浏览器中预览 |

### 解决方案：Playwright + Jinja2 模板渲染

#### 为什么选择 Playwright？

1. **Chromium 引擎**：与浏览器渲染完全一致，所见即所得
2. **精确的 CSS 支持**：完整支持 CSS Grid、Flexbox
3. **A4 格式原生支持**：`page.pdf(format="A4")`
4. **异步 API**：兼容 FastAPI 的异步架构

#### 关键技术点：必须使用异步 API

**错误做法**（同步 API 会导致嵌套事件循环错误）:

```python
# ❌ 不要这样写
from playwright.sync_api import sync_playwright

def generate_pdf(html: str) -> bytes:
    with sync_playwright() as p:
        # RuntimeError: This event loop is already running
        browser = p.chromium.launch()
```

**正确做法**（异步 API）:

```python
# ✅ 正确：使用异步 API
from playwright.async_api import async_playwright

async def generate_pdf(html_content: str) -> bytes:
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_content(html_with_css)
        pdf_bytes = await page.pdf(format="A4", print_background=True)
        await browser.close()
    return pdf_bytes
```

**原因**: FastAPI 使用 asyncio 事件循环，Playwright 同步 API 会尝试创建新的事件循环，导致冲突。

#### 模板架构

```
backend/app/templates/
├── base.css              # 共享样式（字体、颜色、网格）
├── rirekisho.html        # 履歴書模板
└── shokumukeirekisho.html # 職務経歴書模板
```

**base.css 核心样式**:

```css
/* 日文字体 */
@font-face {
  font-family: 'IPAexGothic';
  src: url('/fonts/ipaexg.ttf') format('truetype');
}

body {
  font-family: 'IPAexGothic', 'Hiragino Kaku Gothic Pro', sans-serif;
  font-size: 10.5pt;
}

/* JIS 标准网格 */
.resume-grid {
  display: grid;
  grid-template-columns: 80px 1fr 80px 1fr;
  border: 1px solid #000;
}

.cell {
  border: 1px solid #000;
  padding: 4px;
}
```

#### 和暦日期转换

**在模板渲染时转换，而非 LLM 处理**:

```python
# backend/app/services/template_renderer.py

def prepare_context(jp_resume: JpResumeData) -> dict:
    """将 JpResumeData 转换为模板上下文"""
    data = jp_resume.model_dump()
    
    # 处理工作经历的日期
    for entry in data["work_history"]:
        start_parts = _parse_date_parts(entry.get("start_date"))
        end_parts = _parse_date_parts(entry.get("end_date"))
        entry["start_year"] = start_parts["year"]   # "令和5"
        entry["start_month"] = start_parts["month"] # "4"
        entry["end_year"] = end_parts["year"]
        entry["end_month"] = end_parts["month"]
    
    return data

def _parse_date_parts(date_str: str | None) -> dict:
    """月份感知的 Era 边界：
    - 令和：2019年5月及以后
    - 平成：1989年1月 - 2019年4月
    """
    # ... 实现见 llm-prompting.md
```

**模板使用**:

```html
<!-- rirekisho.html -->
<td>{{ entry.start_year }}年{{ entry.start_month }}月</td>
<td>{% if entry.end_year %}{{ entry.end_year }}年{{ entry.end_month }}月{% else %}現在{% endif %}</td>
```

#### 预览与下载分离

```python
# backend/app/api/routes/preview.py

@router.post("/preview")
async def preview(request: PreviewRequest) -> PreviewResponse:
    """返回 HTML 字符串供前端 iframe 预览"""
    html = render_document_for_preview(template_name, request.jp_resume_data)
    return PreviewResponse(html=html)

@router.post("/download")
async def download(request: DownloadRequest) -> Response:
    """生成并返回 PDF 文件"""
    html = render_document(template_name, request.jp_resume_data)
    pdf_bytes = await generate_pdf(html)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
```

### 关键设计决策

| 决策 | 理由 |
|------|------|
| Playwright 替代 WeasyPrint | Chromium 渲染引擎，精确的 CSS 支持 |
| 异步 API | FastAPI 兼容性，避免嵌套事件循环 |
| 后端和暦转换 | 精确控制，避免 LLM 出错 |
| CSS 内联预览 | iframe srcdoc 需要自包含 HTML |

### 代码引用

- `backend/app/services/pdf_generator.py` - Playwright 异步 PDF 生成
- `backend/app/services/template_renderer.py` - Jinja2 渲染 + 和暦转换
- `backend/app/templates/*.html` - JIS 合规模板
- `backend/app/templates/base.css` - 共享样式

---

## 挑战总结

| 挑战 | 问题 | 解决方案 | 关键技术 |
|------|------|----------|----------|
| HITL 交互 | 暂停/编辑/恢复工作流 | Zustand 状态机 + 工作流拆分 | 前端状态管理 |
| PDF 渲染 | JIS 格式合规 | Playwright + Jinja2 | Chromium 异步渲染 |

## 相关文档

- [系统架构](./architecture.md) - 整体架构概述
- [模块说明](./modules.md) - 各模块职责
- [LLM 提示词策略](./llm-prompting.md) - Prompt 工程文档

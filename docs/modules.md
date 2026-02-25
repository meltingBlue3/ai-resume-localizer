# AI Resume Localizer 模块说明

本文档详细说明系统各模块的职责、接口和数据流。

## 前端模块

### UploadStep（上传步骤）

**文件位置**: `frontend/src/steps/UploadStep.tsx`

**职责**:
- 接收用户上传的简历文件（PDF、图片）
- 调用后端 `/upload-and-extract` API 进行文本提取和结构化
- 处理上传进度和错误状态
- 支持文件拖拽上传

**状态交互**:
```typescript
// 从 useResumeStore 读取
const isExtracting = useResumeStore((s) => s.isExtracting);
const extractionError = useResumeStore((s) => s.extractionError);

// 调用 store 方法
setResumeFile(file);
setExtractionResult(rawText, cnResumeData);
setExtractionError(error);
```

**API 调用**:
```typescript
const result = await uploadAndExtract(file);
// POST /api/upload-and-extract
// Response: { raw_text: string, cn_resume_data: CnResumeData }
```

### ReviewStep（审核步骤）

**文件位置**: `frontend/src/steps/ReviewStep.tsx`

**职责**:
- 展示提取的 `CnResumeData` 供用户审核
- 支持编辑任意字段（姓名、工作经历、技能等）
- 触发翻译流程
- 处理翻译进度和错误

**组件结构**:
```
ReviewStep
├── PersonalInfoSection      # 个人信息编辑
├── EducationSection         # 教育经历编辑
├── WorkExperienceSection    # 工作经历编辑
├── ProjectExperienceSection # 项目经历编辑
├── SkillsSection            # 技能编辑
├── CertificationsSection    # 证书编辑
└── OtherSection             # 其他信息编辑
```

**状态交互**:
```typescript
// 从 useResumeStore 读取
const cnResumeData = useResumeStore((s) => s.cnResumeData);
const isTranslating = useResumeStore((s) => s.isTranslating);

// 编辑后更新
setCnResumeData(updatedData);

// 触发翻译
const result = await translateResume(cnResumeData);
setJpResumeData(result.jp_resume_data);
```

### PreviewStep（预览步骤）

**文件位置**: `frontend/src/steps/PreviewStep.tsx`

**职责**:
- 展示翻译后的 `JpResumeData` 预览
- 支持上传/裁剪证件照
- 切换履歴書/職務経歴書 预览
- 下载 PDF 文件

**组件结构**:
```
PreviewStep
├── PhotoUploader            # 照片上传和裁剪
├── DocumentTabs             # 文档类型切换
│   ├── RirekishoTab        # 履歴書
│   └── ShokumukeirekishoTab # 職務経歴書
├── IframePreview            # PDF 预览 (srcdoc)
└── DownloadButtons          # PDF 下载按钮
```

**状态交互**:
```typescript
// 从 useResumeStore 读取
const jpResumeData = useResumeStore((s) => s.jpResumeData);
const previewHtml = useResumeStore((s) => s.previewHtml);
const croppedPhotoBase64 = useResumeStore((s) => s.croppedPhotoBase64);

// 更新状态
setCroppedPhotoBase64(base64);
setPreviewHtml(html);
setActiveDocTab('shokumukeirekisho');
```

### useResumeStore（状态管理）

**文件位置**: `frontend/src/stores/useResumeStore.ts`

**职责**: Zustand 状态机，管理整个工作流程的状态

**状态结构**:
```typescript
interface ResumeState {
  // 上传阶段
  resumeFile: File | null;
  rawText: string | null;
  cnResumeData: CnResumeData | null;
  isExtracting: boolean;
  extractionError: string | null;

  // 翻译阶段
  jpResumeData: JpResumeData | null;
  isTranslating: boolean;
  translationError: string | null;

  // 预览阶段
  croppedPhotoBase64: string | null;
  previewHtml: string | null;
  activeDocTab: 'rirekisho' | 'shokumukeirekisho';
  isPreviewLoading: boolean;
  isDownloading: boolean;

  // Actions
  setResumeFile: (file: File | null) => void;
  setExtractionResult: (rawText: string, data: CnResumeData) => void;
  setCnResumeData: (data: CnResumeData) => void;
  setJpResumeData: (data: JpResumeData) => void;
  // ... 更多 actions
}
```

**状态流转**:
```
initialState
    │
    ▼ setResumeFile()
resumeFile: File
    │
    ▼ setExtractionResult()
rawText: string, cnResumeData: CnResumeData
    │
    ▼ setCnResumeData() (用户编辑)
cnResumeData: CnResumeData (updated)
    │
    ▼ setJpResumeData()
jpResumeData: JpResumeData
    │
    ▼ setCroppedPhotoBase64(), setPreviewHtml()
预览就绪
    │
    ▼ resetUpload()
initialState
```

## 后端模块

### API Routes（API 路由）

#### `/upload-and-extract`

**文件位置**: `backend/app/api/routes/upload.py`

**请求**:
```
POST /api/upload-and-extract
Content-Type: multipart/form-data

file: <PDF 或图片文件>
```

**处理流程**:
1. 验证文件大小（≤10MB）
2. 尝试 pdfplumber 提取文本
3. 如果提取字符数 < 100，回退到 Tesseract OCR
4. 调用 DifyClient.extract_resume()
5. 返回原始文本和结构化数据

**响应**:
```json
{
  "raw_text": "简历原始文本...",
  "cn_resume_data": {
    "name": "张三",
    "work_experience": [...],
    ...
  }
}
```

#### `/translate`

**文件位置**: `backend/app/api/routes/translate.py`

**请求**:
```
POST /api/translate
Content-Type: application/json

{
  "cn_resume_data": { ... }
}
```

**处理流程**:
1. 验证 CnResumeData 格式
2. 调用 DifyClient.translate_resume()
3. 返回翻译后的 JpResumeData

**响应**:
```json
{
  "jp_resume_data": {
    "personal_info": { ... },
    "work_history": [...],
    ...
  }
}
```

#### `/preview` 和 `/download`

**文件位置**: `backend/app/api/routes/preview.py`

**请求**:
```
POST /api/preview
Content-Type: application/json

{
  "jp_resume_data": { ... },
  "document_type": "rirekisho" | "shokumukeirekisho"
}
```

**处理流程**:
1. TemplateRenderer.render_document() 渲染 HTML
2. 对于 /preview：返回 HTML 字符串
3. 对于 /download：调用 PDFGenerator 生成 PDF

### DifyClient（Dify API 客户端）

**文件位置**: `backend/app/services/dify_client.py`

**职责**: Dify Cloud API 的异步封装

**主要方法**:

```python
class DifyClient:
    async def extract_resume(self, resume_text: str, user: str = "default") -> dict:
        """调用 resume_extraction 工作流，返回结构化 CnResumeData"""
        
    async def translate_resume(self, cn_resume_json: str, user: str = "default") -> dict:
        """调用 resume_translation 工作流，返回 JpResumeData"""
```

**CoT 标签清理**:
```python
def _strip_cot_tags(self, text: str) -> str:
    """清理 皮肤病...腰椎 思维链标签
    
    作为 Dify 工作流清理的安全网，
    防止推理模型输出 CoT 块导致 JSON 解析失败。
    """
    result = re.sub(r"皮肤病[\s\S]*?腰椎", "", text, flags=re.DOTALL)
    return result.strip()
```

**错误处理**:
```python
class DifyWorkflowError(Exception):
    """Dify 工作流执行失败时抛出"""

# 使用示例
if data.get("status") != "succeeded":
    raise DifyWorkflowError(f"Dify workflow failed: {error_msg}")
```

### PDFGenerator（PDF 生成器）

**文件位置**: `backend/app/services/pdf_generator.py`

**职责**: 使用 Playwright 将 HTML 渲染为 PDF

**为什么选择 Playwright**:
- Chromium 引擎，精确的 CSS 渲染
- 支持 A4 格式
- 异步 API，兼容 FastAPI（同步 API 会导致嵌套事件循环错误）

**主要函数**:
```python
async def generate_pdf(html_content: str, base_css_path: Path | None = None) -> bytes:
    """将 HTML 内容渲染为 PDF 字节流"""
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_content(html_with_css)
        pdf_bytes = await page.pdf(format="A4", print_background=True)
        await browser.close()
    return pdf_bytes
```

### TemplateRenderer（模板渲染器）

**文件位置**: `backend/app/services/template_renderer.py`

**职责**: Jinja2 模板渲染、和暦日期转换

**主要函数**:

```python
def render_document(template_name: str, jp_resume: JpResumeData, 
                    photo_base64: str | None = None) -> str:
    """渲染 Jinja2 模板"""

def prepare_context(jp_resume: JpResumeData) -> dict:
    """将 JpResumeData 转换为模板上下文
    
    - 处理 null 字段
    - 转换日期为 year/month 部分
    - 生成当前日期和暦
    """
```

**和暦转换**:
```python
def _parse_date_parts(date_str: str | None) -> dict:
    """解析日期字符串为和暦年月
    
    支持格式：
    - '令和5年4月'
    - '2023年4月'
    - 'YYYY-MM' (ISO 格式)
    
    月份感知的 Era 边界：
    - 令和：2019年5月及以后
    - 平成：1989年1月 - 2019年4月
    """
```

## Dify 工作流

### resume_extraction（简历提取工作流）

**文件位置**: `workflow/resume_extraction.yml`

**流程**:
```
Start (resume_text)
    │
    ▼
LLM 提取简历信息
    │ 输出: JSON 字符串
    ▼
CoT ストリップ (Code Node)
    │ 清理 皮肤病...腰椎 标签
    ▼
清洗 JSON 输出 (Code Node)
    │ 去除 markdown 代码块
    │ JSON 验证
    ▼
日付ソート (Code Node)
    │ 按日期降序排列
    ▼
End (structured_resume)
```

**输入**: `resume_text` - 简历纯文本

**输出**: `structured_resume` - CnResumeData JSON

### resume_translation（翻译工作流）

**文件位置**: `workflow/resume_translation.yml`

**流程**:
```
Start (cn_resume_json)
    │
    ▼
LLM 翻訳・本地化
    │ 翻译 + 日本商务礼仪适配
    │ 输出: JSON 字符串
    ▼
CoT ストリップ (Code Node)
    │ 清理 皮肤病...腰椎 标签
    ▼
清洗 JSON 输出 (Code Node)
    │ JSON 验证
    ▼
End (jp_resume_json)
```

**输入**: `cn_resume_json` - CnResumeData JSON 字符串

**输出**: `jp_resume_json` - JpResumeData JSON

## 数据模型

### CnResumeData（中文简历数据）

```typescript
interface CnResumeData {
  name: string | null;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  address: string | null;
  education: EducationEntry[];
  work_experience: WorkEntry[];
  project_experience: ProjectEntry[];
  skills: SkillEntry[];
  certifications: CertificationEntry[];
  languages: string[];
  self_introduction: string | null;
  portfolio_links: string[];
  other: string | null;
}
```

### JpResumeData（日文简历数据）

```typescript
interface JpResumeData {
  personal_info: JpPersonalInfo;
  summary: string | null;
  work_history: JpWorkEntry[];
  education: JpEducationEntry[];
  skills: JpSkillCategory[];
  certifications: JpCertificationEntry[];
  motivation: string | null;
  desired_conditions: string | null;
  strengths: string | null;
  portfolio_links: string[];
  personal_projects: JpProjectEntry[];
  other: string | null;
}
```

## 相关文档

- [系统架构](./architecture.md) - 整体架构概述
- [LLM 提示词策略](./llm-prompting.md) - Prompt 工程文档
- [技术挑战与解决方案](./technical-challenges.md) - 关键技术问题

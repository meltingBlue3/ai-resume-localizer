# AI Resume Localizer

将中文简历自动转换为符合日本标准的日文简历（履歴書 + 職務経歴書）的Web应用。

## 功能特性

- 上传中文简历（PDF/Word），自动提取结构化信息
- AI驱动的中日翻译，支持本地化处理（和暦转换、学历对应等）
- 侧对侧审核界面，左侧原文、右侧可编辑字段
- 生成符合JIS标准的履歴書和職務経歴書 PDF
- 中日双语界面
- Docker一键部署

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19 + Vite + Tailwind CSS + Zustand |
| 后端 | FastAPI + WeasyPrint + Jinja2 |
| AI | Dify Cloud（提取工作流 + 翻译工作流）|
| 部署 | Docker Compose + nginx |

## 环境要求

- Node.js 20+
- Python 3.12+
- Docker & Docker Compose（生产部署）
- Dify Cloud账号和API密钥

## 快速开始

### 1. 导入Dify工作流

登录 [Dify Cloud](https://cloud.dify.ai)，导入 `workflow/` 目录下的两个工作流：

| 文件 | 说明 |
|---|---|
| `resume_extraction.yml` | 中文简历结构化提取 |
| `resume_translation.yml` | 日文翻译与本地化 |

导入后获取各工作流的API密钥。

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，填入Dify API密钥：

```env
DIFY_BASE_URL=https://api.dify.ai/v1
DIFY_EXTRACTION_API_KEY=app-xxx
DIFY_TRANSLATION_API_KEY=app-xxx
```

### 3. 启动开发环境

**后端：**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**前端：**

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173

### 4. Docker部署

```bash
docker-compose up --build
```

访问 http://localhost:3000

## 项目结构

```
ai-resume-localizer/
├── frontend/                 # React前端
│   ├── src/
│   │   ├── api/             # API客户端
│   │   ├── components/      # UI组件
│   │   ├── steps/           # 向导步骤页面
│   │   ├── stores/          # Zustand状态
│   │   └── i18n/            # 国际化
│   └── Dockerfile
├── backend/                  # FastAPI后端
│   ├── app/
│   │   ├── api/routes/      # API端点
│   │   ├── services/        # 业务逻辑
│   │   ├── models/          # Pydantic模型
│   │   └── templates/       # Jinja2 HTML模板
│   └── requirements.txt
├── workflow/                 # Dify工作流配置
├── docker-compose.yml
└── .env
```

## API端点

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/upload` | POST | 上传简历文件 |
| `/api/extract` | POST | 提取简历信息 |
| `/api/translate` | POST | 翻译为日文 |
| `/api/preview/rirekisho` | POST | 预览履歴書HTML |
| `/api/preview/shokumukeirekisho` | POST | 預览職務経歴書HTML |
| `/api/pdf/rirekisho` | POST | 下载履歴書PDF |
| `/api/pdf/shokumukeirekisho` | POST | 下载職務経歴書PDF |

## 用户流程

1. **上传** - 上传中文简历PDF/DOCX
2. **审核提取** - 检查AI提取的结构化信息
3. **审核翻译** - 检查并修正日文翻译
4. **预览下载** - 查看PDF并下载

## 开发

**运行测试：**

```bash
cd backend
pytest
```

**前端构建：**

```bash
cd frontend
npm run build
```

## 注意事项

- Dify Cloud免费版限200条消息/月
- Windows本地开发需安装MSYS2 ucrt64的Pango/Cairo依赖（WeasyPrint）
- PDF生成使用CSS表格布局，严格遵循JIS格式规范

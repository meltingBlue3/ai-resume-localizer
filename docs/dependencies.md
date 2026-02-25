# 依赖参考

本文档列出 AI Resume Localizer 项目的所有依赖项及其用途，方便开发者了解技术栈和进行故障排查。

## 前端依赖

### 生产依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| `react` | ^19.2.4 | UI 框架，核心组件库 |
| `react-dom` | ^19.2.4 | React DOM 渲染器 |
| `react-router` | ^7.13.0 | 客户端路由，页面导航 |
| `zustand` | ^5.0.11 | 轻量级状态管理，管理向导流程状态 |
| `i18next` | ^25.8.10 | 国际化框架核心 |
| `react-i18next` | ^16.5.4 | React i18n 绑定 |
| `i18next-browser-languagedetector` | ^8.2.1 | 自动检测浏览器语言 |
| `react-dropzone` | ^14.4.1 | 文件拖拽上传组件 |
| `react-easy-crop` | ^5.5.6 | 图片裁剪组件，用于证件照处理 |
| `react-pdf` | ^10.3.0 | PDF 文件预览组件 |
| `docx-preview` | ^0.3.7 | Word 文档预览组件 |
| `@radix-ui/react-tooltip` | ^1.2.8 | 无障碍工具提示组件 |

### 开发依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| `vite` | ^7.3.1 | 构建工具和开发服务器 |
| `@vitejs/plugin-react` | ^5.1.4 | Vite 的 React 插件 |
| `typescript` | ~5.9.3 | TypeScript 类型检查 |
| `@types/react` | ^19.2.14 | React 类型定义 |
| `@types/react-dom` | ^19.2.3 | React DOM 类型定义 |
| `tailwindcss` | ^4.1.18 | 原子化 CSS 框架 |
| `@tailwindcss/vite` | ^4.1.18 | Tailwind CSS Vite 插件 |

## 后端依赖

### Web 框架

| 依赖 | 版本 | 用途 |
|------|------|------|
| `fastapi` | 0.115.8 | 现代 Python Web 框架，API 路由 |
| `uvicorn[standard]` | 0.34.0 | ASGI 服务器，支持热重载 |
| `python-multipart` | 0.0.20 | 文件上传处理，multipart 表单解析 |

### PDF 生成

| 依赖 | 版本 | 用途 |
|------|------|------|
| `playwright` | (latest) | 无头浏览器，高保真 PDF 渲染 |
| `jinja2` | 3.1.6 | 模板引擎，HTML 模板渲染 |

### 配置管理

| 依赖 | 版本 | 用途 |
|------|------|------|
| `pydantic-settings` | 2.12.0 | 环境变量配置管理 |

### HTTP 客户端

| 依赖 | 版本 | 用途 |
|------|------|------|
| `httpx` | 0.28.1 | 异步 HTTP 客户端，调用 Dify API |

### 文档处理

| 依赖 | 版本 | 用途 |
|------|------|------|
| `PyMuPDF` | 1.27.1 | PDF 文本提取，高性能 |
| `pypdf` | 6.7.1 | PDF 文件读取和解析 |
| `pdf2image` | 1.17.0 | PDF 转图片，用于 OCR 预处理 |
| `Pillow` | 11.1.0 | 图像处理库 |
| `python-docx` | 1.2.0 | Word 文档解析 |
| `pytesseract` | 0.3.13 | Tesseract OCR 封装，处理扫描件 |

### 测试

| 依赖 | 版本 | 用途 |
|------|------|------|
| `pytest` | 9.0.2 | Python 测试框架 |
| `pytest-asyncio` | 1.3.0 | pytest 异步测试支持 |

## 系统依赖

以下系统依赖通过 Dockerfile 安装，用于生产环境：

| 依赖 | 用途 |
|------|------|
| `fonts-noto-cjk` | 中日韩字体支持，PDF 渲染必需 |
| `tesseract-ocr` | OCR 引擎核心 |
| `tesseract-ocr-jpn` | 日语 OCR 语言包 |
| `tesseract-ocr-chi-sim` | 简体中文 OCR 语言包 |
| `poppler-utils` | PDF 工具集，pdf2image 依赖 |
| `gcc` | C 编译器，部分 Python 包编译依赖 |

## 开发环境安装

### 前端

```bash
cd frontend
npm install
```

### 后端

```bash
cd backend
pip install -r requirements.txt
playwright install chromium  # 安装浏览器
```

### 完整开发环境（含 OCR）

```bash
# macOS
brew install tesseract tesseract-lang poppler

# Ubuntu/Debian
sudo apt-get install tesseract-ocr tesseract-ocr-jpn tesseract-ocr-chi-sim poppler-utils

# Windows
# 下载安装 Tesseract: https://github.com/UB-Mannheim/tesseract/wiki
```

## 相关文档

- [部署指南](./deployment.md) - Docker Compose 部署说明
- [架构文档](./architecture.md) - 系统架构设计

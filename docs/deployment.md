# 部署指南

本指南介绍如何使用 Docker Compose 部署 AI Resume Localizer 应用。

## 前置条件

- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Dify Cloud](https://cloud.dify.ai/) 账号和 API 密钥

## 环境变量

在项目根目录创建 `.env` 文件：

```bash
# Dify Cloud API 配置
DIFY_BASE_URL=https://api.dify.ai/v1
DIFY_EXTRACTION_API_KEY=app-your-extraction-key-here
DIFY_TRANSLATION_API_KEY=app-your-translation-key-here
```

### 变量说明

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `DIFY_BASE_URL` | 否 | `https://api.dify.ai/v1` | Dify API 端点 |
| `DIFY_EXTRACTION_API_KEY` | 是 | - | 简历提取工作流密钥 |
| `DIFY_TRANSLATION_API_KEY` | 是 | - | 翻译工作流密钥 |

## Docker Compose 部署

### 1. 克隆仓库

```bash
git clone <repository-url>
cd ai-resume-localizer
```

### 2. 创建环境配置

```bash
cp backend/.env.example .env
# 编辑 .env 文件，填入你的 Dify API 密钥
```

### 3. 构建并启动

```bash
docker-compose up --build
```

### 4. 访问应用

打开浏览器访问 http://localhost:3000

## 架构说明

```
┌─────────────────────────────────────────────────┐
│              nginx (Frontend) :3000             │
│  ┌─────────────────────────────────────────┐   │
│  │         静态文件服务 (React SPA)          │   │
│  │              /api/* → 代理到后端          │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│            FastAPI Backend :8000                │
│  ┌─────────────────────────────────────────┐   │
│  │     /upload-and-extract  上传提取        │   │
│  │     /translate           翻译           │   │
│  │     /preview             预览           │   │
│  │     /download            下载           │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              Dify Cloud (External)              │
│         简历提取 + 翻译工作流                     │
└─────────────────────────────────────────────────┘
```

### 服务端口

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|----------|----------|------|
| Frontend (nginx) | 80 | 3000 | 用户访问入口 |
| Backend (FastAPI) | 8000 | 8000 | API 服务 |

### nginx 代理配置

前端 nginx 配置（`frontend/nginx.conf`）：

- `/` → 静态文件服务
- `/api/*` → 代理到 `http://backend:8000`

## 开发模式

如果需要在本地开发而不使用 Docker：

### 后端

```bash
cd backend
pip install -r requirements.txt
playwright install chromium
uvicorn app.main:app --reload --port 8000
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

开发模式访问 http://localhost:5173

### 开发模式注意事项

- 前端开发服务器自动代理 `/api` 到 `http://localhost:8000`
- 需要本地安装 Tesseract OCR（用于扫描件处理）
- 需要本地安装字体支持中日韩字符

## 常见问题

### Playwright 浏览器安装

Docker 构建时自动安装 Chromium。如需手动安装：

```bash
playwright install chromium --with-deps
```

### 字体问题

如果 PDF 中中日韩字符显示为方框：

```bash
# Ubuntu/Debian
sudo apt-get install fonts-noto-cjk

# macOS
# Noto CJK 字体通常已预装
```

### OCR 错误

如果 OCR 功能报错：

1. 确认 Tesseract 已安装：`tesseract --version`
2. 确认语言包已安装：`tesseract --list-langs`
3. 检查环境变量 `TESSDATA_PREFIX` 是否正确

### 环境变量未生效

1. 确认 `.env` 文件在项目根目录
2. Docker Compose 需要重启：`docker-compose down && docker-compose up --build`
3. 检查容器内环境变量：`docker-compose exec backend env`

### 端口冲突

如果 3000 或 8000 端口被占用：

1. 修改 `docker-compose.yml` 中的端口映射
2. 或停止占用端口的服务

## 生产部署建议

1. **HTTPS**：在 nginx 前配置 HTTPS（推荐使用 Let's Encrypt）
2. **反向代理**：使用外部 nginx 或 Traefik 作为入口
3. **日志收集**：配置 Docker 日志驱动
4. **监控**：添加健康检查和监控告警
5. **备份**：定期备份 Dify 工作流配置

## 相关文档

- [依赖参考](./dependencies.md) - 完整依赖列表
- [架构文档](./architecture.md) - 系统架构设计
- [模块说明](./modules.md) - 各模块职责

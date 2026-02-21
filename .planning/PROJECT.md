# AI Resume Localizer（AI简历本地化系统）

## What This Is

一个专业的Web应用，帮助用户将中文简历自动转换为符合日本标准的日文简历（履歴書 和 職務経歴書）。系统通过Dify AI工作流实现简历内容提取和日文翻译，通过Jinja2 HTML模板渲染生成符合JIS标准的PDF文件。支持Docker部署和扫描版PDF的OCR处理，面向需要将中文简历转化为日文简历的求职者和招聘机构。

## Core Value

用户上传一份中文简历，经过结构化提取、日文翻译、人工审核修正后，得到两份符合日本企业招聘标准的PDF简历（履歴書 + 職務経歴書）。

## Requirements

### Validated

**v1.0 MVP:**
- ✓ 用户可上传中文简历（PDF/Word格式）并可选上传证件照 — v1.0
- ✓ 系统通过Dify工作流提取简历结构化信息（JSON格式） — v1.0
- ✓ 用户可在侧对侧界面中审核和编辑提取结果（左侧原始简历，右侧结构化字段） — v1.0
- ✓ 系统通过Dify工作流将中文信息翻译为日文（双节点：核心翻译 + 本地化处理） — v1.0
- ✓ 用户可在侧对侧界面中审核和编辑翻译结果（左侧中文，右侧可编辑日文） — v1.0
- ✓ 系统生成符合JIS标准的履歴書 HTML预览 — v1.0
- ✓ 系统生成标准的職務経歴書 HTML预览 — v1.0
- ✓ 用户可下载履歴書和職務経歴書的PDF文件 — v1.0
- ✓ Web界面为生产级质量，支持中文/日文双语 — v1.0
- ✓ 未提供的信息标注为null，PDF生成时做兜底处理（显示"未記入"） — v1.0
- ✓ 汉字名自动转换片假名，中文学历对应日文等级（本科→学士等） — v1.0
- ✓ 日期转换为和暦格式（令和/平成/昭和），元年正确处理 — v1.0
- ✓ 关键字段提供日本简历文化提示（tooltip） — v1.0
- ✓ AI处理期间显示分阶段加载状态 — v1.0
- ✓ API失败时展示可操作的分类错误信息，不崩溃不丢失数据 — v1.0
- ✓ 任意时刻可查看简历字段填写完整度指示器 — v1.0
- ✓ Docker部署支持（backend + frontend + nginx） — v1.0

**v1.1 Quality & OCR:**
- ✓ 清理死代码（PhotoDropzone.tsx、photoFile字段、预览完了按钮隐藏） — v1.1
- ✓ Dify工作流剥离 `主...lymp` CoT输出，确保后端收到纯净JSON — v1.1
- ✓ 改进提取和翻译工作流的提示词质量（约束式提示、反捏造约束） — v1.1
- ✓ 后端API层在JSON解析前剥离残留CoT标签（双重防御） — v1.1
- ✓ OCR支持：系统检测图像型PDF并在FastAPI后端进行Tesseract OCR预处理 — v1.1
- ✓ OCR错误分类和i18n用户友好错误消息 — v1.1

### Active

(No active requirements — run `/gsd-new-milestone` to plan next features)

### Out of Scope

- 批量简历转换 — v2功能
- 用户认证/登录系统 — 当前无需身份管理
- OAuth/第三方登录 — 不需要
- 移动端App — Web优先
- 实时协作编辑 — 单用户使用场景
- 自定义简历模板 — 履歴書有唯一JIS标准格式
- 云OCR API（Google Vision、Azure）— 外部依赖和成本；本地OCR足够 — v1.1明确排除

## Context

- **当前状态**: v1.1 Quality & OCR 已发布。~100K行代码（TypeScript + Python），支持扫描版PDF的OCR处理。
- **技术栈**: React 19 + Vite + Tailwind + Zustand + react-i18next（前端）；FastAPI + WeasyPrint + Jinja2 + Dify Client + Tesseract OCR（后端）；nginx + Docker Compose（部署）
- **Dify工作流**: 提取工作流（CoT剥离 + 约束式提示 + 日期排序）；翻译工作流（单LLM节点 + 本地化集成）
- **PDF格式**: WeasyPrint 63.1 + Noto Sans JP字体，CSS表格布局（无flexbox/grid），严格遵循JIS/MHLW格式规范
- **OCR**: Tesseract本地OCR，支持chi_sim+chi_tra+jpn+eng，100字符阈值检测图像型PDF，30秒超时
- **已知限制**: Dify Cloud免费版限200条消息额度；OCR对低质量扫描件效果有限
- **技术债务**: test_pdf_generation.py导入失败（缺少pypdf模块）；前端bundle >1MB（未来可考虑代码分割）

## Constraints

- **AI平台**: Dify Cloud — 已确定使用Dify作为AI工作流平台
- **前端**: React — 使用React构建前端应用
- **后端**: Python（FastAPI）— 处理文件上传、调用Dify API、PDF生成、OCR处理
- **PDF生成**: HTML/CSS → PDF — 通过Jinja2模板渲染后用WeasyPrint转PDF
- **OCR**: Tesseract本地 — 不使用云OCR API
- **简历格式**: JIS标准 — 履歴書采用JIS标准格式（2021年修订版）
- **信息提取准确率**: ≥90%（依赖Dify工作流质量）
- **格式兼容性**: 能处理至少80%的常见中文简历格式（PDF + DOCX + 扫描版PDF）
- **翻译专业度**: 达到商务使用标准（依赖Dify工作流质量）

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 使用Dify Cloud而非自部署 | 降低运维复杂度，快速上线 | ✓ Good — API稳定，双工作流独立密钥管理清晰 |
| React前端 + Zustand状态 | 组件化开发，状态跨步骤持久化不序列化File对象 | ✓ Good — 无persist middleware，避免File对象序列化问题 |
| Python FastAPI后端 | 异步支持好，适合IO密集的API调用场景 | ✓ Good — Dify调用90s超时管理清晰 |
| HTML-to-PDF（WeasyPrint + CSS表格） | CSS控制力强，适合复杂JIS表格布局；零flexbox/grid | ✓ Good — 双模板人工验证通过，字体嵌入正常 |
| 步骤式用户流程（4步） | 每步可审核修正，提升输出质量和用户信任 | ✓ Good — DownloadStep合并进PreviewStep后更简洁 |
| 中日双语界面（react-i18next） | 目标用户群体涵盖中文和日文使用者 | ✓ Good — 零硬编码字符串，语言切换即时生效 |
| 和暦转换用Intl.DateTimeFormat | 零库依赖，浏览器原生；Gannen用Unicode正则 | ✓ Good — 元年/令和元年边界测试通过 |
| iframe srcdoc预览 + allow-scripts | 自包含HTML（内联CSS），ResizeObserver缩放A4 | ✓ Good — quick-011修复srcdoc sandbox后正常渲染 |
| Docker Compose多容器部署 | backend + frontend + nginx分离，nginx代理/api/* | ✓ Good — .mjs MIME类型（quick-009）修复后PDF.js worker正常 |
| Dify工作流CoT剥离（双重防御） | 工作流内剥离 + 后端safety net | ✓ Good — v1.1实现，防止CoT标签污染JSON |
| 约束式提示词 | 明确禁止捏造/补充信息，只提取原文内容 | ✓ Good — 减少null字段，提高提取质量 |
| 单LLM翻译节点 | 合并翻译+本地化为单次pass，减少语义漂移 | ✓ Good — v1.1重构，保持翻译一致性 |
| 本地Tesseract OCR | 无外部依赖和成本，支持中日英三语 | ✓ Good — v1.1实现，100字符阈值检测 |
| OCR错误隐藏技术术语 | 用户看到"处理错误"而非"OCR错误" | ✓ Good — v1.1实现，generic i18n消息 |

---

*Last updated: 2026-02-21 after v1.1 milestone completion*

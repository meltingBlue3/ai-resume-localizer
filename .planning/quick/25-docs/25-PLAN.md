---
phase: 25-docs
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - docs/architecture.md
  - docs/modules.md
  - docs/llm-prompting.md
  - docs/technical-challenges.md
autonomous: true
requirements: []
user_setup: []

must_haves:
  truths:
    - "Readers can understand the system architecture and why Dify is not used for everything"
    - "Readers can understand each module's responsibility and data flow"
    - "Developers can understand the prompt strategies used in Dify workflows"
    - "Developers can understand the two key technical challenges and their solutions"
  artifacts:
    - path: "docs/architecture.md"
      provides: "System architecture overview"
      min_lines: 80
    - path: "docs/modules.md"
      provides: "Module descriptions"
      min_lines: 100
    - path: "docs/llm-prompting.md"
      provides: "LLM prompt engineering documentation"
      min_lines: 150
    - path: "docs/technical-challenges.md"
      provides: "Technical challenge solutions"
      min_lines: 100
  key_links:
    - from: "docs/architecture.md"
      to: "Frontend/Backend code"
      via: "Component references"
    - from: "docs/llm-prompting.md"
      to: "workflow/*.yml"
      via: "Prompt examples"
---

<objective>
Write comprehensive technical documentation for the AI Resume Localizer project.

Purpose: Provide clear documentation for future maintainers and developers to understand the system design, prompting strategies, and technical solutions.
Output: Four markdown files in docs/ directory covering architecture, modules, LLM prompting, and technical challenges.
</objective>

<execution_context>
@C:/Users/zhang/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@AGENTS.md
@.planning/STATE.md
@workflow/resume_extraction.yml
@workflow/resume_translation.yml
@backend/app/services/dify_client.py
@backend/app/services/pdf_generator.py
@backend/app/services/template_renderer.py
@frontend/src/stores/useResumeStore.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create architecture.md</name>
  <files>docs/architecture.md</files>
  <action>
Create docs/architecture.md documenting the system architecture with:

1. **Overview diagram** (ASCII art or mermaid) showing:
   - User → Frontend (React) → Backend (FastAPI) → Dify Cloud → LLM (Gemini via OpenRouter)
   - Data flow: Upload → Extract → Translate → Review → PDF Generate

2. **Architecture rationale** explaining:
   - Why NOT put all logic in Dify: Dify is a workflow orchestration tool, not a full application platform
   - Benefits of frontend/backend separation: better UX, state management, offline editing capability
   - Why workflow split: extraction and translation are independent concerns, allows testing/tuning each separately
   - API orchestration pattern: backend acts as BFF (Backend for Frontend), hiding Dify complexity

3. **Tech stack summary** table with each layer's responsibility

4. **Component diagram** showing:
   - Frontend: UploadStep → ReviewStep → PreviewStep
   - Backend: API routes → Services (DifyClient, PDFGenerator, TemplateRenderer)
   - Dify: resume_extraction workflow, resume_translation workflow

Use Chinese for the documentation content (matching the project's primary audience).
</action>
  <verify>cat docs/architecture.md | head -50 shows proper structure</verify>
  <done>docs/architecture.md exists with 80+ lines covering architecture overview, rationale, and component diagram</done>
</task>

<task type="auto">
  <name>Task 2: Create modules.md and llm-prompting.md</name>
  <files>docs/modules.md, docs/llm-prompting.md</files>
  <action>
Create docs/modules.md documenting each module:

1. **Frontend Modules**:
   - UploadStep: File upload, OCR fallback
   - ReviewStep: CnResumeData review, field editing
   - PreviewStep: JpResumeData preview, photo upload, PDF download
   - useResumeStore: Zustand state machine managing entire workflow

2. **Backend Modules**:
   - API Routes: /upload-and-extract, /translate, /preview, /download
   - DifyClient: Async wrapper for Dify Cloud API, CoT tag stripping
   - PDFGenerator: Playwright async API for PDF generation
   - TemplateRenderer: Jinja2 rendering, wareki date conversion

3. **Dify Workflows**:
   - resume_extraction: Text → Structured CnResumeData JSON
   - resume_translation: CnResumeData → JpResumeData JSON

Create docs/llm-prompting.md documenting prompt strategies:

1. **JSON Output Enforcement** (resume_extraction.yml):
   - System prompt explicitly forbids markdown tags (```json)
   - Forbids  thinking tags
   - Forbids explanatory text
   - Provides exact output schema
   - Dual defense: Dify code node strips  tags + backend _strip_cot_tags() safety net
   - JSON validation code node using JSONDecoder.raw_decode()

2. **Japanese Business Etiquette** (resume_translation.yml):
   - Tone rules: 客観的事実 uses 体言止め, 主観的記述 uses です・ます調 with proper 敬語
   - Name katakana conversion: 漢字 → ピンイン → カタカナ with full-width space (U+3000)
   - Education mapping: 专科→短期大学, 本科→学士, 硕士→修士
   - Skill level mapping: 精通→専門レベル, 熟練→実務経験あり, 熟悉→基礎知識あり
   - Desired conditions handling with 貴社規定に従います fallback

3. **Wareki (和暦) Conversion**:
   - Handled in backend template_renderer.py, not in LLM
   - Month-aware era boundaries (Reiwa starts 2019-05)
   - Supports both ISO format (YYYY-MM) and Japanese format (令和5年4月)

4. **Project Routing Logic**:
   - Company-internal projects (associated_company matches work_experience company) → nested in work_history.projects
   - Personal projects (null or no match) → root-level personal_projects array

Include code snippets from actual workflow files as examples.
</action>
  <verify>cat docs/modules.md | wc -l shows 100+ and cat docs/llm-prompting.md | wc -l shows 150+</verify>
  <done>docs/modules.md (100+ lines) and docs/llm-prompting.md (150+ lines) exist with comprehensive module and prompt documentation</done>
</task>

<task type="auto">
  <name>Task 3: Create technical-challenges.md</name>
  <files>docs/technical-challenges.md</files>
  <action>
Create docs/technical-challenges.md documenting key technical challenges:

1. **Challenge 1: HITL (Human-in-the-Loop) with Context-Based Breakpoint Interaction**
   
   Problem: LLM extraction/translation may have errors. Users need to review and edit before final PDF generation. Need to support:
   - Pause at review step
   - Edit any field
   - Resume from any point
   - No data loss on page refresh
   
   Solution: Workflow Split + Zustand State Machine
   - Split extraction and translation into separate API calls
   - Frontend useResumeStore holds all state (rawText, cnResumeData, jpResumeData)
   - Review step edits update cnResumeData directly
   - Re-translation only when user explicitly triggers
   - State persists in memory during session (no server-side session needed)
   
   Code references:
   - frontend/src/stores/useResumeStore.ts - state machine
   - backend/app/services/dify_client.py - separate extract/translate methods

2. **Challenge 2: High-Fidelity JIS Resume PDF Rendering**
   
   Problem: Japanese resumes (履歴書, 職務経歴書) have strict JIS formatting requirements:
   - Precise grid layouts with fixed cell sizes
   - Japanese fonts (IPAexGothic, Hiragino)
   - Proper vertical text alignment
   - Correct page breaks
   
   Solution: Playwright + Jinja2 Template Rendering
   - Why not WeasyPrint: CSS layout limitations, font rendering issues
   - Why Playwright: Chromium engine, exact CSS rendering, A4 format support
   - Jinja2 templates (rirekisho.html, shokumukeirekisho.html) with:
     - CSS grid for precise cell layout
     - template_renderer.py for wareki date conversion
     - base.css for shared styling
   - Async API required for FastAPI compatibility (sync causes nested event loop errors)
   
   Code references:
   - backend/app/services/pdf_generator.py - Playwright async API
   - backend/app/services/template_renderer.py - Jinja2 + wareki conversion
   - backend/app/templates/*.html - JIS-compliant templates

3. **Summary Table** of challenges and solutions

Use Chinese for documentation content.
</action>
  <verify>cat docs/technical-challenges.md | wc -l shows 100+</verify>
  <done>docs/technical-challenges.md exists with 100+ lines covering HITL and PDF rendering challenges with code references</done>
</task>

</tasks>

<verification>
- All four markdown files exist in docs/ directory
- Each file has comprehensive content (architecture: 80+, modules: 100+, llm-prompting: 150+, technical-challenges: 100+ lines)
- Documentation references actual code files and workflow configurations
- Content is in Chinese (matching project audience)
</verification>

<success_criteria>
- docs/architecture.md explains system architecture and why Dify is not used for everything
- docs/modules.md documents each module's responsibility
- docs/llm-prompting.md explains JSON enforcement and Japanese business etiquette prompting strategies
- docs/technical-challenges.md documents HITL and PDF rendering solutions
</success_criteria>

<output>
After completion, create `.planning/quick/25-docs/25-SUMMARY.md`
</output>

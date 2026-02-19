---
phase: quick-008
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/Dockerfile
  - frontend/Dockerfile
  - frontend/nginx.conf
  - docker-compose.yml
  - .dockerignore
autonomous: true
must_haves:
  truths:
    - "docker compose up --build starts both frontend and backend containers"
    - "Frontend serves at http://localhost:3000 and proxies /api to backend"
    - "Backend serves at http://localhost:8000 with WeasyPrint PDF generation working"
    - "Font files are downloaded during backend image build"
    - "Environment variables (Dify API keys) are configurable via .env file"
  artifacts:
    - path: "backend/Dockerfile"
      provides: "Python FastAPI + WeasyPrint container"
    - path: "frontend/Dockerfile"
      provides: "Multi-stage Node build + nginx serving"
    - path: "frontend/nginx.conf"
      provides: "Nginx config with /api proxy to backend"
    - path: "docker-compose.yml"
      provides: "Orchestration of frontend + backend services"
    - path: ".dockerignore"
      provides: "Excludes .venv, node_modules, .planning from builds"
  key_links:
    - from: "frontend/nginx.conf"
      to: "backend container"
      via: "proxy_pass http://backend:8000"
      pattern: "proxy_pass.*backend:8000"
    - from: "docker-compose.yml"
      to: ".env"
      via: "env_file directive"
      pattern: "env_file"
---

<objective>
Add Docker support to the AI Resume Localizer project with a multi-container setup: a Python/FastAPI backend with WeasyPrint system dependencies, and a React frontend served via nginx with API proxying.

Purpose: Enable one-command deployment and consistent development environment across machines.
Output: Dockerfile for each service, docker-compose.yml, nginx config, .dockerignore
</objective>

<execution_context>
@C:/Users/zhang/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@backend/requirements.txt
@backend/app/config.py
@backend/app/main.py
@backend/app/services/pdf_generator.py
@backend/app/fonts/download_fonts.py
@frontend/package.json
@frontend/vite.config.ts
@.gitignore
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create backend Dockerfile and .dockerignore</name>
  <files>backend/Dockerfile, .dockerignore</files>
  <action>
Create `backend/Dockerfile`:
- Base image: `python:3.12-slim`
- Install WeasyPrint system dependencies via apt-get: `libpango-1.0-0 libpangocairo-1.0-0 libpangoft2-1.0-0 libgdk-pixbuf-2.0-0 libcairo2 libffi-dev libglib2.0-0 libgobject-2.0-0 shared-mime-info fonts-noto-cjk-extra` (NOT the MSYS2 approach used in Windows dev)
- Also install `fonttools` build deps: `gcc` (needed for fontTools instancer during font download)
- Set WORKDIR to `/app`
- Copy `requirements.txt` first, `pip install --no-cache-dir -r requirements.txt` (layer caching)
- Also pip install `fonttools[instancer]` for font download script
- Copy full `backend/app/` directory
- Run `python -m app.fonts.download_fonts` during build to bake fonts into image
- Remove the Windows-specific `os.add_dll_directory` / MSYS2 path logic — it is guarded by `sys.platform == "win32"` so it will simply be skipped on Linux, no code change needed
- Since Linux has system fontconfig, no FONTCONFIG_FILE override is needed (also guarded by win32 check)
- EXPOSE 8000
- CMD: `["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`

Create `.dockerignore` at project root:
```
.planning/
.claude/
.git/
.venv/
venv/
__pycache__/
*.pyc
node_modules/
frontend/dist/
*.tsbuildinfo
.env
.env.local
backend/.venv/
backend/__pycache__/
backend/tests/output/
```
  </action>
  <verify>Run `docker build -t resume-backend ./backend` and confirm it builds without errors. Check that font files exist in the image: `docker run --rm resume-backend ls /app/app/fonts/` should show NotoSansJP-Regular.ttf and NotoSansJP-Bold.ttf.</verify>
  <done>Backend Docker image builds successfully with WeasyPrint deps and CJK fonts baked in.</done>
</task>

<task type="auto">
  <name>Task 2: Create frontend Dockerfile with nginx and docker-compose.yml</name>
  <files>frontend/Dockerfile, frontend/nginx.conf, docker-compose.yml</files>
  <action>
Create `frontend/Dockerfile` as multi-stage build:
- Stage 1 ("build"): `node:22-alpine`
  - WORKDIR `/app`
  - Copy `package.json` and `package-lock.json` (lock file for deterministic builds)
  - Run `npm ci`
  - Copy rest of frontend source
  - Set build-time env `VITE_API_BASE_URL=/api` (empty string — nginx handles proxy)
  - Run `npm run build` — produces `dist/`
- Stage 2 ("serve"): `nginx:alpine`
  - Copy `nginx.conf` to `/etc/nginx/conf.d/default.conf`
  - Copy `--from=build /app/dist` to `/usr/share/nginx/html`
  - EXPOSE 80

Create `frontend/nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # API requests proxy to backend
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 20M;
        proxy_read_timeout 120s;
    }

    # SPA fallback — serve index.html for all non-file routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Create `docker-compose.yml` at project root:
```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    env_file:
      - .env
    environment:
      - PYTHONUNBUFFERED=1
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
```

Note: The .env file at project root should contain `DIFY_EXTRACTION_API_KEY` and `DIFY_TRANSLATION_API_KEY` (and optionally `DIFY_BASE_URL`). These are read by pydantic-settings in the backend container. The .env file itself is NOT copied into images (.dockerignore excludes it); docker-compose passes it via env_file directive.

Also update the backend CORS in `backend/app/main.py` to allow the Docker frontend origin. Add `"http://localhost:3000"` to the `allow_origins` list alongside the existing `"http://localhost:5173"` (Vite dev server).
  </action>
  <verify>Run `docker compose build` to confirm both images build. Then `docker compose up -d` and verify: `curl http://localhost:8000/api/health` returns `{"status":"ok"}`, and `curl -s http://localhost:3000` returns HTML content (the React app). Also test that `curl http://localhost:3000/api/health` proxies through nginx to backend correctly.</verify>
  <done>Full Docker stack starts with `docker compose up --build`. Frontend at :3000 proxies /api to backend at :8000. Backend health endpoint responds through both direct and proxied paths.</done>
</task>

</tasks>

<verification>
1. `docker compose build` completes without errors for both services
2. `docker compose up -d` starts both containers
3. `curl http://localhost:8000/api/health` returns `{"status":"ok"}`
4. `curl http://localhost:3000` returns React app HTML
5. `curl http://localhost:3000/api/health` returns `{"status":"ok"}` (nginx proxy working)
6. Font files present in backend container for PDF generation
</verification>

<success_criteria>
- `docker compose up --build` brings up the full application from a clean state
- Frontend is accessible at http://localhost:3000
- Backend API is accessible at http://localhost:8000 and via proxy at http://localhost:3000/api
- WeasyPrint PDF generation works inside the container (CJK fonts embedded)
- Environment variables for Dify API keys are passed via .env file
</success_criteria>

<output>
After completion, create `.planning/quick/8-docker/8-SUMMARY.md`
</output>

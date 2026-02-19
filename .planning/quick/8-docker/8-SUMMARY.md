---
phase: quick-008
plan: 01
subsystem: infrastructure
tags: [docker, deployment, nginx, containerization]
dependency-graph:
  requires: [backend/requirements.txt, frontend/package.json, backend/app/main.py]
  provides: [docker-compose.yml, backend/Dockerfile, frontend/Dockerfile, frontend/nginx.conf]
  affects: [deployment, development-environment]
tech-stack:
  added: [docker-compose, nginx-alpine, python-3.12-slim, node-22-alpine]
  patterns: [multi-stage-build, reverse-proxy, env-file-injection]
key-files:
  created:
    - backend/Dockerfile
    - backend/.dockerignore
    - frontend/Dockerfile
    - frontend/.dockerignore
    - frontend/nginx.conf
    - docker-compose.yml
    - .dockerignore
  modified:
    - backend/app/main.py
decisions:
  - "python:3.12-slim base with apt-get WeasyPrint deps (not MSYS2 approach)"
  - "Multi-stage frontend build: node:22-alpine -> nginx:alpine"
  - "Nginx reverse proxy for /api/ to backend:8000 with 120s read timeout"
  - "Fonts baked into backend image during build (download_fonts.py runs at build time)"
  - "Environment variables passed via env_file directive, not baked into images"
metrics:
  duration: ~13min
  completed: 2026-02-20
---

# Quick Task 8: Docker Support Summary

Docker containerization with multi-service compose: Python/FastAPI backend with WeasyPrint + CJK fonts, React frontend via nginx reverse proxy, one-command startup.

## What Was Done

### Task 1: Backend Dockerfile and .dockerignore

Created `backend/Dockerfile` using `python:3.12-slim` with all WeasyPrint system dependencies installed via apt-get (libpango, libcairo, libgdk-pixbuf, etc.) plus `fonts-noto-cjk-extra` for CJK rendering. The font download script (`download_fonts.py`) runs during image build to bake Noto Sans JP Regular and Bold into the image. Build dependencies (`gcc`) included for fontTools instancer.

Created `.dockerignore` at project root and `backend/.dockerignore` to exclude .planning, .venv, node_modules, .env, and test output from build contexts.

### Task 2: Frontend Dockerfile, nginx, and docker-compose

Created multi-stage `frontend/Dockerfile`: Stage 1 uses `node:22-alpine` with `npm ci` for deterministic installs and `npm run build` to produce static assets. Stage 2 uses `nginx:alpine` to serve the built files.

Created `frontend/nginx.conf` with:
- `/api/` location proxied to `http://backend:8000` (Docker service networking)
- SPA fallback via `try_files $uri $uri/ /index.html`
- 20M client body size for file uploads, 120s proxy read timeout

Created `docker-compose.yml` orchestrating both services:
- Backend on port 8000 with `.env` file for Dify API keys
- Frontend on port 3000 mapping to nginx port 80
- `depends_on` ensures backend starts before frontend

Updated `backend/app/main.py` CORS to include `http://localhost:3000` alongside existing `http://localhost:5173`.

## Verification Results

All verification checks passed:
1. `docker compose build` -- both images built without errors
2. `docker compose up -d` -- both containers started
3. `curl http://localhost:8000/api/health` -- returned `{"status":"ok"}`
4. `curl http://localhost:3000` -- returned HTTP 200 (React app HTML)
5. `curl http://localhost:3000/api/health` -- returned `{"status":"ok"}` (nginx proxy working)
6. Font files confirmed present in backend container (NotoSansJP-Regular.ttf, NotoSansJP-Bold.ttf)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing functionality] Added service-specific .dockerignore files**
- **Found during:** Task 1 and Task 2
- **Issue:** Root `.dockerignore` does not apply when docker-compose uses `context: ./backend` or `context: ./frontend` -- Docker only reads `.dockerignore` from the build context directory
- **Fix:** Created `backend/.dockerignore` (excludes .venv, __pycache__, test output) and `frontend/.dockerignore` (excludes node_modules, dist)
- **Files created:** backend/.dockerignore, frontend/.dockerignore
- **Commits:** e8b402f, 0b32c06

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | e8b402f | feat(quick-008): add backend Dockerfile and .dockerignore files |
| 2 | 0b32c06 | feat(quick-008): add frontend Dockerfile, nginx config, and docker-compose |

## Self-Check: PASSED

All 7 created files verified on disk. Both task commits (e8b402f, 0b32c06) verified in git log.

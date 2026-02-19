---
phase: quick-009
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/nginx.conf
autonomous: true
must_haves:
  truths:
    - "PDF.js worker .mjs file is served with application/javascript MIME type in Docker"
    - "PDF preview works in Docker without falling back to fake worker"
  artifacts:
    - path: "frontend/nginx.conf"
      provides: "Correct MIME type mapping for .mjs files"
      contains: "application/javascript mjs"
  key_links:
    - from: "frontend/nginx.conf"
      to: "pdf.worker.min.mjs"
      via: "nginx MIME type mapping"
      pattern: "application/javascript.*mjs"
---

<objective>
Fix nginx MIME type for .mjs files so react-pdf's PDF.js worker loads correctly in Docker.

Purpose: The pdf.worker.min.mjs file is served as application/octet-stream by nginx, causing browsers to reject it as a module script. This makes PDF preview fall back to a fake worker (degraded performance) or fail entirely.

Output: Updated nginx.conf with .mjs MIME type mapping.
</objective>

<execution_context>
@C:/Users/zhang/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@frontend/nginx.conf
@frontend/Dockerfile
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add .mjs MIME type to nginx config</name>
  <files>frontend/nginx.conf</files>
  <action>
Add a `types` block inside the server block in `frontend/nginx.conf` that maps .mjs files to `application/javascript`. The `types` block must use the `include` directive to first load the default mime.types (so all other file types still work), then add the .mjs mapping.

Specifically, add this block at the top of the server block (before the location blocks):

```
# Include default MIME types and add .mjs for ES module scripts
include /etc/nginx/mime.types;
types {
    application/javascript mjs;
}
```

This works because when `types` is defined at the server level, it overrides the http-level types. The `include` brings back all defaults, then the `types` block adds .mjs. Note: `include` must be OUTSIDE the `types {}` block, at the same level. The `types` block merges with included types.

Actually, the correct approach for nginx: place `include mime.types;` inside the server block (this re-includes the defaults at server level), then use a separate `types {}` block to add the .mjs mapping. However, nginx `types` directive REPLACES rather than merges. So the proper solution is:

Use a single `types` block that includes mime.types via the include directive inside it, then adds the extra mapping:

```nginx
types {
    include /etc/nginx/mime.types;
    application/javascript mjs;
}
```

Wait -- `include` inside `types {}` is NOT valid nginx syntax.

The CORRECT and simplest fix: Add a `location` block for .mjs files that sets the Content-Type header explicitly:

```nginx
# Fix MIME type for .mjs ES module files (PDF.js worker)
location ~* \.mjs$ {
    types { }
    default_type application/javascript;
}
```

This approach: clears all types for .mjs requests and sets default_type to application/javascript. Simple, targeted, no risk of breaking other MIME types.

Place this location block AFTER the `/api/` location and BEFORE the SPA fallback `location /`.
  </action>
  <verify>
1. Rebuild and run Docker: `docker compose up --build -d`
2. Check MIME type: `curl -sI http://localhost/assets/ | head` -- look for any .mjs file
3. Or open browser DevTools Network tab, load the app, find the pdf.worker.min.mjs request -- Content-Type should be application/javascript
4. PDF preview should load without "fake worker" warning in console
  </verify>
  <done>The .mjs file is served with Content-Type: application/javascript, PDF.js worker loads as a proper module (no fake worker fallback), and PDF preview works in Docker.</done>
</task>

</tasks>

<verification>
- `curl -sI http://localhost/assets/pdf.worker.min-*.mjs` returns Content-Type containing "javascript"
- Browser console shows no "non-JavaScript MIME type" errors
- Browser console shows no "Setting up fake worker" warning
- PDF preview renders correctly in Docker
</verification>

<success_criteria>
PDF.js worker .mjs file served with correct MIME type in Docker nginx, PDF preview works without fake worker fallback.
</success_criteria>

<output>
After completion, create `.planning/quick/9-fix-docker-pdf-worker-mime-type-error-ng/9-SUMMARY.md`
</output>

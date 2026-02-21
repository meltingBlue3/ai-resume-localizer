---
phase: quick
plan: 14
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/components/preview/PreviewPanel.tsx
autonomous: true
requirements: []

must_haves:
  truths:
    - "Preview page shows only one functional scrollbar on the right-side preview area"
    - "User can scroll the resume preview using mouse wheel and scrollbar drag"
    - "Resume content renders fully without clipping"
  artifacts:
    - path: "frontend/src/components/preview/PreviewPanel.tsx"
      provides: "Fixed single-scrollbar preview with auto-sizing iframe"
  key_links:
    - from: "PreviewPanel outer div"
      to: "iframe content"
      via: "iframe auto-height removes inner scrollbar, outer div handles scrolling"
---

<objective>
Fix double scrollbar bug on the Preview & Download page. The right-side resume preview area currently shows two vertical scrollbars — an outer one (functional) and an inner iframe one (non-functional due to pointerEvents: 'none'). After this fix, only the outer scrollbar remains.

Purpose: Eliminate confusing non-functional inner scrollbar that degrades UX.
Output: Updated PreviewPanel.tsx with single-scrollbar behavior.
</objective>

<execution_context>
@C:/Users/zhang/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/zhang/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@frontend/src/components/preview/PreviewPanel.tsx
@frontend/src/steps/PreviewStep.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix double scrollbar by auto-sizing iframe and hiding its overflow</name>
  <files>frontend/src/components/preview/PreviewPanel.tsx</files>
  <action>
The root cause: The iframe renders as a separate document with its own scrollbar. Since `pointerEvents: 'none'` is set, the iframe scrollbar is visible but non-interactive, creating the confusing double scrollbar effect.

Fix approach — make the iframe expand to its full content height so it never needs its own scrollbar:

1. Add a `useCallback` ref handler for the iframe that listens for the iframe's `load` event.

2. On iframe load, read `iframe.contentDocument.documentElement.scrollHeight` to get the full content height. Set the iframe's `style.height` to that value (in px). This makes the iframe tall enough to show all content without its own scrollbar.

3. Add `overflow: hidden` to the iframe's style object (alongside the existing styles) to explicitly suppress any iframe scrollbar.

4. Remove `minHeight: '297mm'` from the iframe style — the dynamic height measurement replaces it. Keep `min-height: 297mm` only as a fallback before the content loads by setting it as initial state (e.g., `const [iframeHeight, setIframeHeight] = useState('297mm')`), then overwrite with the measured height.

5. Use a `useEffect` cleanup to disconnect any observers. Use `useRef` for the iframe element reference.

6. Important: The iframe has `sandbox="allow-same-origin allow-scripts"` which means `contentDocument` is accessible (same-origin). The `allow-same-origin` permission is required for height measurement to work.

7. Also handle the case where HTML content changes (the `html` prop): re-measure height each time the iframe loads new content. The iframe `load` event fires on each `srcDoc` change, so the load handler covers this.

Implementation detail for the iframe onLoad handler:
```tsx
const handleIframeLoad = useCallback((e: React.SyntheticEvent<HTMLIFrameElement>) => {
  const iframe = e.currentTarget;
  try {
    const doc = iframe.contentDocument;
    if (doc) {
      const height = doc.documentElement.scrollHeight;
      setIframeHeight(`${height}px`);
    }
  } catch {
    // Cross-origin fallback — keep default min-height
  }
}, []);
```

Then on the iframe element: `onLoad={handleIframeLoad}` and `style={{ ..., height: iframeHeight, overflow: 'hidden' }}`.
  </action>
  <verify>
Run `cd C:/Users/zhang/Desktop/Projects/FullStack/ai-resume-localizer/frontend && npx tsc --noEmit` to confirm no type errors. Then manually verify in browser: navigate to Preview & Download page — only one scrollbar should appear on the right preview area, and it should be draggable and respond to mouse wheel.
  </verify>
  <done>The preview area shows exactly one scrollbar (the outer container's). The iframe expands to full content height with overflow hidden, eliminating the non-functional inner scrollbar. Resume content renders completely without clipping.</done>
</task>

</tasks>

<verification>
- TypeScript compiles without errors
- Preview page shows single functional scrollbar on right panel
- Both rirekisho and shokumukeirekisho tabs render correctly with single scrollbar
- Scrolling works via mouse wheel and scrollbar drag
- Resume content is not clipped at the bottom
</verification>

<success_criteria>
Only one vertical scrollbar visible in the preview area. The scrollbar is fully functional (drag + wheel). Resume document renders in full without content cutoff.
</success_criteria>

<output>
After completion, create `.planning/quick/14-fix-double-scrollbar-on-preview-page/14-SUMMARY.md`
</output>

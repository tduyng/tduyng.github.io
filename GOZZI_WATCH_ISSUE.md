# 🐛 Gozzi Watch Mode Issue - Template Changes Not Detected

**Version:** `gozzi version 0.0.34-dev-8a8db60`  
**Date:** 2026-01-07  
**Severity:** High - Affects development workflow

---

## Problem Description

When running `gozzi serve`, the watch mode does **not detect changes to template files** in the `templates/` directory. 

This means:
- Changes to `.html` templates require manual server restart
- No auto-reload happens when templates are modified
- Development workflow is significantly slower

---

## Steps to Reproduce

1. Start development server:
   ```bash
   gozzi serve
   # OR
   ./serve.sh
   ```

2. Edit a template file:
   ```bash
   vim templates/note.html
   # Make any change
   ```

3. Save the file

4. **Expected:** Server detects change and rebuilds
5. **Actual:** No rebuild happens, changes not reflected

---

## What DOES Trigger Rebuild

✅ Changes to content files (`.md` in `content/`)
✅ Manual restart of server (Ctrl+C then restart)

## What DOES NOT Trigger Rebuild

❌ Changes to `templates/**/*.html`
❌ Changes to `templates/partials/**/*.html`
❌ Changes to `static/css/main.css` (sometimes)
❌ Changes to `static/js/main.js` (sometimes)

---

## Current Workaround

Manual restart of the server:

```bash
# Stop server
Ctrl+C

# Restart
gozzi serve
# OR
./serve.sh
```

---

## Expected Behavior

The watch mode should monitor and trigger rebuilds for:

1. **Content files** - `content/**/*.md` ✅ (works)
2. **Template files** - `templates/**/*.html` ❌ (broken)
3. **Partial templates** - `templates/partials/**/*.html` ❌ (broken)
4. **Static assets** - `static/**/*` ❌ (unclear)
5. **Config file** - `config.toml` ❌ (unclear)

---

## Suggested Fix

The file watcher should include:

```go
// Pseudo-code for watch paths
watchPaths := []string{
    "content/**/*.md",           // Content
    "templates/**/*.html",        // Templates  ← ADD THIS
    "templates/partials/**/*.html", // Partials ← ADD THIS
    "static/css/**/*.css",        // CSS        ← ADD THIS
    "static/js/**/*.js",          // JS         ← ADD THIS
    "config.toml",                // Config     ← ADD THIS
}
```

---

## Related Issues

This might be related to:
- Template caching without invalidation
- File watcher not configured for templates directory
- Build system only watching content directory

---

## Impact on Development

**High Impact:**
- Every template change requires manual restart (5-10 seconds)
- Breaks flow state during development
- Slows down UI/UX iteration significantly
- Makes template debugging tedious

**Example workflow:**
```
Edit template → Save → Wait... nothing happens → Ctrl+C → Restart → Wait for rebuild → Check browser
```

**Should be:**
```
Edit template → Save → Auto-rebuild → Auto-refresh browser
```

---

## Environment

- **OS:** macOS (Darwin)
- **Gozzi version:** 0.0.34-dev-8a8db60
- **Go version:** (check with `go version`)
- **Project:** tduyng.github.io

---

## Debug Information

### Directory Structure
```
.
├── config.toml
├── content/
│   ├── blog/
│   └── notes/
├── templates/
│   ├── partials/
│   │   ├── _header.html
│   │   ├── _footer.html
│   │   └── _*.html
│   ├── blog.html
│   ├── note.html
│   └── post.html
└── static/
    ├── css/
    ├── js/
    └── img/
```

### Serve Command
```bash
gozzi serve
# OR with full build
gozzi build && gozzi serve
```

---

## Requested Features

1. **Watch all template files**
   - Monitor `templates/**/*.html` for changes
   - Trigger full rebuild on template changes

2. **Watch static assets** (optional but nice)
   - Monitor `static/css/**/*.css`
   - Monitor `static/js/**/*.js`
   - Copy changed files to output without full rebuild

3. **Watch config file**
   - Monitor `config.toml`
   - Trigger full rebuild on config changes

4. **Better rebuild feedback**
   ```
   ✓ Detected change: templates/note.html
   ⚙ Rebuilding...
   ✓ Build complete in 234ms
   ```

---

## Workaround Script

Until this is fixed, here's a workaround script using `fswatch`:

```bash
#!/bin/bash
# watch-templates.sh

fswatch -o templates/ static/ | while read; do
    echo "🔄 Change detected, rebuilding..."
    gozzi build
    echo "✓ Rebuild complete"
done
```

Usage:
```bash
# Terminal 1
./watch-templates.sh

# Terminal 2  
gozzi serve
```

---

## Next Steps

1. **Report to Gozzi repository**
   - Create GitHub issue with this information
   - Link to: https://github.com/tduyng/gozzi/issues

2. **Temporary fix**
   - Use fswatch workaround script
   - Or manually restart on template changes

3. **Long-term fix**
   - Update Gozzi's file watcher to include templates
   - Add configuration for watch paths
   - Implement smart rebuild (only affected pages)

---

*This issue significantly impacts development workflow and should be prioritized.*

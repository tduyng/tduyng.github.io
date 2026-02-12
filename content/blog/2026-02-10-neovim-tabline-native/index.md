+++
title = "Simple Neovim Tab Management"
description = "Replacing bufferline.nvim with Neovim's built-in tabline"
template = "post.html"
date = 2026-02-10
generate_feed = true
tags = ["neovim", "productivity"]
series = "neovim"
series_order = 13

[extra]
comment = true
reaction = true
toc = true
copy = true
outdate_alert = true
outdate_alert_days = 365
img = "/img/dashboard.webp"
+++

I used `bufferline.nvim` for tab switching. It's really nice, but I do not use all features that supports. Neovim already has a built-in `'tabline'` option that can display buffers at the top of the window.

## Demo

![Tabline example](img/tabline.png)

## Configuration

Full file: [tduyng/nvim/lua/config/tabline.lua](https://github.com/tduyng/nvim/lua/config/tabline.lua)

Create `~/.config/nvim/lua/config/tabline.lua`:

```lua
local M = {}

local SEP = ""
local CLOSE = ""
local NO_NAME = "[NO NAME]"

function M.set_highlights()
  vim.api.nvim_set_hl(0, "MyBufInactive", { fg = "#ABB2BF", bg = "#282C34" })
  vim.api.nvim_set_hl(0, "MyBufActive", { fg = "#ECEFF4", bg = "#3E4451", bold = true })
  vim.api.nvim_set_hl(0, "MyBufSeparator", { fg = "#21252B", bg = "#282C34" })
  vim.api.nvim_set_hl(0, "MyBufClose", { fg = "#BF616A", bg = "#3E4451" })
end

local function get_icon(filename, name)
  local ok, devicons = pcall(require, "nvim-web-devicons")
  if not ok or not name or name == "" then
    return ""
  end
  local ext = vim.fn.fnamemodify(name, ":e")
  local icon = devicons.get_icon(filename, ext, { default = true })
  return icon and (icon .. " ") or ""
end

local function get_display_name(path)
  if path == "" then
    return NO_NAME
  end
  local parts = vim.split(path, "/", { plain = true })
  if #parts == 1 then
    return parts[1]
  elseif #parts == 2 then
    return parts[#parts - 1] .. "/" .. parts[#parts]
  else
    return parts[#parts - 2] .. "/" .. parts[#parts - 1] .. "/" .. parts[#parts]
  end
end

local function render_buf(bufnr, current)
  if not vim.api.nvim_buf_is_loaded(bufnr) then
    return ""
  end
  if not vim.bo[bufnr].buflisted then
    return ""
  end

  local name = vim.api.nvim_buf_get_name(bufnr)
  local display_name = get_display_name(name)
  local filename = (name ~= "" and vim.fn.fnamemodify(name, ":t")) or NO_NAME
  local icon = get_icon(filename, name)
  local content = icon .. display_name

  if bufnr == current then
    return table.concat({
      "%#MyBufActive# ",
      content,
      " %#MyBufClose#",
      CLOSE,
      " %#MyBufSeparator#",
      SEP,
    })
  else
    return table.concat({
      "%#MyBufInactive# ",
      content,
      "  %#MyBufSeparator#",
      SEP,
    })
  end
end

function M.tabline()
  local current = vim.api.nvim_get_current_buf()
  local parts = {}

  for _, bufnr in ipairs(vim.api.nvim_list_bufs()) do
    local chunk = render_buf(bufnr, current)
    if chunk ~= "" then
      table.insert(parts, chunk)
    end
  end

  if #parts == 0 then
    return ""
  end
  return table.concat(parts):gsub(vim.pesc(SEP) .. "$", "")
end

function _G.tabline()
  local current = vim.api.nvim_get_current_buf()
  local parts = {}

  for _, bufnr in ipairs(vim.api.nvim_list_bufs()) do
    local chunk = render_buf(bufnr, current)
    if chunk ~= "" then
      table.insert(parts, chunk)
    end
  end

  if #parts == 0 then
    return ""
  end

  local line = table.concat(parts)
  return line:gsub(vim.pesc(SEP) .. "$", "")
end

function M.setup()
  M.set_highlights()

  vim.api.nvim_create_augroup("MyTabline", { clear = true })
  vim.api.nvim_create_autocmd("ColorScheme", {
    group = "MyTabline",
    callback = M.set_highlights,
  })

  vim.opt.showtabline = 2
  vim.opt.tabline = "%!v:lua.tabline()"
end

vim.keymap.set("n", "<leader>bl", function()
  local cur = vim.api.nvim_get_current_buf()
  for _, buf in ipairs(vim.api.nvim_list_bufs()) do
    if vim.api.nvim_buf_is_loaded(buf) and vim.bo[buf].buflisted and buf < cur then
      pcall(vim.api.nvim_buf_delete, buf, { force = true })
    end
  end
end, { desc = "Close all left buffers" })

vim.keymap.set("n", "<leader>br", function()
  local cur = vim.api.nvim_get_current_buf()
  local bufs = vim.api.nvim_list_bufs()
  for i = #bufs, 1, -1 do
    local buf = bufs[i]
    if vim.api.nvim_buf_is_loaded(buf) and vim.bo[buf].buflisted and buf > cur then
      pcall(vim.api.nvim_buf_delete, buf, { force = true })
    end
  end
end, { desc = "Close all right buffers" })

M.setup()
```

## Interesting parts

### Graceful icon fallback

`get_icon()` wraps `require("nvim-web-devicons")` in `pcall`. If devicons isn't installed, it returns an empty string instead of erroring. This makes the tabline work without any icon plugin, while still showing icons when available.

### Path truncation for readability

`get_display_name()` shows at most 3 path components. For a deep path like `src/components/ui/Button.jsx`, it shows `components/ui/Button.jsx`. This keeps the tabline compact while providing context. Full paths would be too long and waste space.

### Active buffer emphasis

Only the current buffer gets the `MyBufActive` highlight (brighter) and a close button (``). All others use dimmer `MyBufInactive`. This creates a clear visual hierarchy.

### Efficient buffer iteration

`tabline()` loops through `vim.api.nvim_list_bufs()` once, calling `render_buf()` for each. `render_buf()` does minimal work: check loaded/listed status, get name, apply truncation, prep icon, wrap in highlight codes. No expensive operations.

### Color scheme adaptation

The `ColorScheme` autocmd re-runs `M.set_highlights()` when you change colorschemes. This ensures highlight groups stay defined and don't get lost when switching themes.

## How to use it

Buffer switching:

- `<Tab>` / `<S-Tab>` – next/previous buffer
- `<leader>bn` / `<leader>bp` – alternative navigation
- Mouse click (if supported)

Close current: `<leader>bd` (snacks.bufdelete or `:bd`)

Cleanup:

- `<leader>bl` – close all left buffers
- `<leader>br` – close all right buffers

## Benefits

- No bufferline plugin needed
- ~100 lines of Lua
- Full control over appearance
- Fast, minimal overhead

## Drawbacks

- No drag-and-drop reordering
- No buffer groups
- Manual color setup

## Customization

Change `SEP` for separators (e.g., `"|"`). Edit `M.set_highlights()` colors. Modify `get_display_name()` to show more/fewer path components.

---

My complete Neovim configuration: https://github.com/tduyng/nvim

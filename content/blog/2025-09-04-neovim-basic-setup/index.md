+++
title = "Part 2: Setting up neovim 0.12 (the core configuration before plugins)"
description = "My complete basic setup keymaps, options, autocmds and diagnostics with Neovim 0.12 without installed plugins yet"
template = "post.html"
date = 2025-09-04
generate_feed = true
tags = ["neovim", "vim", "keymaps"]

[extra]
comment = true
reaction = true
toc = true
copy = true
featured = true
outdate_alert = true
outdate_alert_days = 365
img = "/img/dashboard.webp"

+++

## Prerequisites

- Neovim 0.11+ or higher (0.12 (nightly) recommended for latest features)
- `ripgrep` (`rg`) - For fast file searching (used in grep settings)
- A [Nerd Font](https://www.nerdfonts.com/) - For diagnostic icons and symbols

This config includes macOS-specific keybindings (`Cmd` key combinations)

## Why Neovim 0.12 (nightly)?

I use the nightly version because I want to test new features as soon as they're available. The 0.12 development has some really cool stuff coming, including improved diagnostic line highlighting and better LSP integration. The nightly builds are surprisingly stable. I've been running them for months without issues.

For installation, follow the [Neovim installation guide](https://github.com/neovim/neovim/blob/master/INSTALL.md).

## My configuration structure

Here's exactly how I organize everything (without plugins yet). This modular approach makes the configuration maintainable and easy to understand:

```
~/.config/nvim/
├── init.lua                   # Entry point - loads everything
├── lua/
│   └── config/                # Core configuration modules
│       ├── init.lua           # Orchestrates loading order
│       ├── options.lua        # Neovim behavior settings
│       ├── keymaps.lua        # All keyboard shortcuts
│       ├── diagnostics.lua    # Error/warning appearance
│       └── autocmds.lua       # Automatic behaviors
```

The entry points

`~/.config/nvim/init.lua`:

```lua
-- Entry point for Neovim configuration
require("config")
```

**`~/.config/nvim/lua/config/init.lua`:**

```lua
-- Load all configuration modules
require("config.options")
require("config.keymaps")
require("config.diagnostics")
require("config.autocmds")
```

**NOTES**: Most of my current setup comes from what I learned using [Lazyvim](https://github.com/LazyVim/LazyVim). This gives us the foundation to understand how modern Neovim configurations work.

## options.lua

Create `lua/config/options.lua`. This is where I make Neovim behave the way I want:

```lua
local opt = vim.opt

opt.number = true -- Line numbers
opt.relativenumber = true -- Relative line numbers
opt.cursorline = true -- Highlight current line
opt.wrap = false -- Don't wrap lines
opt.scrolloff = 10 -- Keep 10 lines above/below cursor
opt.sidescrolloff = 8 -- Keep 8 columns left/right of cursor

-- Indentation
opt.tabstop = 2 -- Tab width
opt.shiftwidth = 2 -- Indent width
opt.softtabstop = 2 -- Soft tab stop
opt.expandtab = true -- Use spaces instead of tabs
opt.smartindent = true -- Smart auto-indenting
opt.autoindent = true -- Copy indent from current line

-- Search settings
opt.ignorecase = true -- Case insensitive search
opt.smartcase = true -- Case sensitive if uppercase in search
opt.hlsearch = false -- Don't highlight search results
opt.incsearch = true -- Show matches as you type

-- Visual settings
opt.termguicolors = true -- Enable 24-bit colors
opt.signcolumn = "yes" -- Always show sign column
opt.showmatch = true -- Highlight matching brackets
opt.matchtime = 2 -- How long to show matching bracket
opt.cmdheight = 1 -- Command line height
opt.showmode = false -- Don't show mode in command line
opt.pumheight = 10 -- Popup menu height
opt.pumblend = 10 -- Popup menu transparency
opt.winblend = 0 -- Floating window transparency
opt.completeopt = "menu,menuone,noselect"
opt.conceallevel = 2 -- Hide * markup for bold and italic, but not markers with substitutions
opt.confirm = true -- Confirm to save changes before exiting modified buffer
opt.concealcursor = "" -- Don't hide cursor line markup
opt.synmaxcol = 300 -- Syntax highlighting limit
opt.ruler = false -- Disable the default ruler
opt.virtualedit = "block" -- Allow cursor to move where there is no text in visual block mode
opt.winminwidth = 5 -- Minimum window width

-- File handling
opt.backup = false -- Don't create backup files
opt.writebackup = false -- Don't create backup before writing
opt.swapfile = false -- Don't create swap files
opt.undofile = true -- Persistent undo
opt.undolevels = 10000
opt.undodir = vim.fn.expand("~/.vim/undodir") -- Undo directory
opt.updatetime = 300 -- Faster completion
opt.timeoutlen = vim.g.vscode and 1000 or 300 -- Lower than default (1000) to quickly trigger which-key
opt.ttimeoutlen = 0 -- Key code timeout
opt.autoread = true -- Auto reload files changed outside vim
opt.autowrite = true -- Auto save

-- Behavior settings
opt.hidden = true -- Allow hidden buffers
opt.errorbells = false -- No error bells
opt.backspace = "indent,eol,start" -- Better backspace behavior
opt.autochdir = false -- Don't auto change directory
opt.iskeyword:append("-") -- Treat dash as part of word
opt.path:append("**") -- include subdirectories in search
opt.selection = "exclusive" -- Selection behavior
opt.mouse = "a" -- Enable mouse support
opt.clipboard = vim.env.SSH_TTY and "" or "unnamedplus" -- Sync with system clipboard
opt.modifiable = true -- Allow buffer modifications
opt.encoding = "UTF-8" -- Set encoding

-- Folding settings
opt.smoothscroll = true
vim.wo.foldmethod = "expr"
opt.foldlevel = 99 -- Start with all folds open
opt.formatoptions = "jcroqlnt" -- tcqj
opt.grepformat = "%f:%l:%c:%m"
opt.grepprg = "rg --vimgrep"

-- Split behavior
opt.splitbelow = true -- Horizontal splits go below
opt.splitright = true -- Vertical splits go right
opt.splitkeep = "screen"

-- Command-line completion
opt.wildmenu = true
opt.wildmode = "longest:full,full"
opt.wildignore:append({ "*.o", "*.obj", "*.pyc", "*.class", "*.jar" })

-- Better diff options
opt.diffopt:append("linematch:60")

-- Performance improvements
opt.redrawtime = 10000
opt.maxmempattern = 20000

-- Create undo directory if it doesn't exist
local undodir = vim.fn.expand("~/.vim/undodir")
if vim.fn.isdirectory(undodir) == 0 then
  vim.fn.mkdir(undodir, "p")
end

vim.g.autoformat = true
vim.g.trouble_lualine = true

opt.fillchars = {
  foldopen = "",
  foldclose = "",
  fold = " ",
  foldsep = " ",
  diff = "╱",
  eob = " ",
}

opt.jumpoptions = "view"
opt.laststatus = 3 -- global statusline
opt.list = false
opt.linebreak = true -- Wrap lines at convenient points
opt.list = true -- Show some invisible characters (tabs...
opt.shiftround = true -- Round indent
opt.shiftwidth = 2 -- Size of an indent
opt.shortmess:append({ W = true, I = true, c = true, C = true })

vim.g.markdown_recommended_style = 0

vim.filetype.add({
  extension = {
    env = "dotenv",
  },
  filename = {
    [".env"] = "dotenv",
    ["env"] = "dotenv",
  },
  pattern = {
    ["[jt]sconfig.*.json"] = "jsonc",
    ["%.env%.[%w_.-]+"] = "dotenv",
  },
})
```

Let me walk through the key sections of this configuration:

### Line numbers and navigation

```lua
opt.number = true -- Line numbers
opt.relativenumber = true -- Relative line numbers
opt.cursorline = true -- Highlight current line
opt.scrolloff = 10 -- Keep 10 lines above/below cursor
opt.sidescrolloff = 8 -- Keep 8 columns left/right of cursor
```

The `relativenumber = true` changed how I navigate code. Instead of thinking "I need to go to line 47", I see "that line is 5 down" and just hit `5j`. Way faster.

The `scrolloff = 10` keeps my cursor away from screen edges. I always have context around what I'm editing. Try it - you'll never go back.

### Smart search settings

```lua
opt.ignorecase = true -- Case insensitive search
opt.smartcase = true -- Case sensitive if uppercase in search
opt.hlsearch = false -- Don't highlight search results
```

This combo is genius. Search for "hello" and it finds everything. But search for "Hello" and it only finds exact matches. The `hlsearch = false` stops those annoying yellow highlights after you've found what you need.

### Performance settings

```lua
opt.synmaxcol = 300 -- Syntax highlighting limit
opt.updatetime = 300 -- Faster completion
opt.redrawtime = 10000
opt.maxmempattern = 20000
```

That `synmaxcol = 300` prevents freezes on minified files. The `updatetime = 300` (down from 4000ms default) makes completion and git signs feel instant. These small changes make a huge difference in daily use.

### File handling philosophy

```lua
opt.backup = false -- Don't create backup files
opt.writebackup = false -- Don't create backup before writing
opt.swapfile = false -- Don't create swap files
opt.undofile = true -- Persistent undo
```

I don't want `.swp` and `.bak` files cluttering my projects. Git is my backup system. But persistent undo? That's magic - close Neovim, reopen a file days later, and your undo history is still there.

### Smart clipboard integration

```lua
opt.clipboard = vim.env.SSH_TTY and "" or "unnamedplus" -- Sync with system clipboard
```

This automatically disables system clipboard when I'm SSH'd into a server (prevents weird terminal behavior) but enables it when I'm working locally. It just figures out what I want.

### Visual polish

```lua
opt.fillchars = {
  foldopen = "",
  foldclose = "",
  fold = " ",
  foldsep = " ",
  diff = "╱",
  eob = " ",
}
```

Replace ugly default fold markers with clean Unicode symbols. Makes code look modern instead of like it's from 1985.

### File type detection

```lua
vim.filetype.add({
  extension = {
    env = "dotenv",
  },
  filename = {
    [".env"] = "dotenv",
    ["env"] = "dotenv",
  },
  pattern = {
    ["[jt]sconfig.*.json"] = "jsonc",
    ["%.env%.[%w_.-]+"] = "dotenv",
  },
})
```

This handles modern file types that Neovim doesn't recognize by default. TypeScript configs get proper JSON with comments support, and all those `.env.local`, `.env.production` files get shell syntax highlighting.

## keymaps.lua

Create `lua/config/keymaps.lua`. This is where I make Neovim feel familiar and efficient. Instead of dumping all the keymaps at once, let me organize them by functionality so you can understand what each group does.

### Understanding the leader key

First, understand that `<leader>` is a special prefix key. By default in Neovim, it's the space bar. So when you see `<leader>qq`, that means "Space + q + q".

### Core keymap categories

I organize my keymaps into logical groups:

1. Buffer Navigation - Moving between open files
2. Window Management - Splitting and navigating windows
3. Line Movement - Moving and editing lines efficiently
4. Search & Navigation - Finding and jumping to content
5. Text Editing - Advanced editing operations
6. File Operations - Creating, saving, and managing files
7. Development Tools - Debugging and development helpers

```lua
local map = vim.keymap.set
local opts = { noremap = true, silent = true }

-- ═══════════════════════════════════════════════════════════
-- BUFFER NAVIGATION (think browser tabs)
-- ═══════════════════════════════════════════════════════════

-- Tab/Shift-Tab: Like browser tabs, feels natural
map("n", "<Tab>", ":bnext<CR>", { desc = "Next buffer" })
map("n", "<S-Tab>", ":bprevious<CR>", { desc = "Previous buffer" })

-- Alternative buffer switching (vim-style)
map("n", "<leader>bn", ":bnext<CR>", { desc = "Next buffer" })
map("n", "<leader>bp", ":bprevious<CR>", { desc = "Previous buffer" })
map("n", "<S-h>", "<cmd>bprevious<cr>", { desc = "Prev Buffer" })
map("n", "<S-l>", "<cmd>bnext<cr>", { desc = "Next Buffer" })
map("n", "[b", "<cmd>bprevious<cr>", { desc = "Prev Buffer" })
map("n", "]b", "<cmd>bnext<cr>", { desc = "Next Buffer" })

-- Quick switch to last edited file (super useful!)
map("n", "<leader>bb", "<cmd>e #<cr>", { desc = "Switch to Other Buffer" })
map("n", "<leader>`", "<cmd>e #<cr>", { desc = "Switch to Other Buffer" })

-- ═══════════════════════════════════════════════════════════
-- WINDOW MANAGEMENT (splitting and navigation)
-- ═══════════════════════════════════════════════════════════

-- Move between windows with Ctrl+hjkl (like tmux)
map("n", "<C-h>", "<C-w>h", { desc = "Go to Left Window", remap = true })
map("n", "<C-j>", "<C-w>j", { desc = "Go to Lower Window", remap = true })
map("n", "<C-k>", "<C-w>k", { desc = "Go to Upper Window", remap = true })
map("n", "<C-l>", "<C-w>l", { desc = "Go to Right Window", remap = true })

-- Resize windows with Ctrl+Shift+arrows (macOS friendly)
map("n", "<C-S-Up>", "<cmd>resize +5<CR>", opts)
map("n", "<C-S-Down>", "<cmd>resize -5<CR>", opts)
map("n", "<C-S-Left>", "<cmd>vertical resize -5<CR>", opts)
map("n", "<C-S-Right>", "<cmd>vertical resize +5<CR>", opts)

-- Window splitting
map("n", "<leader>ww", "<C-W>p", { desc = "Other Window", remap = true })
map("n", "<leader>wd", "<C-W>c", { desc = "Delete Window", remap = true })
map("n", "<leader>w-", "<C-W>s", { desc = "Split Window Below", remap = true })
map("n", "<leader>sh", "<C-W>s", { desc = "Split Window Below", remap = true })
map("n", "<leader>w|", "<C-W>v", { desc = "Split Window Right", remap = true })
map("n", "<leader>|", "<C-W>v", { desc = "Split Window Right", remap = true })
map("n", "<leader>sv", "<C-W>v", { desc = "Split Window Right", remap = true })

-- ═══════════════════════════════════════════════════════════
-- SMART LINE MOVEMENT (the VSCode experience)
-- ═══════════════════════════════════════════════════════════

-- Smart j/k: moves by visual lines when no count, real lines with count
map({ "n", "x" }, "j", "v:count == 0 ? 'gj' : 'j'", { desc = "Down", expr = true, silent = true })
map({ "n", "x" }, "<Down>", "v:count == 0 ? 'gj' : 'j'", { desc = "Down", expr = true, silent = true })
map({ "n", "x" }, "k", "v:count == 0 ? 'gk' : 'k'", { desc = "Up", expr = true, silent = true })
map({ "n", "x" }, "<Up>", "v:count == 0 ? 'gk' : 'k'", { desc = "Up", expr = true, silent = true })

-- Move lines up/down (Alt+j/k like VSCode)
map("n", "<A-j>", "<cmd>execute 'move .+' . v:count1<cr>==", { desc = "Move Down" })
map("n", "<A-k>", "<cmd>execute 'move .-' . (v:count1 + 1)<cr>==", { desc = "Move Up" })
map("i", "<A-j>", "<esc><cmd>m .+1<cr>==gi", { desc = "Move Down" })
map("i", "<A-k>", "<esc><cmd>m .-2<cr>==gi", { desc = "Move Up" })
map("v", "<A-j>", ":<C-u>execute \"'<,'>move '>+\" . v:count1<cr>gv=gv", { desc = "Move Down" })
map("v", "<A-k>", ":<C-u>execute \"'<,'>move '<-\" . (v:count1 + 1)<cr>gv=gv", { desc = "Move Up" })

-- Alternative line movement (for terminals that don't support Alt)
map("v", "J", ":move '>+1<CR>gv=gv", { desc = "Move Block Down" })
map("v", "K", ":move '<-2<CR>gv=gv", { desc = "Move Block Up" })
map("n", "<A-Down>", ":m .+1<CR>", opts)
map("n", "<A-Up>", ":m .-2<CR>", opts)
map("i", "<A-Down>", "<Esc>:m .+1<CR>==gi", opts)
map("i", "<A-Up>", "<Esc>:m .-2<CR>==gi", opts)
map("v", "<A-Down>", ":m '>+1<CR>gv=gv", opts)
map("v", "<A-Up>", ":m '<-2<CR>gv=gv", opts)

-- ═══════════════════════════════════════════════════════════
-- SEARCH & NAVIGATION (ergonomic improvements)
-- ═══════════════════════════════════════════════════════════

-- Better line start/end (more comfortable than $ and ^)
map("n", "gl", "$", { desc = "Go to end of line" })
map("n", "gh", "^", { desc = "Go to start of line" })
map("n", "<A-h>", "^", { desc = "Go to start of line", silent = true })
map("n", "<A-l>", "$", { desc = "Go to end of line", silent = true })

-- Select all content
map("n", "==", "gg<S-v>G")
map("n", "<A-a>", "ggVG", { noremap = true, silent = true, desc = "Select all" })

-- Clear search highlighting
map({ "i", "n" }, "<esc>", "<cmd>noh<cr><esc>", { desc = "Escape and Clear hlsearch" })
map("n", "<leader>ur", "<Cmd>nohlsearch<Bar>diffupdate<Bar>normal! <C-L><CR>", { desc = "Redraw / Clear hlsearch / Diff Update" })

-- Smart search navigation (n always goes forward, N always backward)
map("n", "n", "'Nn'[v:searchforward].'zv'", { expr = true, desc = "Next Search Result" })
map("x", "n", "'Nn'[v:searchforward]", { expr = true, desc = "Next Search Result" })
map("o", "n", "'Nn'[v:searchforward]", { expr = true, desc = "Next Search Result" })
map("n", "N", "'nN'[v:searchforward].'zv'", { expr = true, desc = "Prev Search Result" })
map("x", "N", "'nN'[v:searchforward]", { expr = true, desc = "Prev Search Result" })
map("o", "N", "'nN'[v:searchforward]", { expr = true, desc = "Prev Search Result" })

-- ═══════════════════════════════════════════════════════════
-- SMART TEXT EDITING
-- ═══════════════════════════════════════════════════════════

-- Better indenting (stay in visual mode)
map("v", "<", "<gv")
map("v", ">", ">gv")

-- Better paste (doesn't replace clipboard with deleted text)
map("v", "p", '"_dP', opts)

-- Copy whole file to clipboard
map("n", "<C-c>", ":%y+<CR>", opts)

-- Smart undo break-points (create undo points at logical stops)
map("i", ",", ",<c-g>u")
map("i", ".", ".<c-g>u")
map("i", ";", ";<c-g>u")

-- Auto-close pairs (simple, no plugin needed)
map("i", "`", "``<left>")
map("i", '"', '""<left>')
map("i", "(", "()<left>")
map("i", "[", "[]<left>")
map("i", "{", "{}<left>")
map("i", "<", "<><left>")
-- Note: Single quotes commented out to avoid conflicts in some contexts
-- map("i", "'", "''<left>")

-- ═══════════════════════════════════════════════════════════
-- FILE OPERATIONS
-- ═══════════════════════════════════════════════════════════

-- Save file (works in all modes)
map({ "i", "x", "n", "s" }, "<C-s>", "<cmd>w<cr><esc>", { desc = "Save File" })

-- Create new file
map("n", "<leader>fn", "<cmd>enew<cr>", { desc = "New File" })

-- Quit operations
map("n", "<leader>qq", "<cmd>qa<cr>", { desc = "Quit All" })

-- ═══════════════════════════════════════════════════════════
-- DEVELOPMENT TOOLS
-- ═══════════════════════════════════════════════════════════

-- Commenting (add comment above/below current line)
map("n", "gco", "o<esc>Vcx<esc><cmd>normal gcc<cr>fxa<bs>", { desc = "Add Comment Below" })
map("n", "gcO", "O<esc>Vcx<esc><cmd>normal gcc<cr>fxa<bs>", { desc = "Add Comment Above" })

-- Quickfix and location lists
map("n", "<leader>xl", function()
  local success, err = pcall(vim.fn.getloclist(0, { winid = 0 }).winid ~= 0 and vim.cmd.lclose or vim.cmd.lopen)
  if not success and err then
    vim.notify(err, vim.log.levels.ERROR)
  end
end, { desc = "Location List" })

map("n", "<leader>xq", function()
  local success, err = pcall(vim.fn.getqflist({ winid = 0 }).winid ~= 0 and vim.cmd.cclose or vim.cmd.copen)
  if not success and err then
    vim.notify(err, vim.log.levels.ERROR)
  end
end, { desc = "Quickfix List" })

map("n", "[q", vim.cmd.cprev, { desc = "Previous Quickfix" })
map("n", "]q", vim.cmd.cnext, { desc = "Next Quickfix" })

-- Inspection tools (useful for debugging highlights and treesitter)
map("n", "<leader>ui", vim.show_pos, { desc = "Inspect Pos" })
map("n", "<leader>uI", "<cmd>InspectTree<cr>", { desc = "Inspect Tree" })

-- Keyword program (K for help on word under cursor)
map("n", "<leader>K", "<cmd>norm! K<cr>", { desc = "Keywordprg" })

-- ═══════════════════════════════════════════════════════════
-- TERMINAL INTEGRATION
-- ═══════════════════════════════════════════════════════════

-- Terminal mode navigation
map("t", "<esc><esc>", "<c-\\><c-n>", { desc = "Enter Normal Mode" })
map("t", "<C-h>", "<cmd>wincmd h<cr>", { desc = "Go to Left Window" })
map("t", "<C-j>", "<cmd>wincmd j<cr>", { desc = "Go to Lower Window" })
map("t", "<C-k>", "<cmd>wincmd k<cr>", { desc = "Go to Upper Window" })
map("t", "<C-l>", "<cmd>wincmd l<cr>", { desc = "Go to Right Window" })
map("t", "<C-/>", "<cmd>close<cr>", { desc = "Hide Terminal" })
map("t", "<c-_>", "<cmd>close<cr>", { desc = "which_key_ignore" })

-- ═══════════════════════════════════════════════════════════
-- TAB MANAGEMENT (when you need multiple workspaces)
-- ═══════════════════════════════════════════════════════════

map("n", "<leader><tab>l", "<cmd>tablast<cr>", { desc = "Last Tab" })
map("n", "<leader><tab>o", "<cmd>tabonly<cr>", { desc = "Close Other Tabs" })
map("n", "<leader><tab>f", "<cmd>tabfirst<cr>", { desc = "First Tab" })
map("n", "<leader><tab><tab>", "<cmd>tabnew<cr>", { desc = "New Tab" })
map("n", "<leader><tab>]", "<cmd>tabnext<cr>", { desc = "Next Tab" })
map("n", "<leader><tab>d", "<cmd>tabclose<cr>", { desc = "Close Tab" })
map("n", "<leader><tab>[", "<cmd>tabprevious<cr>", { desc = "Previous Tab" })

-- ═══════════════════════════════════════════════════════════
-- FOLDING NAVIGATION (for code organization)
-- ═══════════════════════════════════════════════════════════

-- Close all folds except current one (great for focus)
map("n", "zv", "zMzvzz", { desc = "Close all folds except the current one" })

-- Smart fold navigation (closes current, opens next/previous)
map("n", "zj", "zcjzOzz", { desc = "Close current fold when open. Always open next fold." })
map("n", "zk", "zckzOzz", { desc = "Close current fold when open. Always open previous fold." })

-- ═══════════════════════════════════════════════════════════
-- UTILITY SHORTCUTS
-- ═══════════════════════════════════════════════════════════

-- Toggle line wrapping
map("n", "<leader>tw", "<cmd>set wrap!<CR>", { desc = "Toggle Wrap", silent = true })

-- Fix spelling (picks first suggestion)
map("n", "z0", "1z=", { desc = "Fix word under cursor" })
```

Let me explain the cool parts:

### Browser style buffer navigation

```lua
-- Tab switching
map("n", "<Tab>", ":bnext<CR>", { desc = "Next buffer" })
map("n", "<S-Tab>", ":bprevious<CR>", { desc = "Previous buffer" })
map("n", "<leader>bb", "<cmd>e #<cr>", { desc = "Switch to Other Buffer" })
```

Tab/Shift-Tab feels like browser tabs. Everyone knows this pattern. The `<leader>bb` is really interesting shortcut, instantly jumps back to the last file I was editing. Super useful when switching between test files and implementation.

### Smart line movement

```lua
-- Better up/down
map({ "n", "x" }, "j", "v:count == 0 ? 'gj' : 'j'", { desc = "Down", expr = true, silent = true })
map({ "n", "x" }, "k", "v:count == 0 ? 'gk' : 'k'", { desc = "Up", expr = true, silent = true })
```

This fixes Vim's annoying behavior with wrapped lines. When I press `j`, it moves down visually. But when I press `5j`, it moves 5 actual lines. I get both behaviors automatically.

### VSCode style line movement

```lua
-- Move Lines
map("n", "<A-j>", "<cmd>execute 'move .+' . v:count1<cr>==", { desc = "Move Down" })
map("n", "<A-k>", "<cmd>execute 'move .-' . (v:count1 + 1)<cr>==", { desc = "Move Up" })
map("v", "<A-j>", ":<C-u>execute \"'<,'>move '>+\" . v:count1<cr>gv=gv", { desc = "Move Down" })
map("v", "<A-k>", ":<C-u>execute \"'<,'>move '<-\" . (v:count1 + 1)<cr>gv=gv", { desc = "Move Up" })
```

`Alt+j/k` moves lines just like VSCode. The magic is in the details:

- Works with counts (`3Alt+j` moves 3 lines)
- Auto-indents after moving (`==`)
- In visual mode, moves the whole selection and keeps it selected
- Works in insert mode too

### Ergonomic shortcuts

```lua
-- Goto
map("n", "gl", "$", { desc = "Go to end of line" })
map("n", "gh", "^", { desc = "Go to start of line" })
```

`$` and `^` are painful to reach. `gl` (go line-end) and `gh` (go home) are much more comfortable. After using these for a few days, going back to `$` feels clunky. (Here is that I learned from Helix)

### Intelligent search

```lua
map("n", "n", "'Nn'[v:searchforward].'zv'", { expr = true, desc = "Next Search Result" })
map("n", "N", "'nN'[v:searchforward].'zv'", { expr = true, desc = "Prev Search Result" })
```

This fixes Vim's confusing search behavior. `n` always goes forward in your search direction, `N` always goes backward. The `.'zv'` opens folds if the match is hidden. Much more intuitive.

### Undo break points (really useful)

```lua
-- Add undo break-points
map("i", ",", ",<c-g>u")
map("i", ".", ".<c-g>u")
map("i", ";", ";<c-g>u")
```

This changed how I edit text. Without this, typing a long paragraph and hitting `u` undoes everything. With break-points, `u` goes back to natural stopping places. Type "Hello, world. How are you;" and `u` takes you back to "Hello, world. How are you" instead of deleting everything.

### Smart auto-pairs (no plugin!)

```lua
-- auto close pairs
-- map("i", "'", "''<left>") -- commented out - smart!
map("i", "`", "``<left>")
map("i", '"', '""<left>')
map("i", "(", "()<left>")
map("i", "[", "[]<left>")
map("i", "{", "{}<left>")
map("i", "<", "<><left>")
```

I spent way too much time fighting with auto-pair plugins. This simple approach just works:

- No plugin overhead
- No weird edge cases
- Covers 95% of use cases with zero complexity

### Visual mode improvements

```lua
-- Better paste
map("v", "p", '"_dP', opts)

-- better indenting
map("v", "<", "<gv")
map("v", ">", ">gv")
```

The paste improvement is huge, when you paste over selected text, it doesn't replace your clipboard with the deleted text. So you can paste the same thing multiple times.

The indenting keeps you in visual mode, so you can adjust indentation multiple times without reselecting.

### Folding navigation

```lua
-- Close all fold except the current one.
map("n", "zv", "zMzvzz", {
  desc = "Close all folds except the current one",
})

-- Close current fold when open. Always open next fold.
map("n", "zj", "zcjzOzz", {
  desc = "Close current fold when open. Always open next fold.",
})
```

These make folding actually useful. `zv` gives me focus, closes everything except what I'm working on. `zj`/`zk` navigate through functions while managing fold state automatically.

## My diagnostics configuration

Create `lua/config/diagnostics.lua`. This makes errors look better

```lua
--- diagnostic settings
local map = vim.keymap.set

local palette = {
  err = "#51202A",
  warn = "#3B3B1B",
  info = "#1F3342",
  hint = "#1E2E1E",
}

vim.api.nvim_set_hl(0, "DiagnosticErrorLine", { bg = palette.err, blend = 20 })
vim.api.nvim_set_hl(0, "DiagnosticWarnLine", { bg = palette.warn, blend = 15 })
vim.api.nvim_set_hl(0, "DiagnosticInfoLine", { bg = palette.info, blend = 10 })
vim.api.nvim_set_hl(0, "DiagnosticHintLine", { bg = palette.hint, blend = 10 })

vim.api.nvim_set_hl(0, "DapBreakpointSign", { fg = "#FF0000", bg = nil, bold = true })
vim.fn.sign_define("DapBreakpoint", {
  text = "●", -- a large dot; change as desired
  texthl = "DapBreakpointSign", -- the highlight group you just defined
  linehl = "", -- no full-line highlight
  numhl = "", -- no number-column highlight
})

local sev = vim.diagnostic.severity

vim.diagnostic.config({
  -- keep underline & severity_sort on for quick scanning
  underline = true,
  severity_sort = true,
  update_in_insert = false, -- less flicker
  float = {
    border = "rounded",
    source = true,
  },
  -- keep signs & virtual text, but tune them as you like
  signs = {
    text = {
      [sev.ERROR] = " ",
      [sev.WARN] = " ",
      [sev.INFO] = " ",
      [sev.HINT] = "󰌵 ",
    },
  },
  virtual_text = {
    spacing = 4,
    source = "if_many",
    prefix = "●",
  },
  -- NEW in 0.11 — dim whole line
  linehl = {
    [sev.ERROR] = "DiagnosticErrorLine",
    [sev.WARN] = "DiagnosticWarnLine",
    [sev.INFO] = "DiagnosticInfoLine",
    [sev.HINT] = "DiagnosticHintLine",
  },
})

-- diagnostic keymaps
local diagnostic_goto = function(next, severity)
  severity = severity and vim.diagnostic.severity[severity] or nil
  return function()
    vim.diagnostic.jump({ count = next and 1 or -1, float = true, severity = severity })
  end
end

map("n", "<leader>cd", vim.diagnostic.open_float, { desc = "Line Diagnostics" })
map("n", "]d", diagnostic_goto(true), { desc = "Next Diagnostic" })
map("n", "[d", diagnostic_goto(false), { desc = "Prev Diagnostic" })
map("n", "]e", diagnostic_goto(true, "ERROR"), { desc = "Next Error" })
map("n", "[e", diagnostic_goto(false, "ERROR"), { desc = "Prev Error" })
map("n", "]w", diagnostic_goto(true, "WARN"), { desc = "Next Warning" })
map("n", "[w", diagnostic_goto(false, "WARN"), { desc = "Prev Warning" })
```

### The color philosophy

Those color values aren't random. I spent time finding colors that indicate problems without screaming at me. Default red error backgrounds hurt my eyes during long coding sessions. These subtle colors are visible but not harsh.

### Modern diagnostic features

The `linehl` feature is new in Neovim 0.11+. It highlights entire lines with problems, making errors much easier to spot when scanning large files. Way better than just highlighting the problematic text.

### Smart navigation

```lua
local diagnostic_goto = function(next, severity)
  severity = severity and vim.diagnostic.severity[severity] or nil
  return function()
    vim.diagnostic.jump({ count = next and 1 or -1, float = true, severity = severity })
  end
end
```

This creates separate navigation for errors vs warnings. When fixing bugs, I want to see errors first (`]e`/`[e`), then deal with warnings later (`]w`/`[w`). The floating window shows details without cluttering the screen.

### Debugging integration

```lua
vim.fn.sign_define("DapBreakpoint", {
  text = "●", -- a large dot
  texthl = "DapBreakpointSign",
})
```

I set up debugging breakpoint appearance here since it uses the same sign column as diagnostics. The red dot is clear and better looking.

## My complete autocmds setup

Create `lua/config/autocmds.lua`. These automatic behaviors save me tons of time:

```lua
local function augroup(name)
  return vim.api.nvim_create_augroup("user_" .. name, { clear = true })
end

-- Check if we need to reload the file when it changed
vim.api.nvim_create_autocmd({ "FocusGained", "TermClose", "TermLeave" }, {
  group = augroup("checktime"),
  callback = function()
    if vim.o.buftype ~= "nofile" then
      vim.cmd("checktime")
    end
  end,
})

-- Highlight on yank
vim.api.nvim_create_autocmd("TextYankPost", {
  group = augroup("highlight_yank"),
  callback = function()
    (vim.hl or vim.highlight).on_yank()
  end,
})

-- resize splits if window got resized
vim.api.nvim_create_autocmd({ "VimResized" }, {
  group = augroup("resize_splits"),
  callback = function()
    local current_tab = vim.fn.tabpagenr()
    vim.cmd("tabdo wincmd =")
    vim.cmd("tabnext " .. current_tab)
  end,
})


-- make it easier to close man-files when opened inline
vim.api.nvim_create_autocmd("FileType", {
  group = augroup("man_unlisted"),
  pattern = { "man" },
  callback = function(event)
    vim.bo[event.buf].buflisted = false
  end,
})

-- close some filetypes with <q>
vim.api.nvim_create_autocmd("FileType", {
  group = augroup("close_with_q"),
  pattern = {
    "PlenaryTestPopup",
    "checkhealth",
    "dbout",
    "gitsigns-blame",
    "grug-far",
    "help",
    "lspinfo",
    "neotest-output",
    "neotest-output-panel",
    "neotest-summary",
    "notify",
    "qf",
    "spectre_panel",
    "startuptime",
    "tsplayground",
  },
  callback = function(event)
    vim.bo[event.buf].buflisted = false
    vim.schedule(function()
      vim.keymap.set("n", "q", function()
        vim.cmd("close")
        pcall(vim.api.nvim_buf_delete, event.buf, { force = true })
      end, {
        buffer = event.buf,
        silent = true,
        desc = "Quit buffer",
      })
    end)
  end,
})

-- wrap and check for spell in text filetypes
vim.api.nvim_create_autocmd("FileType", {
  group = augroup("wrap_spell"),
  pattern = { "text", "plaintex", "typst", "gitcommit", "markdown" },
  callback = function()
    vim.opt_local.wrap = true
    vim.opt_local.spell = true
  end,
})

-- Fix conceallevel for json files
vim.api.nvim_create_autocmd({ "FileType" }, {
  group = augroup("json_conceal"),
  pattern = { "json", "jsonc", "json5" },
  callback = function()
    vim.opt_local.conceallevel = 0
  end,
})

-- Auto create dir when saving a file, in case some intermediate directory does not exist
vim.api.nvim_create_autocmd({ "BufWritePre" }, {
  group = augroup("auto_create_dir"),
  callback = function(event)
    if event.match:match("^%w%w+:[\/][\/]") then
      return
    end
    local file = vim.uv.fs_realpath(event.match) or event.match
    vim.fn.mkdir(vim.fn.fnamemodify(file, ":p:h"), "p")
  end,
})

-- Set filetype for .env and .env.* files
vim.api.nvim_create_autocmd({ "BufRead", "BufNewFile" }, {
  group = augroup("env_filetype"),
  pattern = { "*.env", ".env.*" },
  callback = function()
    vim.opt_local.filetype = "sh"
  end,
})

-- Set filetype for .toml files
vim.api.nvim_create_autocmd({ "BufRead", "BufNewFile" }, {
  group = augroup("toml_filetype"),
  pattern = { "*.tomg-config*" },
  callback = function()
    vim.opt_local.filetype = "toml"
  end,
})

-- Set filetype for .ejs files
vim.api.nvim_create_autocmd({ "BufRead", "BufNewFile" }, {
  group = augroup("ejs_filetype"),
  pattern = { "*.ejs", "*.ejs.t" },
  callback = function()
    vim.opt_local.filetype = "embedded_template"
  end,
})

-- Set filetype for .code-snippets files
vim.api.nvim_create_autocmd({ "BufRead", "BufNewFile" }, {
  group = augroup("code_snippets_filetype"),
  pattern = { "*.code-snippets" },
  callback = function()
    vim.opt_local.filetype = "json"
  end,
})

```

Let me explain the interesting parts:

### Visual yank

```lua
-- Highlight on yank
vim.api.nvim_create_autocmd("TextYankPost", {
  callback = function()
    (vim.hl or vim.highlight).on_yank()
  end,
})
```

This briefly highlights whatever I yank (copy). Great visual feedback - I know exactly what I copied. Simple but really helpful during refactoring.

### "It just works" file handling

```lua
-- Auto create dir when saving a file
vim.api.nvim_create_autocmd({ "BufWritePre" }, {
  callback = function(event)
    local file = vim.uv.fs_realpath(event.match) or event.match
    vim.fn.mkdir(vim.fn.fnamemodify(file, ":p:h"), "p")
  end,
})
```

Try creating `src/api/index.js` when the folders don't exist. Instead of an error, it creates the directory structure automatically. This removes friction from my workflow.

### Smart cursor memory

```lua
-- go to last loc when opening a buffer
vim.api.nvim_create_autocmd("BufReadPost", {
  callback = function(event)
    local exclude = { "gitcommit" } -- don't remember position in commit messages
    local mark = vim.api.nvim_buf_get_mark(event.buf, '"')
    local lcount = vim.api.nvim_buf_line_count(event.buf)
    if mark[1] > 0 and mark[1] <= lcount then
      pcall(vim.api.nvim_win_set_cursor, 0, mark)
    end
  end,
})
```

Reopen any file and the cursor goes back to where I left off. Except git commit messages, those should always start at the top. Small detail that saves time every day.

### Context aware settings

```lua
-- wrap and check for spell in text filetypes
vim.api.nvim_create_autocmd("FileType", {
  pattern = { "text", "markdown", "gitcommit" },
  callback = function()
    vim.opt_local.wrap = true
    vim.opt_local.spell = true
  end,
})
```

Writing files get spell check and word wrap. Code files don't. Simple context awareness that makes each file type feel right.

### Smart buffer management

```lua
-- close some filetypes with <q>
vim.api.nvim_create_autocmd("FileType", {
  pattern = {
    "help", "lspinfo", "checkhealth", "qf", "grug-far"
  },
  callback = function(event)
    vim.keymap.set("n", "q", function()
      vim.cmd("close")
    end, { buffer = event.buf, silent = true })
  end,
})
```

Help windows, quickfix lists, and plugin windows can be closed with just `q`. I don't have to remember different commands for different buffer types. Notice I included "grug-far", I thought about which plugin buffers should be easy to close.

All this setup is already more pleasant than default Neovim or many bloated configurations.

In the next article, we'll set up native LSP support. All the diagnostic configuration we just created will light up with real language intelligence.

---

My complete Neovim configuration: [https://github.com/tduyng/nvim](https://github.com/tduyng/nvim)

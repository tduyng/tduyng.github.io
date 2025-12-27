+++
title = "Neovim syntax highlighting with Tree-sitter"
description = "Learn about Tree-sitter. The modern parser that changed how we understand code, not just in Neovim but everywhere"
template = "post.html"
date = 2025-11-26
generate_feed = true
aliases = ["/blog/neovim-treesitter", "/blog/treesitter-highlight"]
tags = ["neovim", "theme", "treesitter", "syntax-highlighting"]
series = "neovim"
series_order = 5

[extra]
comment = true
reaction = true
toc = true
copy = true
outdate_alert = true
outdate_alert_days = 365
img = "/img/dashboard.webp"
+++

Today we talk about syntax highlighting and Tree-sitter. But this is not just about Neovim. Tree-sitter is important for many tools.

## Why syntax highlighting?

I always loved colors when coding. Good syntax highlighting makes coding more fun and easier on your eyes. It helps you code faster and work more comfortably.

In Neovim, there are 2 things that make syntax highlighting work correctly: Tree-sitter and your theme.

## What is Tree-sitter?

Tree-sitter is a tool that reads your code and understands its structure. Think of it like this:

Old syntax highlighting uses **regex** (pattern matching). It sees `function` and colors it. But it doesn't know what a function actually is. Just matches the word.

Tree-sitter uses a **parser**. It knows what a function is. It knows where the function starts, where it ends, what are the parameters, what's inside the body. Real understanding.

## Why Tree-sitter is fast

- It only re-parses what changed. When you edit a function, Tree-sitter only re-parses that function. Other functions stay untouched. This is why it's fast enough to run on every keystroke.
- It handles broken code. While you're typing, your code is often broken. Tree-sitter marks the error but keeps going. You still get highlighting for the rest of your file.
- It keeps everything. Tree-sitter builds a complete tree. It keeps whitespace, comments, parentheses - everything. Other parsers throw away "unimportant" stuff. But editors need everything for formatting, folding, and refactoring.

Tree-sitter is used in many tools and almost every modern IDE now. Not just Neovim. It became the standard for code tools. Like how LLVM became the standard for compilers.

## How Tree-sitter understands code

Let me show you an example:

```javascript
function hello(name) {
    console.log(name)
    return name
}

const result = hello('world')
```

**Tree-sitter builds this tree:**

```
program
├── function_declaration
│   ├── function (keyword)
│   ├── hello (identifier)
│   ├── ( (punctuation)
│   ├── parameters
│   │   └── name (parameter)
│   ├── ) (punctuation)
│   └── block
│       ├── expression_statement
│       │   └── call_expression
│       │       ├── console.log (member_expression)
│       │       └── name (identifier)
│       └── return_statement
│           └── name (identifier)
└── variable_declaration
    ├── const (keyword)
    ├── result (identifier)
    └── call_expression
        ├── hello (identifier)
        └── "world" (string)
```

Now syntax highlighter can:

- Color `function` keyword differently
- Color `hello` in function declaration differently from `hello` in call
- Know that `name` in parameters is parameter, not variable
- Understand structure of entire code

This is why Tree-sitter highlighting looks better. It understands your code.

## Setup in Neovim

Now let's use Tree-sitter in Neovim. You need two things:

1. **A theme** - provides the colors
2. **Tree-sitter** - understands the code structure

The theme uses Tree-sitter's understanding to color your code correctly. That's why you need both.

### Pick a theme first

There are many themes to choose from: Catppuccin, Dracula, Gruvbox, Nord, Kanagawa, Rose Pine. Normally, all of them support treesitter syntax.
You can find many themes [here](https://dotfyle.com/neovim/colorscheme/top). I'm sure you already have your favorite. I won't suggest which one to use. Here's an example of how to setup TokyoNight with vim.pack:

```lua
-- lua/plugins/theme.lua
vim.pack.add("https://github.com/folke/tokyonight.nvim")

require("tokyonight").setup({
	style = "night",
	transparent = true,
})

vim.cmd("colorscheme tokyonight")
```

That's it! With the plugin setup from previous articles, this should work correctly after you restart Neovim.

## Tree-sitter in Neovim

The nvim-treesitter plugin recently made a big change:

- Created `main` branch, rewrite completely with new API (for Neovim 0.10+)
- Froze `master` branch - no more updates there (old API)

Many tutorials still use `master` branch. That is deprecated. We will use the latest: `main` branch (which is now the default).

Here's my complete setup. Code first, explanations after:

**File: `lua/plugins/treesitter.lua`**

```lua
vim.pack.add({
	{
		src = "https://github.com/nvim-treesitter/nvim-treesitter",
		version = "main",
	},
	{
		src = "https://github.com/nvim-treesitter/nvim-treesitter-textobjects",
		version = "main",
	},
})

require("nvim-treesitter").setup({})
require("nvim-treesitter").install({
	"bash",
	"blade",
	"c",
	"comment",
	"css",
	"diff",
	"dockerfile",
	"fish",
	"gitcommit",
	"gitignore",
	"go",
	"gomod",
	"gosum",
	"gowork",
	"html",
	"ini",
	"javascript",
	"jsdoc",
	"json",
	"jsonc",
	"lua",
	"luadoc",
	"luap",
	"make",
	"markdown",
	"markdown_inline",
	"nginx",
	"nix",
	"proto",
	"python",
	"query",
	"regex",
	"rust",
	"scss",
	"sql",
	"terraform",
	"toml",
	"tsx",
	"typescript",
	"vim",
	"vimdoc",
	"xml",
	"yaml",
	"zig",
})

require("nvim-treesitter-textobjects").setup({
	select = {
		enable = true,
		lookahead = true,
		selection_modes = {
			["@parameter.outer"] = "v", -- charwise
			["@function.outer"] = "V", -- linewise
			["@class.outer"] = "<c-v>", -- blockwise
		},
		include_surrounding_whitespace = false,
	},
	move = {
		enable = true,
		set_jumps = true,
	},
})

-- SELECT keymaps
local sel = require("nvim-treesitter-textobjects.select")
for _, map in ipairs({
	{ { "x", "o" }, "af", "@function.outer" },
	{ { "x", "o" }, "if", "@function.inner" },
	{ { "x", "o" }, "ac", "@class.outer" },
	{ { "x", "o" }, "ic", "@class.inner" },
	{ { "x", "o" }, "aa", "@parameter.outer" },
	{ { "x", "o" }, "ia", "@parameter.inner" },
	{ { "x", "o" }, "ad", "@comment.outer" },
	{ { "x", "o" }, "as", "@statement.outer" },
}) do
	vim.keymap.set(map[1], map[2], function()
		sel.select_textobject(map[3], "textobjects")
	end, { desc = "Select " .. map[3] })
end

-- MOVE keymaps
local mv = require("nvim-treesitter-textobjects.move")
for _, map in ipairs({
	{ { "n", "x", "o" }, "]m", mv.goto_next_start, "@function.outer" },
	{ { "n", "x", "o" }, "[m", mv.goto_previous_start, "@function.outer" },
	{ { "n", "x", "o" }, "]]", mv.goto_next_start, "@class.outer" },
	{ { "n", "x", "o" }, "[[", mv.goto_previous_start, "@class.outer" },
	{ { "n", "x", "o" }, "]M", mv.goto_next_end, "@function.outer" },
	{ { "n", "x", "o" }, "[M", mv.goto_previous_end, "@function.outer" },
	{ { "n", "x", "o" }, "]o", mv.goto_next_start, { "@loop.inner", "@loop.outer" } },
	{ { "n", "x", "o" }, "[o", mv.goto_previous_start, { "@loop.inner", "@loop.outer" } },
}) do
	local modes, lhs, fn, query = map[1], map[2], map[3], map[4]
	-- build a human-readable desc
	local qstr = (type(query) == "table") and table.concat(query, ",") or query
	vim.keymap.set(modes, lhs, function()
		fn(query, "textobjects")
	end, { desc = "Move to " .. qstr })
end

vim.api.nvim_create_autocmd("PackChanged", {
	desc = "Handle nvim-treesitter updates",
	group = vim.api.nvim_create_augroup("nvim-treesitter-pack-changed-update-handler", { clear = true }),
	callback = function(event)
		if event.data.kind == "update" then
			local ok = pcall(vim.cmd, "TSUpdate")
			if ok then
				vim.notify("TSUpdate completed successfully!", vim.log.levels.INFO)
			else
				vim.notify("TSUpdate command not available yet, skipping", vim.log.levels.WARN)
			end
		end
	end,
})

vim.wo.foldexpr = "v:lua.vim.treesitter.foldexpr()"
vim.bo.indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"

vim.api.nvim_create_autocmd("FileType", {
	pattern = { "*" },
	callback = function()
		local filetype = vim.bo.filetype
		if filetype and filetype ~= "" then
			local success = pcall(function()
				vim.treesitter.start()
			end)
			if not success then
				return
			end
		end
	end,
})

```

Let me explain what each part does.

### Installing the plugins from main version

```lua
vim.pack.add({
	{
		src = "https://github.com/nvim-treesitter/nvim-treesitter",
		version = "main",
	},
	{
		src = "https://github.com/nvim-treesitter/nvim-treesitter-textobjects",
		version = "main",
	},
})

```

This uses Neovim's native package manager (added in 0.12+). It installs two plugins:

**nvim-treesitter** - This wraps Neovim's built-in Tree-sitter core. This plugin makes it easy by providing:

- Simple setup command
- Parser installation (`install()`)
- Query management
- Nice defaults

**Note:** You need to install [tree-sitter-cli](https://github.com/tree-sitter/tree-sitter/blob/master/crates/cli/README.md) to use this plugin.

**nvim-treesitter-textobjects** - This adds smart text objects. This is where Tree-sitter becomes powerful. Made by same team as nvim-treesitter.

### Setup Tree-sitter

```lua
require("nvim-treesitter").setup({})
```

Empty setup uses good defaults. That's all most people need.

What this does behind the scenes:

- Enables syntax highlighting from Tree-sitter
- Sets up parser loading
- Configures queries for your languages
- Prepares text object support

### Install language parsers

```lua
require("nvim-treesitter").install({
	"lua",
	"javascript",
	-- ... more languages
})
```

The first time takes a few seconds. After that, parsers are ready. Neovim loads them automatically when you open files.

Pick only the languages you actually use. Don't install everything. Each parser takes disk space and a bit of memory.

### Text objects

Neovim already supports basic text objects like `ciw`, `ci{`, `da{`, etc. Text objects let you select or operate on chunks of text:

- `iw` - inside word
- `i"` - inside quotes
- `i(` - inside parentheses

These work with operators like `d` (delete), `c` (change), `y` (yank/copy), `v` (visual select).

**nvim-treesitter-textobjects adds structure-aware text objects:**

- `if` - inside function body
- `af` - around function (including signature)
- `ic` - inside class body
- `ac` - around class (including declaration)
- `ia` - inside parameter
- `aa` - around parameter

This makes it much easier to work with functions, classes, and parameters. If you only need basic text objects for words, quotes, and parentheses, you don't need to install this plugin.

The plugin uses Tree-sitter's syntax tree to find code structures. It knows where functions start and end, where classes are, where parameters are. All based on actual code structure, not regex patterns.

**How to use them:**

- `vaf` - select entire function
- `dif` - delete function body
- `cic` - change class body
- `via` - select parameter
- `yaa` - yank (copy) parameter with commas

This works in **all languages**. Same keymaps for JavaScript, Python, Go, Rust, TypeScript, everything Tree-sitter supports.

**Example in JavaScript:**

```javascript
function hello(name, age) {
    console.log(name)
    return name
}
```

Cursor anywhere in the function:

- Press `vaf` - selects entire function including `function hello(name, age) { ... }`
- Press `vif` - selects only the body `console.log(name); return name;`

Cursor on `name` parameter:

- Press `via` - selects `name`
- Press `vaa` - selects `name,` (including comma)

**Navigation between functions:**

- `]m` - jump to next function
- `[m` - jump to previous function
- `]]` - jump to next class
- `[[` - jump to previous class

This is really useful for large files. Jump between functions without searching.

### Auto-start Tree-sitter

```lua
vim.api.nvim_create_autocmd("FileType", {
	pattern = "*",
	callback = function()
		local filetype = vim.bo.filetype
		if filetype and filetype ~= "" then
			pcall(vim.treesitter.start)
		end
	end,
})
```

This uses Neovim's built-in Tree-sitter API. `vim.treesitter.start()` is from Neovim core, not from the plugin.

So:

- When you open a file, Neovim detects filetype (JavaScript, Python, etc)
- This autocmd runs
- It calls `vim.treesitter.start()` which loads the parser for that filetype
- Tree-sitter starts highlighting immediately

The `pcall` (protected call) means if something goes wrong, Neovim doesn't crash. It just silently fails. This is useful if a parser is missing or broken.

### Enable Tree-sitter features

```lua
vim.wo.foldexpr = "v:lua.vim.treesitter.foldexpr()"
vim.bo.indentexpr = "v:lua.vim.treesitter.indentexpr()"
```

These also use Neovim's built-in Tree-sitter API:

- **`foldexpr()`** - Tells Neovim to use Tree-sitter for code folding. Now you can fold functions and classes accurately. Tree-sitter knows the structure, so folding works correctly.

- **`indentexpr()`** - Tells Neovim to use Tree-sitter for indentation. Tree-sitter understands language-specific rules. This is better than generic indentation based on brackets.

That's it! Now you have modern syntax highlighting with Tree-sitter.

## What's next

Now you have:

- Basic setup ([part 2](https://tduyng.com/blog/neovim-basic-setup/))
- LSP ([part 3](https://tduyng.com/blog/neovim-lsp-native/))
- Setup vim.pack with snacks.nvim ([part 4](https://tduyng.com/blog/vim-pack-and-snacks/))
- Tree-sitter syntax highlighting (this article)

Next article, we will setup auto-completion with blink.cmp ([part 6](https://tduyng.com/blog/neovim-auto-completions/))

---

My complete Neovim configuration: [https://github.com/tduyng/nvim](https://github.com/tduyng/nvim)

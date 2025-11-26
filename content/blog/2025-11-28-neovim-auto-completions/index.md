+++
title = "Part 6: Neovim auto-completion with blink.cmp"
description = "Setup auto-completion like VSCode. Fast suggestions from LSP with blink.cmp"
template = "post.html"
date = 2025-11-28
generate_feed = true
tags = ["neovim", "completion", "lsp", "snippets"]

[extra]
comment = true
reaction = true
toc = true
copy = true
outdate_alert = true
outdate_alert_days = 365
img = "/img/dashboard.png"
+++

This is part 6 of my Neovim series. Today we setup auto-completion.

Auto-completion helps you code faster. Type a few letters, it suggests the rest. Hit Tab, it completes.

LSP (from [part 3](https://tduyng.com/blog/neovim-lsp-native/)) knows your code. It knows functions, variables, types. Auto-completion uses this to suggest what you need.

I use [blink.cmp](https://github.com/Saghen/blink.cmp). It supports LSP, cmdline, signature help, and snippets. Has fuzzy matching for typos. Fast and extensible.

## Setup blink.cmp

Here's my complete setup:

**File: `lua/plugins/blink.lua`**

```lua
vim.pack.add({
	{
		src = "https://github.com/saghen/blink.cmp",
		version = vim.version.range("^1"),
	},
})

-- Lazy load on first insert mode entry (may not necessary)
local group = vim.api.nvim_create_augroup("BlinkCmpLazyLoad", { clear = true })

vim.api.nvim_create_autocmd("InsertEnter", {
	pattern = "*",
	group = group,
	once = true,
	callback = function()
		require("blink.cmp").setup({
			keymap = { preset = "super-tab" },
			appearance = {
				nerd_font_variant = "mono",
				use_nvim_cmp_as_default = true,
			},
			completion = {
				documentation = { auto_show = false },
			},
			sources = {
				default = { "lsp", "path", "snippets", "buffer" },
			},
			fuzzy = { implementation = "prefer_rust_with_warning" },
		})
	end,
})
```

Restart Neovim. Enter insert mode. Now you have completion.

## Breaking down the setup

Let me explain each part:

### Install the plugin

```lua
vim.pack.add({
	{
		src = "https://github.com/saghen/blink.cmp",
		version = vim.version.range("^1"),
	},
})
```

This installs blink.cmp using Neovim's native package manager. The `version` ensures you get v1.x updates but nothing breaking.

### Lazy loading

```lua
local group = vim.api.nvim_create_augroup("BlinkCmpLazyLoad", { clear = true })

vim.api.nvim_create_autocmd("InsertEnter", {
	pattern = "*",
	group = group,
	once = true,
	callback = function()
		require("blink.cmp").setup({
			-- config here
		})
	end,
})
```

This loads blink only when you enter insert mode for the first time. Faster startup. The `once = true` means it only runs once.

### Keymap preset

```lua
keymap = { preset = "super-tab" },
```

The `super-tab` preset makes Tab key work like VSCode:

- Press Tab to show suggestions
- Press Tab again to accept
- Press Tab to jump through snippet placeholders

Simple and familiar.

### Appearance

```lua
appearance = {
	nerd_font_variant = "mono",
	use_nvim_cmp_as_default = true,
},
```

**nerd_font_variant = "mono"** - Uses monospace nerd font icons in the menu. Works with most terminal setups.

**use_nvim_cmp_as_default = true** - Makes the menu look like nvim-cmp. Nice and clean.

### Documentation

```lua
completion = {
	documentation = { auto_show = false },
},
```

This disables auto-showing documentation popup. You can still show it manually with `Ctrl+Space`. I disable it because it can be distracting. Enable it if you want docs to show automatically.

### Sources

```lua
sources = {
	default = { "lsp", "path", "snippets", "buffer" },
},
```

blink.cmp gets suggestions from 4 places:

- **lsp** - From your LSP server (functions, variables, types)
- **path** - File paths when you type `./` or `/`
- **snippets** - Code templates (we'll setup these next)
- **buffer** - Words from your current file

The order matters. LSP comes first, so LSP suggestions appear at the top.

### Fuzzy matcher

```lua
fuzzy = { implementation = "prefer_rust_with_warning" },
```

blink.cmp has two fuzzy matchers:

- Rust implementation (fast, native)
- Lua implementation (fallback)

This setting prefers Rust but falls back to Lua if Rust isn't available. Fuzzy matching lets you make typos and still find matches.

## Setup snippets

Blink uses the `vim.snippet` API by default for expanding and navigating snippets. The built-in snippets source will load [friendly-snippets](https://github.com/rafamadriz/friendly-snippets), if available, and load any snippets found at `~/.config/nvim/snippets`

So we don't need other plugin, we can setup snippets directly:

- Create snippets folder

```bash
mkdir -p ~/.config/nvim/lua/snippets
```

- Create package.json

blink.cmp uses VSCode snippet format. You need a `package.json` to define them:

**File: `lua/snippets/package.json`**

```json
{
    "name": "custom-snippets",
    "contributes": {
        "snippets": [
            {
                "language": ["typescript", "typescriptreact", "javascriptreact", "javascript"],
                "path": "./typescript.json"
            }
        ]
    }
}
```

This tells blink where to find snippets. The `language` array lists which file types use these snippets. The `path` points to the snippet file.

- Create snippet file

**File: `lua/snippets/typescript.json`**

```json
{
    "Describe unit test": {
        "prefix": "descr",
        "body": ["describe('function', () => {", "", "})"],
        "description": "describe unit test"
    },
    "It unit test": {
        "prefix": "itt",
        "body": ["it('should return ', () => {", "", "})"],
        "description": "it unit test"
    },
    "Before unit test": {
        "prefix": "bf",
        "body": ["before(() => {", "", "})"],
        "description": "before unit test"
    },
    "After unit test": {
        "prefix": "af",
        "body": ["after(() => {", "    sandbox.restore()", "})"],
        "description": "after unit test"
    },
    "BeforeAll unit test": {
        "prefix": "bfa",
        "body": ["beforeAll(() => {", "", "})"],
        "description": "beforeAll unit test"
    },
    "AfterAll unit test": {
        "prefix": "afa",
        "body": ["afterAll(() => {", "    sandbox.restore()", "})"],
        "description": "afterAll unit test"
    },
    "AfterEach unit test": {
        "prefix": "afe",
        "body": ["afterEach(() => {", "    sandbox.reset()", "})"],
        "description": "afterEach unit test"
    },
    "ItParams mocha test": {
        "prefix": "itp",
        "body": ["itParam('should return when ${value.case}', data, (value) => {", "", "})"],
        "description": "itParam mocha test"
    }
}
```

Each snippet has:

- **prefix** - What you type to trigger it
- **body** - The code it expands to (array of lines)
- **description** - Shows in completion menu

These snippets load automatically when you open TypeScript/JavaScript files.

## How it looks

When you type in insert mode:

```
You type: desc
```

blink shows:

```
┌──────────────────────────────┐
│ describe                     │ (lsp)
│ description                  │ (lsp)
│ descr → describe('...', ...) │ (snippet)
└──────────────────────────────┘
```

Press Tab to accept. If you pick the snippet, it expands. If you pick LSP suggestion, it completes the word.

## What's next

Now you have:

- LSP ([part 3](https://tduyng.com/blog/neovim-lsp-native/))
- Setup vim.pack with snacks.nvim ([part 4](https://tduyng.com/blog/vim-pack-and-snacks/))
- Tree-sitter syntax highlighting ([part 5](https://tduyng.com/blog/neovim-highlight-syntax))
- Auto-completion (this article)

Next article, we will setup formatter with conform.nvim

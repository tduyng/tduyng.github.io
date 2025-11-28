+++
title = "Part 3: Setting up Neovim native lsp"
description = "Getting real IDE intelligence with Neovim's built-in language server support"
template = "post.html"
date = 2025-10-06
generate_feed = true
tags = ["neovim", "lsp", "ide"]

[extra]
comment = true
reaction = true
toc = true
copy = true
outdate_alert = true
outdate_alert_days = 365
img = "/img/dashboard.png"
+++

## What is LSP?

Language Server Protocol (LSP) is Microsoft's standardized protocol that lets any editor talk to language-specific tools. It gives you code completion, error checking, go-to-definition, find references, refactoring, and more.

The beauty of LSP is simple: it turns any text editor into a smart IDE like VSCode.

Neovim has had built-in LSP support since version 0.5 (released in 2021). But Neovim 0.11 made it even better with new APIs like `vim.lsp.config()` and `vim.lsp.enable()` that make setup much simpler. No plugins needed anymore. I watched [this video](https://www.youtube.com/watch?v=yI9R13h9IEE) that talks about using these new native APIs, and I agree with the approach.

**What's new in Neovim 0.11?**

- `vim.lsp.config()` - define configs inline
- `vim.lsp.enable()` - simple API to enable servers
- `lsp/*.lua` - automatic config loading from files
- Default keymaps (`grn`, `gra`, `grr`, etc.)
- Better defaults overall

But here's the thing: if you're new to Neovim or don't have time to set this up yourself, just use [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig) as a plugin. It does the same thing but manages the configs for you.

> nvim-lspconfig is a collection of LSP server configurations for the Nvim LSP client.

Huge thanks to the nvim-lspconfig maintainers and community! Their work is invaluable.

## The easy way: using nvim-lspconfig

If you use this plugin, you can enable language servers with just a few lines:

```lua
-- First, install nvim-lspconfig plugin (using lazy.nvim, packer, etc.)
-- Then enable the servers:
vim.lsp.enable({
  "lua_ls",
  "gopls",
  "rust_analyzer",
  -- ...
})
```

The `nvim-lspconfig` plugin provides pre-made configurations in its `lsp/` directory. When you call `vim.lsp.enable()`, Neovim looks for these configs and loads them automatically.

Each LSP needs its own tool installed. For example:

- `lua_ls` needs `lua-language-server`
- `gopls` needs `gopls`
- `rust_analyzer` needs `rust-analyzer`

You can automate this with `mason.nvim` and `mason-lspconfig.nvim`, but I don't use those plugins. If you want that approach, Google it. There's tons of articles and examples out there.

You can read all the LSP configs [here](https://github.com/neovim/nvim-lspconfig/blob/master/doc/configs.md)

Neovim provides default keymaps:

- `grn` → Rename symbol
- `gra` → Code actions
- `grr` → Find references
- `gri` → Go to implementation
- `grt` → Go to type definition
- `gO` → Document symbols

Or make your own keymaps:

```lua
vim.keymap.set("n", "<leader>ca", vim.lsp.buf.code_action, { desc = "Code Actions" })
vim.keymap.set("n", "<leader>cr", vim.lsp.buf.rename, { desc = "Code Rename" })
vim.keymap.set("n", "<leader>k", vim.lsp.buf.hover, { desc = "Hover Documentation" })
vim.keymap.set("n", "K", vim.lsp.buf.hover, { desc = "Hover (alt)" })
vim.keymap.set("n", "gd", vim.lsp.buf.definition, { desc = "Goto Definition" })
```

That's it. Now you have the same features as VSCode, IntelliJ, or Zed. Press `<leader>ca` to see code actions, `gd` to jump to definition, and so on.

Pretty easy.

## The hard way: native lsp without plugins

That's not what this article is about though. I want to show you how to set up LSP without plugins.

We'll do the same thing `nvim-lspconfig` does, but only for the languages we need.

Why go native?

Because it keeps your setup minimal, helps you understand how LSP works, and gives you more control.

## How native LSP works

Neovim 0.11 introduced two new APIs: `vim.lsp.config()` and `vim.lsp.enable()`.

### Method 1: inline config

You can define configs directly in your Lua code:

```lua
-- Define config inline
vim.lsp.config('lua_ls', {
  cmd = { "lua-language-server" },
  filetypes = { "lua" },
  root_markers = { ".luarc.json", ".git" },
  settings = {
    Lua = {
      runtime = { version = "LuaJIT" },
      diagnostics = { globals = { "vim" } },
    },
  },
})

-- Enable the server
vim.lsp.enable('lua_ls')
```

That's it. The Lua LSP is running.

**Understanding `root_markers` vs `root_dir`:**

You can specify the workspace root in two ways:

1. **`root_markers`** (simple): List of files/directories to search for

    ```lua
    root_markers = { ".luarc.json", ".git" }
    -- Or with priority groups:
    root_markers = { { "stylua.toml", ".luacheckrc" }, ".git" }
    ```

    Neovim searches upward from your file to find these markers. The first match becomes the workspace root. Items in nested lists have equal priority.

2. **`root_dir`** (advanced): A function for custom logic
    ```lua
    root_dir = function(bufnr, on_dir)
      local fname = vim.api.nvim_buf_get_name(bufnr)
      local root = vim.fs.root(fname, { ".git", "package.json" })
      if root then
        on_dir(root)  -- Activate LSP with this root
      end
      -- If you don't call on_dir(), LSP won't activate for this buffer
    end
    ```

Use `root_markers` for simple cases. Use `root_dir` when you need custom logic (like monorepo handling, conditional activation, etc.).

### Method 2: modular config (recommended)

But I prefer a more modular approach using the `lsp/` directory.

Neovim automatically searches for LSP configs in `lsp/*.lua` files within your Neovim runtime path. When you call `vim.lsp.enable('lua_ls')`, Neovim looks for `lsp/lua_ls.lua` and loads it.

This is the same pattern `nvim-lspconfig` uses. We'll learn from them and create our own configs.

## Setting up LSP configs

### Where to put config files

Create a `lsp/` directory in your Neovim config:

```
~/.config/nvim/
├── lsp/           # <- LSP configs go here
│   └── lua_ls.lua
├── lua/
│   └── config/
│       └── init.lua
└── init.lua
```

The `lsp/` directory is at the same level as `lua/`, not inside it. Neovim searches your runtime path for `lsp/*.lua` files.

### Creating a config

Here's an example for `lua_ls`:

```lua
-- ~/.config/nvim/lsp/lua_ls.lua
return {
  cmd = { "lua-language-server" },
  filetypes = { "lua" },
  root_markers = {
    ".luarc.json", ".luarc.jsonc", ".luacheckrc",
    ".stylua.toml", "stylua.toml", "selene.toml",
    "selene.yml", ".git"
  },
  settings = {
    Lua = {
      runtime = { version = "LuaJIT" }, -- Neovim uses LuaJIT
      diagnostics = { globals = { "vim" } }, -- Recognize 'vim' global
    },
  },
}
```

Every LSP config follows the same pattern:

- **cmd**: The command to run the LSP tool
- **filetypes**: Which file types to activate LSP for
- **root_markers** OR **root_dir**: How to find the workspace root
    - `root_markers`: Simple list of files to search for (e.g., `{".git", "package.json"}`)
    - `root_dir`: Function for custom logic (optional, more control)

When you call `vim.lsp.enable('lua_ls')`, Neovim loads `lsp/lua_ls.lua` and starts the server when you open a Lua file.

**How root finding works:**

Neovim searches upward from your current file to find a directory containing one of the `root_markers`. That directory becomes the workspace root.

For example, with `root_markers = { "stylua.toml", ".git" }`:

1. Open `/home/user/project/src/main.lua`
2. Search upward: `/home/user/project/src/` → `/home/user/project/` → ...
3. Find `/home/user/project/stylua.toml` → workspace root is `/home/user/project/`

You can also group markers with equal priority:

```lua
root_markers = {
  { "stylua.toml", ".luacheckrc" },  -- Try these first (equal priority)
  ".git"                              -- Fallback to .git
}
```

## Setting up other languages

Learn from the community. The `nvim-lspconfig` plugin has configs for every language in their `lsp/` directory: https://github.com/neovim/nvim-lspconfig/tree/master/lsp

You can copy their code directly into your `~/.config/nvim/lsp/` directory. The configs are designed to work with Neovim's native LSP system.

For example, to add TypeScript support:

1. Go to https://github.com/neovim/nvim-lspconfig/blob/master/lsp/vtsls.lua
2. Copy the file content
3. Save it as `~/.config/nvim/lsp/vtsls.lua`
4. Call `vim.lsp.enable('vtsls')` in your config

Most configs use simple `root_markers`:

```lua
-- Simple config example (gopls)
return {
  cmd = { "gopls" },
  filetypes = { "go", "gomod", "gowork", "gotmpl" },
  root_markers = { "go.work", "go.mod", ".git" },
}
```

Some configs need custom `root_dir` functions for complex scenarios (like ESLint's monorepo handling). If you need to adjust configs for your specific needs, AI is really good at this. Ask ChatGPT or Claude for help modifying Lua code.

## My Setup

Here's my file structure:

```
~/.config/nvim/
├── lsp/                      # Language server configs (copied from nvim-lspconfig)
│   ├── biome.lua
│   ├── cssls.lua
│   ├── denols.lua
│   ├── dockerls.lua
│   ├── eslint.lua
│   ├── gopls.lua
│   ├── html.lua
│   ├── jsonls.lua
│   ├── lua_ls.lua
│   ├── pyright.lua
│   ├── rust_analyzer.lua
│   ├── tailwindcss.lua
│   ├── vtsls.lua
│   ├── yamlls.lua
│   └── zls.lua
├── lua/
│   ├── config/
│   │   ├── lsp.lua           # LSP activation, keymaps, events
│   │   └── ...
│   └── utils/
│       └── lsp.lua           # Helper functions (optional)
```

Most of these configs come directly from nvim-lspconfig's `lsp/` directory. I just copied the ones I need.

## Example: ESLint setup

Let me show you a real example with eslint setup.

```lua
-- Install vscode-eslint-language-server
return {
	cmd = { "vscode-eslint-language-server", "--stdio" },
	filetypes = { "javascript", "javascriptreact", "typescript", "typescriptreact", "graphql" },
	root_markers = { ".eslintrc", ".eslintrc.js", ".eslintrc.json", "eslint.config.js", "eslint.config.mjs" },
	settings = {
		validate = "on",
		packageManager = vim.NIL,
		useESLintClass = false,
		experimental = { useFlatConfig = false },
		codeActionOnSave = { enable = false, mode = "all" },
		format = false,
		quiet = false,
		onIgnoredFiles = "off",
		options = {},
		rulesCustomizations = {},
		run = "onType",
		problems = { shortenToSingleLine = false },
		nodePath = "",
		workingDirectory = { mode = "location" },
		codeAction = {
			disableRuleComment = { enable = true, location = "separateLine" },
			showDocumentation = { enable = true },
		},
	},
	before_init = function(params, config)
		-- Set the workspace folder setting for correct search of tsconfig.json files etc.
		config.settings.workspaceFolder = {
			uri = params.rootPath,
			name = vim.fn.fnamemodify(params.rootPath, ":t"),
		}
	end,
	---@type table<string, lsp.Handler>
	handlers = {
		["eslint/openDoc"] = function(_, params)
			vim.ui.open(params.url)
			return {}
		end,
		["eslint/probeFailed"] = function()
			vim.notify("LSP[eslint]: Probe failed.", vim.log.levels.WARN)
			return {}
		end,
		["eslint/noLibrary"] = function()
			vim.notify("LSP[eslint]: Unable to load ESLint library.", vim.log.levels.WARN)
			return {}
		end,
		["eslint/confirmESLintExecution"] = function(_, result)
			if not result then
				return
			end
			return 4 -- approved
		end,
	},
}
```

This looks like a lot of code, but you don't need to write it yourself. Just copy it from nvim-lspconfig's repo. The config handles:

- **`root_dir` function**: Custom logic to find workspace root (instead of simple `root_markers`)
    - Searches for monorepo markers (pnpm-workspace.yaml, nx.json, etc.)
    - Calls `on_dir(workspace_root)` to activate LSP with that root
    - If `on_dir()` isn't called, LSP won't activate (this lets you skip activation for certain buffers)
- **Detecting ESLint config files** (`.eslintrc.*`, `eslint.config.*`)
- **Flat config support** (new ESLint 9+ format)

Use `root_markers` for simple cases. Use `root_dir` function when you need custom logic like the ESLint config does.

Make sure you install the LSP tool for each language. For ESLint, you need `vscode-langservers-extracted`:

## Setting up keymaps

Next step: keymaps. I set these up in `lua/config/lsp.lua`:

```lua
-- LSP
local function augroup(name)
	return vim.api.nvim_create_augroup("user_" .. name, { clear = true })
end

local default_keymaps = {
	{ keys = "<leader>ca", func = vim.lsp.buf.code_action, desc = "Code Actions" },
	{ keys = "<leader>cr", func = vim.lsp.buf.rename, desc = "Code Rename" },
	{ keys = "<leader>k", func = vim.lsp.buf.hover, desc = "Hover Documentation", has = "hoverProvider" },
	{ keys = "K", func = vim.lsp.buf.hover, desc = "Hover (alt)", has = "hoverProvider" },
	{ keys = "gd", func = vim.lsp.buf.definition, desc = "Goto Definition", has = "definitionProvider" },
}

-- I use blink.cmp for completion, but you can use native completion too
local completion = vim.g.completion_mode or "blink" -- or 'native' for built-in completion
vim.api.nvim_create_autocmd("LspAttach", {
	group = augroup("lsp_attach"),
	callback = function(args)
		local client = vim.lsp.get_client_by_id(args.data.client_id)
		local buf = args.buf
		if client then
			-- Built-in completion
			if completion == "native" and client:supports_method("textDocument/completion") then
				vim.lsp.completion.enable(true, client.id, args.buf, { autotrigger = true })
			end

			-- Inlay hints
			if client:supports_method("textDocument/inlayHints") then
				vim.lsp.inlay_hint.enable(true, { bufnr = args.buf })
			end

			if client:supports_method("textDocument/documentColor") then
				vim.lsp.document_color.enable(true, args.buf, {
					style = "background", -- 'background', 'foreground', or 'virtual'
				})
			end

			for _, km in ipairs(default_keymaps) do
				-- Only bind if there's no `has` requirement, or the server supports it
				if not km.has or client.server_capabilities[km.has] then
					vim.keymap.set(
						km.mode or "n",
						km.keys,
						km.func,
						{ buffer = buf, desc = "LSP: " .. km.desc, nowait = km.nowait }
					)
				end
			end
		end
	end,
})

local ts_server = vim.g.lsp_typescript_server or "vtsls"

-- Enable LSP servers for Neovim 0.11+
vim.lsp.enable({
	ts_server,
	"eslint",
	"lua_ls",
	"gopls",
	"rust_analyzer",
	"zls",
	"cssls",
	"html",
	"helm_ls",
	"biome",
	"yamlls",
	"jsonls",
	"tailwindcss",
  --- ... etc
})

-- Load Lsp on-demand, e.g: eslint is disable by default
-- e.g: We could enable eslint by set vim.g.lsp_on_demands = {"eslint"}
if vim.g.lsp_on_demands then
	vim.lsp.enable(vim.g.lsp_on_demands)
end

```

This code does a few things:

1. Sets up default keymaps when LSP attaches to a buffer
2. Enables native completion (if you want it)
3. Activates all the LSP servers I want to use

## Loading it all

Finally, load everything in `lua/config/init.lua`:

```lua
require("config.options")
require("config.keymaps")
require("config.diagnostics")
require("config.autocmds")
require("config.lsp")  -- Add this line
```

Now you have these keymaps:

- `<leader>ca` → Code Actions (fix imports, extract function, etc.)
- `<leader>cr` → Rename symbols across the project
- `<leader>k` / `K` → Hover documentation
- `gd` → Go to definition

For advanced navigation (`gI`, `gD`, `gr`), we'll enhance these with snacks.nvim in the next article.

That's it! You now have a full IDE experience in Neovim, just like VSCode. You understand how LSP works, and you have full control over your setup.

The key points:

1. **Neovim 0.11 made native LSP much simpler** with `vim.lsp.config()` and `vim.lsp.enable()`
2. **Config files go in `lsp/*.lua`** at your Neovim config root (parallel to `lua/`)
3. **Copy configs from nvim-lspconfig** - they're designed to work with native Neovim
4. **Just call `vim.lsp.enable()`** with server names to activate them

The native approach takes a bit more setup upfront, but you learn how everything works. Your config stays minimal, only what you need, nothing extra. And you don't depend on plugin updates.

## What's next

Now you have:

- Basic setup ([part 2](https://tduyng.com/blog/neovim-basic-setup/))
- LSP (this article)

Next article, we will setup vim.pack with snacks.nvim ([part 4](https://tduyng.com/blog/vim-pack-and-snacks/))

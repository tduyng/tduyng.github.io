+++
title = "Part 7: Neovim formatter with conform.nvim"
description = "Setup code formatter with conform.nvim. Format your code automatically on save"
template = "post.html"
date = 2025-11-29
generate_feed = true
tags = ["neovim", "formatter", "conform"]

[extra]
comment = true
reaction = true
toc = true
copy = true
show_ended_words = true
outdate_alert = true
outdate_alert_days = 365
img = "/img/dashboard.png"
+++

This is part 7 of my Neovim series. Today we setup code formatter. Format on save, like VSCode.

Code formatter keeps your code clean. No more arguing about spaces vs tabs. No more manual indentation. Save the file, it formats. Simple.

With LSP (we set this up in [part 3](https://tduyng.com/blog/neovim-lsp-native/)), Neovim can format code. But LSP formatting is limited. Not all LSP servers format well. Some are slow. Some don't support all languages.

## What is conform.nvim?

[conform.nvim](https://github.com/stevearc/conform.nvim) is a formatting plugin. It runs external formatters like prettier, stylua, black, gofmt. It's fast. It supports many languages. It has good defaults.

There are other plugins like formatter.nvim and null-ls. conform.nvim is the newest and most maintained.

## Setup conform.nvim

Here's my complete setup:

**File: `lua/plugins/conform.lua`**

```lua
vim.pack.add({ "https://github.com/stevearc/conform.nvim" })

require("conform").setup({
	formatters_by_ft = {
		lua = { "stylua" },
		go = { "goimports", "gofmt" },
		python = { "ruff_format", "black", stop_after_first = true },
		json = { "biome", "prettier", stop_after_first = true },
		markdown = { "prettier" },
		javascript = { "biome", "prettier", stop_after_first = true },
		typescript = { "biome", "prettier", stop_after_first = true },
		javascriptreact = { "biome", "prettier", stop_after_first = true },
		typescriptreact = { "biome", "prettier", stop_after_first = true },
		css = { "prettier" },
		html = { "prettier" },
		toml = { "taplo" },
	},
	formatters = {
		biome = { require_cwd = true },
	},
	default_format_opts = {
		lsp_format = "fallback",
	},
	format_on_save = function(bufnr)
		local ignore_filetypes = { "sql", "yaml", "yml" }
		if vim.tbl_contains(ignore_filetypes, vim.bo[bufnr].filetype) then
			return
		end
		if vim.g.disable_autoformat or vim.b[bufnr].disable_autoformat then
			return
		end
		local bufname = vim.api.nvim_buf_get_name(bufnr)
		if bufname:match("/node_modules/") then
			return
		end
		return { timeout_ms = 500, lsp_format = "fallback" }
	end,
})

vim.api.nvim_create_user_command("FormatDisable", function(opts)
	if opts.bang then
		vim.b.disable_autoformat = true
	else
		vim.g.disable_autoformat = true
	end
	vim.notify("Autoformat disabled" .. (opts.bang and " (buffer)" or " (global)"), vim.log.levels.WARN)
end, { desc = "Disable autoformat-on-save", bang = true })

vim.api.nvim_create_user_command("FormatEnable", function()
	vim.b.disable_autoformat = false
	vim.g.disable_autoformat = false
	vim.notify("Autoformat enabled", vim.log.levels.INFO)
end, { desc = "Re-enable autoformat-on-save" })

local auto_format = true

vim.keymap.set("n", "<leader>uf", function()
	auto_format = not auto_format
	if auto_format then
		vim.cmd("FormatEnable")
	else
		vim.cmd("FormatDisable")
	end
end, { desc = "Toggle Autoformat" })

vim.keymap.set({ "n", "v" }, "<leader>cn", "<cmd>ConformInfo<cr>", { desc = "Conform Info" })

vim.keymap.set({ "n", "v" }, "<leader>cf", function()
	require("conform").format({ async = true }, function(err, did_edit)
		if not err and did_edit then
			vim.notify("Code formatted", vim.log.levels.INFO, { title = "Conform" })
		end
	end)
end, { desc = "Format buffer" })

vim.keymap.set({ "n", "v" }, "<leader>cF", function()
	require("conform").format({ formatters = { "injected" }, timeout_ms = 3000 })
end, { desc = "Format Injected Langs" })
```

Restart Neovim. Save a file. It formats automatically.

## Breaking down the setup

### Formatters by filetype

```lua
formatters_by_ft = {
	lua = { "stylua" },
	go = { "goimports", "gofmt" },
	python = { "ruff_format", "black", stop_after_first = true },
	javascript = { "biome", "prettier", stop_after_first = true },
	-- more languages...
},
```

This tells conform which formatters to use for each language.

**Single formatter:**

```lua
lua = { "stylua" },
```

For Lua files, use stylua. Simple.

**Multiple formatters in sequence:**

```lua
go = { "goimports", "gofmt" },
```

For Go files, run goimports first, then gofmt. Both run in order.

Why both? goimports organizes imports and removes unused ones. gofmt formats the code. They work together.

**stop_after_first:**

```lua
javascript = { "biome", "prettier", stop_after_first = true },
```

Try formatters in order. Use the first one that's installed. Stop after that.

### Formatter options

```lua
formatters = {
	biome = { require_cwd = true },
},
```

**require_cwd = true** - Only run this formatter if it's configured in the project root.

For biome: only run if `biome.json` or `biome.jsonc` exists in project.

This prevents formatting with the wrong tool. If your project doesn't use biome, it won't run. Only prettier will run.

### Default format options

```lua
default_format_opts = {
	lsp_format = "fallback",
},
```

**lsp_format = "fallback"** - Try external formatters first. If none available, use LSP formatting.

This gives you the best of both worlds. External formatters are usually better. But LSP formatting works as backup.

### Format on save

```lua
format_on_save = function(bufnr)
	local ignore_filetypes = { "sql", "yaml", "yml" }
	if vim.tbl_contains(ignore_filetypes, vim.bo[bufnr].filetype) then
		return
	end
	if vim.g.disable_autoformat or vim.b[bufnr].disable_autoformat then
		return
	end
	local bufname = vim.api.nvim_buf_get_name(bufnr)
	if bufname:match("/node_modules/") then
		return
	end
	return { timeout_ms = 500, lsp_format = "fallback" }
end,
```

This function runs when you save. It decides whether to format or not.

**Ignore certain filetypes:**

```lua
local ignore_filetypes = { "sql", "yaml", "yml" }
if vim.tbl_contains(ignore_filetypes, vim.bo[bufnr].filetype) then
	return
end
```

Don't format SQL, YAML, YML files. These formats are sensitive. Auto-formatting can break them.

**Check if autoformat is disabled:**

```lua
if vim.g.disable_autoformat or vim.b[bufnr].disable_autoformat then
	return
end
```

If you disabled autoformat (globally or for this buffer), don't format.

**Skip node_modules:**

```lua
local bufname = vim.api.nvim_buf_get_name(bufnr)
if bufname:match("/node_modules/") then
	return
end
```

Never format files in node_modules. You don't own those files.

**Format with timeout:**

```lua
return { timeout_ms = 500, lsp_format = "fallback" }
```

Run formatter with 500ms timeout. If it takes longer, skip it. Use LSP as fallback.

### Commands

```lua
vim.api.nvim_create_user_command("FormatDisable", function(opts)
	if opts.bang then
		vim.b.disable_autoformat = true
	else
		vim.g.disable_autoformat = true
	end
	vim.notify("Autoformat disabled" .. (opts.bang and " (buffer)" or " (global)"), vim.log.levels.WARN)
end, { desc = "Disable autoformat-on-save", bang = true })

vim.api.nvim_create_user_command("FormatEnable", function()
	vim.b.disable_autoformat = false
	vim.g.disable_autoformat = false
	vim.notify("Autoformat enabled", vim.log.levels.INFO)
end, { desc = "Re-enable autoformat-on-save" })
```

**:FormatDisable** - Disable autoformat globally.
**:FormatDisable!** - Disable autoformat for current buffer only.
**:FormatEnable** - Re-enable autoformat.

Useful when you're editing a file you don't want to format.

### Keymaps

```lua
vim.keymap.set("n", "<leader>uf", function()
	auto_format = not auto_format
	if auto_format then
		vim.cmd("FormatEnable")
	else
		vim.cmd("FormatDisable")
	end
end, { desc = "Toggle Autoformat" })
```

**<leader>uf** - Toggle autoformat on/off. Quick switch.

```lua
vim.keymap.set({ "n", "v" }, "<leader>cn", "<cmd>ConformInfo<cr>", { desc = "Conform Info" })
```

**<leader>cn** - Show conform info. Which formatters are available? Which will run?

```lua
vim.keymap.set({ "n", "v" }, "<leader>cf", function()
	require("conform").format({ async = true }, function(err, did_edit)
		if not err and did_edit then
			vim.notify("Code formatted", vim.log.levels.INFO, { title = "Conform" })
		end
	end)
end, { desc = "Format buffer" })
```

**<leader>cf** - Format current buffer manually. Useful when autoformat is disabled.

```lua
vim.keymap.set({ "n", "v" }, "<leader>cF", function()
	require("conform").format({ formatters = { "injected" }, timeout_ms = 3000 })
end, { desc = "Format Injected Langs" })
```

**<leader>cF** - Format injected languages. Like code blocks in markdown. Or HTML in JavaScript template strings.

**IMPORTANT**: conform.nvim doesn't include formatters. Install them separately (prettier, stylua ...etc)

## Tips

- Install formatters you actually use
- Use `:ConformInfo` to see which formatters will run
- Disable autoformat with `:FormatDisable!` for current file
- Format manually with `<leader>cf`

## What's next

Now you have:

- LSP ([part 3](https://tduyng.com/blog/neovim-lsp-native/))
- Setup vim.pack with snacks.nvim ([part 4](https://tduyng.com/blog/vim-pack-and-snacks/))
- Tree-sitter syntax highlighting ([part 5](https://tduyng.com/blog/neovim-highlight-syntax))
- Auto-completion ([part 6](https://tduyng.com/blog/neovim-auto-completions/))
- Code formatter (this article)

Next article, we will setup git tools

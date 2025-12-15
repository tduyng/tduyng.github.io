+++
title = "Part 8: Neovim git integration"
description = "Setup git tools with gitsigns and diffview. See changes, blame, diff in Neovim"
template = "post.html"
date = 2025-12-02
generate_feed = true
tags = ["neovim", "git", "gitsigns", "diffview"]

[extra]
comment = true
reaction = true
toc = true
copy = true
outdate_alert = true
outdate_alert_days = 365
img = "/img/dashboard.webp"
+++

This is part 8 of my Neovim series. Today we setup git tools. See git changes in your editor.

Git integration shows you what changed. Which lines you added. Which you deleted. Who wrote this line. When it was changed. All without leaving Neovim.

We already setup snacks.nvim in [part 4](https://tduyng.com/blog/vim-pack-and-snacks/). That gives us many Git utilities:

- `<leader>gb` - Show git branches
- `<leader>gl` - Show git logs
- `<leader>gs` - Show git status
- `<leader>gd` - Show git diff
  ...etc

Snacks.nvim already wraps `lazygit`. That handles a lot of Git work. But it still misses some features:

- Show changes directly in the buffer
- Blame individual lines
- Show diffs in splits
- Resolve conflicts

To get these features, I use two plugins: gitsigns.nvim and diffview.nvim

**gitsigns.nvim** - Shows git changes in the sign column. Blame lines. Stage hunks. Navigate changes.

**diffview.nvim** - View diffs in a split. Compare branches. See file history. Review changes before commit. Resolve conflicts

## Setup git tools

Here's my complete setup:

**File: `lua/plugins/git.lua`**

```lua
vim.pack.add({
	"https://github.com/lewis6991/gitsigns.nvim",
	"https://github.com/sindrets/diffview.nvim",
})

-- Setup gitsigns.nvim
require("gitsigns").setup({
	current_line_blame = true,
	signs = {
		add = { text = "▎" },
		change = { text = "▎" },
		delete = { text = "" },
		topdelete = { text = "" },
		changedelete = { text = "▎" },
		untracked = { text = "▎" },
	},
	signs_staged = {
		add = { text = "▎" },
		change = { text = "▎" },
		delete = { text = "" },
		topdelete = { text = "" },
		changedelete = { text = "▎" },
	},
	on_attach = function(buffer)
		local gs = package.loaded.gitsigns

		local function map(mode, lhs, rhs, desc)
			vim.keymap.set(mode, lhs, rhs, { buffer = buffer, desc = desc })
		end

		map("n", "]h", function()
			if vim.wo.diff then
				vim.cmd.normal({ "]c", bang = true })
			else
				gs.nav_hunk("next")
			end
		end, "Next Hunk")

		map("n", "[h", function()
			if vim.wo.diff then
				vim.cmd.normal({ "[c", bang = true })
			else
				gs.nav_hunk("prev")
			end
		end, "Prev Hunk")

		map("n", "]H", function()
			gs.nav_hunk("last")
		end, "Last Hunk")
		map("n", "[H", function()
			gs.nav_hunk("first")
		end, "First Hunk")

		map({ "n", "v" }, "<leader>ghs", ":Gitsigns stage_hunk<CR>", "Stage Hunk")
		map({ "n", "v" }, "<leader>ghr", ":Gitsigns reset_hunk<CR>", "Reset Hunk")

		map("n", "<leader>ghS", gs.stage_buffer, "Stage Buffer")
		map("n", "<leader>ghu", gs.undo_stage_hunk, "Undo Stage Hunk")
		map("n", "<leader>ghR", gs.reset_buffer, "Reset Buffer")
		map("n", "<leader>ghp", gs.preview_hunk_inline, "Preview Hunk Inline")
		map("n", "<leader>ghb", function()
			gs.blame_line({ full = true })
		end, "Blame Line")
		map("n", "<leader>ghB", function()
			gs.blame()
		end, "Blame Buffer")
		map("n", "<leader>ghd", gs.diffthis, "Diff This")
		map("n", "<leader>ghD", function()
			gs.diffthis("~")
		end, "Diff This ~")

		map({ "o", "x" }, "ih", ":<C-U>Gitsigns select_hunk<CR>", "GitSigns Select Hunk")
	end,
})

-- Setup diffview.nvim
require("diffview").setup({
	use_icons = true,
	icons = { folder_closed = "", folder_open = "" },
	view = {
		default = { winbar_info = true },
	},
	file_panel = {
		win_config = { height = 20 },
	},
})

-- diffview keymaps
vim.keymap.set("n", "<leader>Do", function()
	vim.ui.input({ prompt = "Diff refs (ex. main..feature): " }, function(refs)
		if refs and refs:match("%S") then
			local safe = vim.fn.shellescape(refs, true)
			vim.cmd(("DiffviewOpen %s"):format(safe))
		else
			vim.cmd("DiffviewOpen")
		end
	end)
end, { desc = "Diffview: open (prompt for refs or default)" })

vim.keymap.set("n", "<leader>Dc", "<cmd>DiffviewClose<cr>", { desc = "Diffview: Close" })
vim.keymap.set("n", "<leader>Dt", "<cmd>DiffviewToggleFiles<cr>", { desc = "Diffview: Toggle file list" })
vim.keymap.set("n", "<leader>Dh", "<cmd>DiffviewFileHistory %<cr>", { desc = "Diffview: File history" })
vim.keymap.set("n", "<leader>DH", "<cmd>DiffviewFileHistory<cr>", { desc = "Diffview: Repo history" })

-- toggles
vim.keymap.set("n", "<leader>uG", function()
	local gs = require("gitsigns")
	local cfg = require("gitsigns.config").config
	local current = cfg.signcolumn
	gs.toggle_signs(not current)
end, { desc = "Toggle Git Signs" })
```

Restart Neovim. Open a git repo. You see git signs in the gutter.

## Breaking down the setup

### Gitsigns config

```lua
current_line_blame = true,
```

Shows git blame on current line. See who wrote it and when.

```lua
signs = {
	add = { text = "▎" },
	change = { text = "▎" },
	delete = { text = "" },
	topdelete = { text = "" },
	changedelete = { text = "▎" },
	untracked = { text = "▎" },
},
```

Icons in the sign column. Shows what changed:

- **add** - New lines
- **change** - Modified lines
- **delete** - Deleted lines
- **untracked** - New files not in git

```lua
signs_staged = {
	add = { text = "▎" },
	change = { text = "▎" },
	-- ...
},
```

Different signs for staged changes. You see what's staged vs unstaged.

### Navigation keymaps

Some more keymaps:

```lua
map("n", "]h", function()
	if vim.wo.diff then
		vim.cmd.normal({ "]c", bang = true })
	else
		gs.nav_hunk("next")
	end
end, "Next Hunk")
```

`]h` - Jump to next change (hunk). `[h` - Jump to previous change.

Works in diff mode too. Smart navigation.

```lua
map("n", "]H", function()
	gs.nav_hunk("last")
end, "Last Hunk")
```

`]H` - Jump to last change. `[H` - Jump to first change.

### Stage and reset keymaps

```lua
map({ "n", "v" }, "<leader>ghs", ":Gitsigns stage_hunk<CR>", "Stage Hunk")
map({ "n", "v" }, "<leader>ghr", ":Gitsigns reset_hunk<CR>", "Reset Hunk")
```

`<leader>ghs` - Stage current hunk. Works in visual mode too (stage selection).

`<leader>ghr` - Reset current hunk (discard changes).

```lua
map("n", "<leader>ghS", gs.stage_buffer, "Stage Buffer")
map("n", "<leader>ghR", gs.reset_buffer, "Reset Buffer")
```

`<leader>ghS` - Stage entire file.

`<leader>ghu` - Undo stage hunk (unstage last staged hunk).

`<leader>ghR` - Reset entire file (discard all changes).

`<leader>ghp` - Preview hunk inline (show changes without opening a split).

### Blame keymaps

```lua
map("n", "<leader>ghb", function()
	gs.blame_line({ full = true })
end, "Blame Line")
```

`<leader>ghb` - Show full blame for current line. See commit message and author.

`<leader>ghB` - Show blame for entire file.

### Diff keymaps

```lua
map("n", "<leader>ghd", gs.diffthis, "Diff This")
```

`<leader>ghd` - Open diff view for current file. See all changes in a split.

`<leader>ghD` - Diff against HEAD~.

### Text object

```lua
map({ "o", "x" }, "ih", ":<C-U>Gitsigns select_hunk<CR>", "GitSigns Select Hunk")
```

`ih` - Text object for hunk. Use like `vih` (select hunk), `dih` (delete hunk), `yih` (yank hunk).

### Diffview config

```lua
require("diffview").setup({
	use_icons = true,
	icons = { folder_closed = "", folder_open = "" },
	view = {
		default = { winbar_info = true },
	},
	file_panel = {
		win_config = { height = 20 },
	},
})
```

Diffview shows changes in a nice split layout. File panel shows changed files. Click to see diff.

### Diffview keymaps

```lua
vim.keymap.set("n", "<leader>Do", function()
	vim.ui.input({ prompt = "Diff refs (ex. main..feature): " }, function(refs)
		if refs and refs:match("%S") then
			local safe = vim.fn.shellescape(refs, true)
			vim.cmd(("DiffviewOpen %s"):format(safe))
		else
			vim.cmd("DiffviewOpen")
		end
	end)
end, { desc = "Diffview: open (prompt for refs or default)" })
```

`<leader>Do` - Open diffview. Prompts for refs (like `main..feature`). Leave empty to see uncommitted changes.

`<leader>Dc` - Close diffview.

`<leader>Dt` - Toggle file list.

`<leader>Dh` - Show history for current file.

`<leader>DH` - Show history for entire repo.

### Toggle signs

```lua
vim.keymap.set("n", "<leader>uG", function()
	local gs = require("gitsigns")
	local cfg = require("gitsigns.config").config
	local current = cfg.signcolumn
	gs.toggle_signs(not current)
end, { desc = "Toggle Git Signs" })
```

`<leader>uG` - Toggle git signs on/off. Clean view when you don't need them.

## What's next

Now you have:

- Basic setup ([part 2](https://tduyng.com/blog/neovim-basic-setup/))
- LSP ([part 3](https://tduyng.com/blog/neovim-lsp-native/))
- Setup vim.pack with snacks.nvim ([part 4](https://tduyng.com/blog/vim-pack-and-snacks/))
- Tree-sitter syntax highlighting ([part 5](https://tduyng.com/blog/neovim-highlight-syntax))
- Auto-completion ([part 6](https://tduyng.com/blog/neovim-auto-completions/))
- Code formatter ([part 7](https://tduyng.com/blog/neovim-formatter-conform/))
- Git tools (this article)

Next article, we will setup debug tools with nvim-dap

---

My complete Neovim configuration: [https://github.com/tduyng/nvim](https://github.com/tduyng/nvim)

+++
title = "Part 10: Neovim enhanced editing experience"
description = "Making editing feel magical with flash.nvim, yanky.nvim, grug-far.nvim, and noice.nvim"
template = "post.html"
date = 2025-12-24
generate_feed = true
tags = ["neovim", "flash", "yanky", "grug-far", "noice"]
draft = true

[extra]
comment = true
reaction = true
toc = true
copy = true
outdate_alert = true
outdate_alert_days = 365
img = "/img/dashboard.webp"
+++

This is part 10 of my Neovim series. Today I share some plugins that make editing feel magical.

After setting up the basics (LSP, completion, formatting, debugging), I thought I was done. But I kept finding small annoyances in my daily workflow. Jumping to text felt clunky. My clipboard kept getting overwritten. Finding and replacing across files was painful. The UI felt plain.

Then I discovered a few plugins that solved these exact problems. They're not essential like LSP or completion. But they make editing feel so much smoother. Now I can't imagine working without them.

I'll share four plugins that transformed my editing experience: flash.nvim for lightning-fast navigation, yanky.nvim for smarter clipboard management, grug-far.nvim for powerful search and replace, and noice.nvim for a beautiful UI.

## flash.nvim - navigation that feels like magic

The first thing I struggled with was navigation. Neovim has `f` and `t` motions to jump to characters. But the native way never felt natural to me.

For example, when I press `f` and type a character, I need to keep pressing `;` to cycle through each match. If the character appears 8 times on the line, I press `;` seven times. It's tedious.

Then I found flash.nvim. It completely changes how I navigate code.

### How flash works

When I press `s` (search), flash shows labels next to every match on the screen. I type what I'm looking for, then press the label to jump instantly. No more cycling through matches.

Let me give you a real example. Say I have this line of code:

```javascript
const user = await getUser(userId, config, options)
```

With native Neovim, if I want to jump to the second `o` in "options", I'd press `fo` then `;` multiple times until I get there.

With flash, I press `s`, type `op`, and flash shows labels next to "options" and "const" (both contain "op"). I press the label for "options" and I'm there instantly. One motion instead of many.

### What makes flash special

Flash does more than just better searching. It enhances the native `f`, `t`, `F`, `T` motions. When I press `f`, flash shows me labels for every character match, making it easy to jump exactly where I want.

It also has Treesitter integration. I press `S` (capital S) and flash highlights all the Treesitter nodes I can jump to (functions, classes, parameters, etc). Super useful for navigating code structure.

And it works across windows. If I have multiple splits open, flash can jump between them. I don't even think about which window something is in anymore.

### My setup

Here's how I configured flash:

**File: `lua/plugins/flash.lua`**

```lua
vim.pack.add({
	"https://github.com/folke/flash.nvim",
})

local flash = require("flash")
flash.setup({
	modes = {
		-- Enhanced f, t, F, T motions
		char = {
			enabled = true,
			jump_labels = true,
		},
	},
})

-- Keymaps
-- stylua: ignore start
vim.keymap.set({"n","x","o"}, "s", function() flash.jump() end, { desc = "Flash" })
vim.keymap.set({"n","x","o"}, "S", function() flash.treesitter() end, { desc = "Flash Treesitter" })
vim.keymap.set("o", "r", function() flash.remote() end, { desc = "Remote Flash" })
vim.keymap.set({"x","o"}, "R", function() flash.treesitter_search() end, { desc = "Treesitter Search" })
vim.keymap.set("c", "<c-s>", function() flash.toggle() end, { desc = "Toggle Flash Search" })
-- stylua: ignore end
```

The setup is minimal. I enable enhanced character motions so `f` and `t` get the jump labels.

For keymaps, I use `s` for flash jump (I don't use the native `s` command much), `S` for Treesitter navigation, and `r` for remote operations. The `<c-s>` toggle lets me turn flash on/off during command-line searches.

### How I use it daily

My most common pattern is pressing `s`, typing 2-3 characters of what I want, then hitting the jump label. It's faster than thinking about motions like `3w` or `5j`.

For navigating code structure, `S` (Treesitter) is incredible. When I'm inside a nested function and want to jump to the parent function definition, I press `S` and flash shows me exactly where I can go.

The remote motion with `r` is useful for operations across windows. Like `d` + `r` (delete to remote location) or `c` + `r` (change to remote location). I can operate on text in another split without switching to it.

Flash made me realize how much time I wasted on navigation. Now jumping feels instant and natural.

## yanky.nvim - the clipboard manager I didn't know I needed

The second big frustration was the clipboard. In Neovim, when I copy something and then delete something else, my clipboard gets replaced. The thing I copied is gone.

This happened constantly. I'd copy a function name, delete an old variable, then try to paste the function name and get the deleted variable instead. Then I'd have to go back, copy again, and paste. So much wasted motion.

Yanky solved this completely. It's a clipboard manager that keeps a history of everything I copy or delete.

### Why yanky matters

With yanky, everything I yank (copy) or delete goes into a history. When I want to paste, I can cycle through my clipboard history to find what I need.

The killer feature for me is `<leader>y`. It opens a picker showing my entire yank history. I can see everything I've copied recently and select exactly what I want to paste. No more "wait, what did I copy?" moments.

### How yanky works

Yanky intercepts all yank and delete operations. Instead of overwriting the clipboard, it adds each operation to a ring buffer. I can navigate this ring with keybindings or open a picker to see everything at once.

It also highlights what I just yanked. When I copy something, it flashes briefly so I know exactly what got copied. Small detail, but it gives great feedback.

### My setup

**File: `lua/plugins/yanky.lua`**

```lua
vim.pack.add({
	"https://github.com/gbprod/yanky.nvim",
})

local _yanky_loaded = false

local function load_yanky()
	if _yanky_loaded then
		return
	end
	_yanky_loaded = true

	require("yanky").setup({
		highlight = {
			timer = 150,
		},
	})
end

-- Lazy load on first yank
local group = vim.api.nvim_create_augroup("YankyLazyLoad", { clear = true })

vim.api.nvim_create_autocmd({ "TextYankPost" }, {
	pattern = "*",
	group = group,
	once = true,
	callback = function()
		load_yanky()
	end,
})

-- Keymaps
-- stylua: ignore start
vim.keymap.set({ "n", "x" }, "<leader>y", function() load_yanky(); require("snacks").picker.yanky() end, { desc = "Yank History" })
vim.keymap.set({ "n", "x" }, "y", function() load_yanky(); return "<Plug>(YankyYank)" end, { expr = true, desc = "Yank" })
vim.keymap.set({ "n", "x" }, "p", function() load_yanky(); return "<Plug>(YankyPutAfter)" end, { expr = true, desc = "Put After" })
vim.keymap.set({ "n", "x" }, "P", function() load_yanky(); return "<Plug>(YankyPutBefore)" end, { expr = true, desc = "Put Before" })
vim.keymap.set({ "n", "x" }, "gp", function() load_yanky(); return "<Plug>(YankyGPutAfter)" end, { expr = true, desc = "Put After (stay)" })
vim.keymap.set({ "n", "x" }, "gP", function() load_yanky(); return "<Plug>(YankyGPutBefore)" end, { expr = true, desc = "Put Before (stay)" })
vim.keymap.set("n", "<C-p>", function() load_yanky(); return "<Plug>(YankyCycleForward)" end, { expr = true, desc = "Cycle Forward" })
vim.keymap.set("n", "<C-n>", function() load_yanky(); return "<Plug>(YankyCycleBackward)" end, { expr = true, desc = "Cycle Backward" })
-- stylua: ignore end
```

I lazy load yanky on the first yank operation. This keeps startup fast since yanky isn't needed until I copy something.

The highlight timer is set to 150ms. When I yank something, it flashes for that duration. Short enough not to be annoying, long enough to give feedback.

### Integration with snacks

Yanky works great with snacks.nvim picker (which I set up in [part 4](https://tduyng.com/blog/vim-pack-and-snacks/)). When I press `<leader>y`, the snacks picker shows my yank history in a nice fuzzy-searchable interface.

I can search through my clipboard history, preview each entry, and select what I want to paste. It's like having a time machine for my clipboard.

### How I use it daily

My most common workflow is copy multiple things, then use `<leader>y` to pick what I want to paste. For example, when refactoring, I copy several variable names, then paste them in different places by selecting from the history.

The cycle keymaps (`<C-p>` and `<C-n>`) are useful when I just need to go back one or two items. After pasting, if it's not what I wanted, I press `<C-p>` to cycle to the previous yank.

The `gp` and `gP` variants are nice because they leave my cursor where it was after pasting. Useful when I want to paste something but continue editing at my current position.

Yanky eliminated a whole class of frustrations. My clipboard just works now.

## grug-far.nvim - search and replace that actually works

The third pain point was search and replace across files. In Neovim, I can do `:%s/search/replace/g` for a single file. But for multiple files? That was painful.

The native way is using `:grep` to populate the quickfix list, then running `:cdo %s/search/replace/g`. It works, but it's error-prone. I can't preview changes. I can't see what I'm replacing until it's done. And the syntax is hard to remember.

Grug-far changed everything. It gives me a VSCode-like search and replace interface, but faster and more powerful.

### How grug-far works

When I press `<leader>sr` (search replace), grug-far opens a special buffer that acts as a UI. It has separate fields for search pattern, replacement text, file filters, and flags.

As I type in the search field, it shows me all matches in real-time across my project. I can see the context around each match. Then I enter my replacement text and see a preview of what will change. When I'm ready, I confirm and it replaces everything.

It uses ripgrep under the hood, so searches are fast even in large codebases. And it supports regex, case sensitivity toggles, and file filtering.

### What makes grug-far special

The UI is the key. Instead of typing cryptic commands, I fill in form fields. Search here, replace with this, in these files, with these flags. Visual and intuitive.

The live preview is huge. I can see every match before replacing. If something looks wrong, I adjust my search pattern. No more "oops, I replaced the wrong thing".

It also supports ast-grep for structural search. This lets me search for code patterns, not just text. Super useful for refactoring.

### My setup

**File: `lua/plugins/grug-far.lua`**

```lua
vim.pack.add({
	"https://github.com/MagicDuck/grug-far.nvim",
})

require("grug-far").setup({
	headerMaxWidth = 80,
})

vim.keymap.set({ "n", "v", "x" }, "<leader>sr", function()
	local grug = require("grug-far")
	local ext = vim.bo.buftype == "" and vim.fn.expand("%:e")
	grug.open({
		transient = true,
		prefills = {
			filesFilter = ext and ext ~= "" and "*." .. ext or nil,
		},
	})
end, { desc = "Search and Replace" })
```

The setup is simple. I set `headerMaxWidth` to 80 to keep the UI compact.

The keymap is smart. When I open grug-far from a file, it automatically filters to files with the same extension. If I'm in a `.ts` file and want to replace something, it defaults to searching only TypeScript files. I can remove the filter if I want to search everything.

The `transient` option makes the grug-far buffer temporary. It doesn't stick around in my buffer list after I close it.

### Advanced features

Grug-far has features I'm still discovering. You can save and reload search history. You can open results in quickfix list. You can inline-edit results and sync them back to files.

The regex and flag support is powerful. I can use capture groups, word boundaries, multiline matches, all the ripgrep features.

For structural search with ast-grep, you can search for code patterns like "all function calls with 3 arguments" or "all if statements without an else". Great for refactoring.

Grug-far made project-wide refactoring feel safe and fast. I actually enjoy search and replace now.

## noice.nvim – making Neovim feel modern

This last plugin is a bit different. It’s not about productivity or fixing pain points. It’s about polish.

Noice replaces Neovim’s UI for messages, the command line, and popups. The default UI works, but it’s very plain. Noice makes it feel modern and intentional.

The command line becomes a clean popup at the bottom with syntax highlighting. When I type `:`, I get a readable interface instead of the raw command line, with Vim commands, functions, and strings highlighted properly.

Messages no longer clutter the command line. Saving a file or running a command shows a small notification that fades away. No more noisy output taking over the screen or forcing me to open `:messages`.

The annoying “Press ENTER or type command to continue” prompt is gone. Long messages are shown in a split or as scrollable notifications, so nothing blocks my workflow.

LSP hover documentation also looks much better. Markdown rendering is cleaner, spacing is improved, and longer docs are easier to read.

Noice isn’t required. Neovim works perfectly fine without it. But once you use it, the editor feels more polished and much less “terminal-like”.

### My setup

**File: `lua/plugins/noice.lua`**

```lua
vim.pack.add({
	"https://github.com/folke/noice.nvim",
	"https://github.com/MunifTanjim/nui.nvim",
})

if vim.o.filetype == "lazy" then
	vim.cmd([[messages clear]])
end

require("noice").setup({
	cmdline = {
		view = "cmdline",
	},
	lsp = {
		override = {
			["vim.lsp.util.convert_input_to_markdown_lines"] = true,
			["vim.lsp.util.stylize_markdown"] = true,
			["cmp.entry.get_documentation"] = true,
		},
	},
	routes = {
		{
			filter = {
				event = "msg_show",
				any = {
					{ find = "%d+L, %d+B" },
					{ find = "; after #%d+" },
					{ find = "; before #%d+" },
				},
			},
			view = "mini",
		},
	},
	presets = {
		bottom_search = true,
		command_palette = true,
		long_message_to_split = true,
	},
})

-- Keymaps
-- stylua: ignore start
vim.keymap.set({ "n" }, "<leader>sn", "", { desc = "+noice" })
vim.keymap.set("c", "<S-Enter>", function() require("noice").redirect(vim.fn.getcmdline()) end, { desc = "Redirect Cmdline" })
vim.keymap.set("n", "<leader>snl", function() require("noice").cmd("last") end, { desc = "Noice Last Message" })
vim.keymap.set("n", "<leader>snh", function() require("noice").cmd("history") end, { desc = "Noice History" })
vim.keymap.set("n", "<leader>sna", function() require("noice").cmd("all") end, { desc = "Noice All" })
vim.keymap.set("n", "<leader>snd", function() require("noice").cmd("dismiss") end, { desc = "Dismiss All" })
vim.keymap.set("n", "<leader>snt", function() require("noice").cmd("pick") end, { desc = "Noice Picker" })
vim.keymap.set({ "i", "n", "s" }, "<c-f>", function() if not require("noice.lsp").scroll(4) then return "<c-f>" end end, { silent = true, expr = true, desc = "Scroll Forward" })
vim.keymap.set({ "i", "n", "s" }, "<c-b>", function() if not require("noice.lsp").scroll(-4) then return "<c-b>" end end, { silent = true, expr = true, desc = "Scroll Backward" })
-- stylua: ignore end
```

I keep the command line at the bottom using the `cmdline` view (some people prefer the popup version). The LSP overrides improve markdown rendering in hover documentation.

The routes section filters common messages like file save confirmations (`25L, 342B written`) and shows them as small, unobtrusive notifications instead of full popups.

The presets enable some great defaults: search UI at the bottom, a cleaner command palette, and long messages displayed in splits instead of blocking prompts.

How I use it ?

Most of the time, I don’t actively think about Noice. It just makes Neovim nicer to use. The message history keymaps are helpful when I need to check what happened earlier. `<leader>snh` shows recent messages, and `<leader>snl` replays the last one if it disappeared too quickly.

The scroll keymaps (`<c-f>` and `<c-b>`) are especially useful for long LSP hover docs, letting me scroll without closing the popup.

## What's next

Now you have:

- Basic setup ([part 2](https://tduyng.com/blog/neovim-basic-setup/))
- LSP ([part 3](https://tduyng.com/blog/neovim-lsp-native/))
- Setup vim.pack with snacks.nvim ([part 4](https://tduyng.com/blog/vim-pack-and-snacks/))
- Tree-sitter syntax highlighting ([part 5](https://tduyng.com/blog/neovim-highlight-syntax))
- Auto-completion ([part 6](https://tduyng.com/blog/neovim-auto-completions/))
- Code formatter ([part 7](https://tduyng.com/blog/neovim-formatter-conform/))
- Git tools ([part 8](/blog/neovim-git-tools/))
- Setup debug ([part 9](/blog/neovim-setup-debug-nodejs/))

In future articles, I might cover custom statusline

---

My complete Neovim configuration: [https://github.com/tduyng/nvim](https://github.com/tduyng/nvim)

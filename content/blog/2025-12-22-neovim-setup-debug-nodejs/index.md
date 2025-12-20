+++
title = "Part 9: Neovim debugging for Node.js/TypeScript"
description = "My journey setting up debugging in Neovim. The struggle, the breakthrough, and what finally worked"
template = "post.html"
date = 2025-12-22
generate_feed = true
tags = ["neovim", "debug", "vim-dap", "nodejs", "typescript"]

[extra]
comment = true
reaction = true
toc = true
copy = true
outdate_alert = true
outdate_alert_days = 365
img = "/img/dashboard.webp"
+++

This is part 9 of my Neovim series. Today I share how I finally got debugging to work for Node.js and TypeScript.

Setting up debugging was the hardest part of my Neovim journey. I spent weeks on this. I read the `nvim-dap` documentation multiple times. I tried LazyVim’s configuration. I copied configs from GitHub. Nothing worked right.

I kept switching back to VSCode just to debug my projects. It felt frustrating. What was the point of moving to Neovim if I still needed VSCode?

VSCode makes debugging feel simple. Click “Debug” and it just works. I never really thought about what happens behind the scenes.

Then I finally understood what I was missing: **installing `nvim-dap` isn’t enough. I also needed the debug adapter tool.**

This was the piece of documentation that didn’t explain things clearly.

I think about it like this:

```
Neovim (nvim-dap) ←→ Debug Adapter (vscode-js-debug) ←→ My Node.js code
```

`nvim-dap` talks to the debug adapter. The debug adapter talks to my code. I need both installed and configured.

Once I understood this, everything clicked. Now debugging works great for me.

## The plugins I use

I use 4 plugins for debugging. I don’t like having so many, but this setup is needed for `nvim-dap`. `nvim-dap` is the core plugin that implements the Debug Adapter Protocol. `nvim-dap-ui` provides the visual interface with breakpoints, variables, call stack, and the console. `nvim-nio` is the async I/O library required by `nvim-dap-ui`. And `nvim-dap-virtual-text` shows variable values inline in my code, like VSCode does.

## Installing vscode-js-debug (the missing piece)

This was the step I kept missing. I needed to install the actual debug adapter tool.

For Node.js/TypeScript, I use vscode-js-debug. It's the same debugger VSCode uses. Microsoft made it open source.

Here's how I installed it:

```bash
cd ~
git clone https://github.com/microsoft/vscode-js-debug.git
cd vscode-js-debug
npm install --legacy-peer-deps
npx gulp dapDebugServer
```

This builds the debug adapter from source. Takes a few minutes. After this, I have the debugger at `~/vscode-js-debug/dist/src/dapDebugServer.js`.

I had to build from source because the npm package doesn't include the DAP server file I need. Yeah, it's annoying. But I only did it once.

## My complete setup

Here's my full config:

**File: `lua/plugins/dap.lua`**

```lua
vim.pack.add({
	"https://github.com/mfussenegger/nvim-dap",
	"https://github.com/rcarriga/nvim-dap-ui",
	"https://github.com/nvim-neotest/nvim-nio",
	"https://github.com/theHamsta/nvim-dap-virtual-text",
})

local _dap_initialized = false

local function init_dap()
	if _dap_initialized then
		return
	end

	_dap_initialized = true

	local dap = require("dap")
	local dapui = require("dapui")

	-- Point to vscode-js-debug
	local js_debug_path = vim.fn.expand("$HOME/vscode-js-debug/dist/src/dapDebugServer.js")

	-- Setup the adapter
	dap.adapters["pwa-node"] = {
		type = "server",
		host = "localhost",
		port = "${port}",
		executable = {
			command = "node",
			args = { js_debug_path, "${port}" },
		},
	}

	-- Alias "node" to "pwa-node"
	dap.adapters["node"] = function(cb, config)
		if config.type == "node" then
			config.type = "pwa-node"
		end
		local a = dap.adapters["pwa-node"]
		if type(a) == "function" then
			a(cb, config)
		else
			cb(a)
		end
	end

	-- Debug configurations for JS/TS
	local js_filetypes = { "typescript", "javascript", "typescriptreact", "javascriptreact" }
	for _, ft in ipairs(js_filetypes) do
		dap.configurations[ft] = {
			-- Attach to running Node.js process
			{
				type = "pwa-node",
				request = "attach",
				name = "Attach to Node.js",
				port = 9229,
				address = "localhost",
				localRoot = vim.fn.getcwd(),
				remoteRoot = "/usr/src/app",
				cwd = vim.fn.getcwd(),
				sourceMaps = true,
				protocol = "inspector",
			},
			-- Debug Mocha tests
			{
				type = "pwa-node",
				request = "launch",
				name = "Debug Mocha Tests",
				program = "${workspaceFolder}/node_modules/mocha/bin/_mocha",
				args = {
					"--require",
					"ts-node/register/transpile-only",
					"--require",
					"source-map-support/register",
					"--reporter",
					"spec",
					"--colors",
					"${workspaceFolder}/tests/unit/**/*.[tj]s",
				},
				cwd = vim.fn.getcwd(),
				runtimeExecutable = "node",
				internalConsoleOptions = "openOnSessionStart",
				skipFiles = { "<node_internals>/**" },
				sourceMaps = true,
				protocol = "inspector",
			},
			-- Debug Jest tests
			{
				type = "pwa-node",
				request = "launch",
				name = "Debug Jest Tests",
				program = "${workspaceFolder}/node_modules/jest/bin/jest.js",
				args = { "--runInBand", "--no-cache", "${relativeFile}" },
				cwd = "${workspaceFolder}",
				runtimeExecutable = "node",
				console = "integratedTerminal",
				internalConsoleOptions = "neverOpen",
				sourceMaps = true,
				skipFiles = { "<node_internals>/**" },
			},
		}
	end

	-- DAP UI setup
	dapui.setup({
		icons = { expanded = "▾", collapsed = "▸", current_frame = "*" },
		controls = {
			icons = {
				pause = "⏸",
				play = "▶",
				step_into = "⏎",
				step_over = "⏭",
				step_out = "⏮",
				step_back = "b",
				run_last = "▶▶",
				terminate = "⏹",
				disconnect = "⏏",
			},
		},
	})

	-- Auto-open/close UI
	dap.listeners.after.event_initialized["dapui_config"] = function()
		dapui.open({})
	end
	dap.listeners.before.event_terminated["dapui_config"] = function()
		dapui.close({})
	end
	dap.listeners.before.event_exited["dapui_config"] = function()
		dapui.close({})
	end
	dap.listeners.before.disconnect["dapui_config"] = function()
		dapui.close({})
	end

	-- Virtual text
	require("nvim-dap-virtual-text").setup()
end

-- Keymaps
-- stylua: ignore start
vim.keymap.set("n", "<leader>db", function() init_dap(); require("dap").toggle_breakpoint() end, { desc = "Toggle Breakpoint" })
vim.keymap.set("n", "<leader>dB", function() init_dap(); require("dap").list_breakpoints(); vim.cmd("copen") end, { desc = "List Breakpoints" })
vim.keymap.set("n", "<leader>dc", function() init_dap(); require("dap").continue() end, { desc = "Run/Continue" })
vim.keymap.set("n", "<leader>dC", function() init_dap(); require("dap").run_to_cursor() end, { desc = "Run to Cursor" })
vim.keymap.set("n", "<leader>dg", function() init_dap(); require("dap").goto_() end, { desc = "Go to Line (No Execute)" })
vim.keymap.set("n", "<leader>di", function() init_dap(); require("dap").step_into() end, { desc = "Step Into" })
vim.keymap.set("n", "<leader>dj", function() init_dap(); require("dap").down() end, { desc = "Down" })
vim.keymap.set("n", "<leader>dk", function() init_dap(); require("dap").up() end, { desc = "Up" })
vim.keymap.set("n", "<leader>dl", function() init_dap(); require("dap").run_last() end, { desc = "Run Last" })
vim.keymap.set("n", "<leader>do", function() init_dap(); require("dap").step_out() end, { desc = "Step Out" })
vim.keymap.set("n", "<leader>dO", function() init_dap(); require("dap").step_over() end, { desc = "Step Over" })
vim.keymap.set("n", "<leader>dP", function() init_dap(); require("dap").pause() end, { desc = "Pause" })
vim.keymap.set("n", "<leader>dr", function() init_dap(); require("dap").repl.toggle() end, { desc = "Toggle REPL" })
vim.keymap.set("n", "<leader>ds", function() init_dap(); require("dap").session() end, { desc = "Session" })
vim.keymap.set("n", "<leader>dt", function()
	init_dap()
	require("dap").terminate()
	vim.defer_fn(function()
		require("dapui").close({})
	end, 100)
end, { desc = "Terminate" })
vim.keymap.set("n", "<leader>dw", function() init_dap(); require("dap.ui.widgets").hover() end, { desc = "DAP Widgets" })
vim.keymap.set("n", "<leader>du", function() init_dap(); require("dapui").toggle({}) end, { desc = "Dap UI" })
-- stylua: ignore end
```

That's my complete debugging setup. Let me explain the important parts.

## Understanding the adapter setup

This part confused me for a long time:

```lua
local js_debug_path = vim.fn.expand("$HOME/vscode-js-debug/out/src/dapDebugServer.js")

dap.adapters["pwa-node"] = {
	type = "server",
	host = "localhost",
	port = "${port}",
	executable = {
		command = "node",
		args = { js_debug_path, "${port}" },
	},
}
```

This tells nvim-dap how to start the debug adapter. I point to where I installed vscode-js-debug, and tell it to run with Node.js.

The name "pwa-node" is what vscode-js-debug calls its Node.js adapter internally. "pwa" stands for "progressive web app" but it works for regular Node.js too. I'm using the same naming convention as VSCode uses.

I also create an alias so I can use `type = "node"` in my debug configs if I want.

## My debug configurations

I set up 3 different scenarios based on what I debug most.

### Attaching to a running process

```lua
{
	type = "pwa-node",
	request = "attach",
	name = "Attach to Node.js",
	port = 9229,
	address = "localhost",
	localRoot = vim.fn.getcwd(),
	remoteRoot = "/usr/src/app",
	cwd = vim.fn.getcwd(),
	sourceMaps = true,
	protocol = "inspector",
}
```

I use this when my Node.js app is already running with debugging enabled. Like when I start my app with `node --inspect=9229 server.js`. Or when I debug inside Docker with `docker run -p 9229:9229 my-image node --inspect=0.0.0.0:9229 app.js`.

The `localRoot` and `remoteRoot` settings are really useful for Docker debugging. localRoot is where my code is on my machine, remoteRoot is where the code is inside Docker. This maps the file paths so breakpoints work correctly. When I set a breakpoint in my local file, DAP knows where that corresponds to inside the container.

I had to adjust remoteRoot to match my Docker setup. Usually I check my Dockerfile to see where the code gets copied.

### Launching Mocha tests

```lua
{
	type = "pwa-node",
	request = "launch",
	name = "Debug Mocha Tests",
	program = "${workspaceFolder}/node_modules/mocha/bin/_mocha",
	args = {
		"--require", "ts-node/register/transpile-only",
		"--require", "source-map-support/register",
		"--reporter", "spec",
		"--colors",
		"${workspaceFolder}/tests/unit/**/*.[tj]s",
	},
	-- ...
}
```

This is for debugging my Mocha tests with TypeScript. The `request = "launch"` means it starts the test runner with debugging enabled. I had to adjust the args to match my test setup, the paths depend on where I keep my tests.

### Launching Jest tests

Similar setup for Jest. The `--runInBand` flag runs tests one at a time, which makes debugging easier.

I learned that these configs use the same format as VSCode's launch.json. So when I found working configs in VSCode, I could copy them directly to Neovim. That saved me a lot of trial and error.

## Auto-opening the UI

I set up the UI to open and close automatically:

```lua
dap.listeners.after.event_initialized["dapui_config"] = function()
	dapui.open({})
end

dap.listeners.before.event_terminated["dapui_config"] = function()
	dapui.close({})
end
```

When I start debugging, the UI appears showing variables, call stack, breakpoints, and console. When I stop, it closes. Keeps my workspace clean.

The virtual text plugin shows variable values right in my code, like VSCode does. Really helpful because I can see what's happening without switching to the variables panel.

## How I use it

Here's my typical debugging workflow.

I open a file and press `<leader>db` on lines where I want to stop. Red dots appear showing my breakpoints.

Then I press `<leader>dc` to start debugging. I select which configuration to use, Attach, Mocha, or Jest.

The debug UI opens and my code runs until it hits a breakpoint.

From there I use `<leader>dO` to step over the current line, `<leader>di` to step into a function, `<leader>do` to step out, or `<leader>dc` to continue to the next breakpoint. I can hover over variables to see their values, or check the variables panel in the UI.

When I'm done, I press `<leader>dt` to stop debugging. The UI closes automatically.

## Debugging my Docker containers

This is one of my favorite features. Here's how I debug code running in Docker.

I start my container with debugging enabled:

```bash
docker run -p 9229:9229 -p 3000:3000 my-image \
  node --inspect=0.0.0.0:9229 dist/server.js
```

In Neovim, I set breakpoints in my TypeScript source files. Then I press `<leader>dc` and select "Attach to Node.js".

When I hit my API endpoint with curl, the debugger stops at my breakpoint. I can step through my TypeScript code even though it's running compiled JavaScript inside Docker.

This works because of the localRoot/remoteRoot mapping. DAP translates the paths between my machine and the container.

## My keymaps

All my debug keymaps start with `<leader>d`.

For breakpoints I use `<leader>db` to toggle and `<leader>dB` to list all of them.

For navigation, `<leader>dc` continues or starts debugging, `<leader>dC` runs to cursor, `<leader>di` steps into, `<leader>do` steps out, and `<leader>dO` steps over.

For control, `<leader>dP` pauses, `<leader>dt` terminates, and `<leader>dl` runs the last configuration again.

For UI, `<leader>du` toggles the debug UI, `<leader>dr` toggles REPL, and `<leader>dw` shows hover widgets.

My though:

The debugging works well for me, but it's not exactly like VSCode.

I miss the inline "Run | Debug" links above my functions. I can't expand object properties directly in the editor buffer, I have to use the UI panel. And hovering over variables feels less smooth than VSCode.

But what works great is setting breakpoints and stepping through code, the variables panel shows everything I need, Docker debugging works perfectly, I can have multiple debug configurations, and virtual text shows values inline.

For me, this covers about 90% of what I need. The other 10% is polish. I'm okay with that to stay in Neovim.

## Debugging other languages

This article is about Node.js/TypeScript because that's what I use most. But I learned the pattern is the same for other languages.

For each language, I need to find the right debug adapter (like debugpy for Python, delve for Go, lldb for Rust), install it, and configure it using the same pattern as I did for Node.js.

The [nvim-dap wiki](https://github.com/mfussenegger/nvim-dap/wiki/Debug-Adapter-installation) has instructions for many languages.

If anyone wants to set up debugging for another language, or if something doesn't work for you, feel free to drop a comment. We can figure it out together.

## What's next

Now you have:

- Basic setup ([part 2](https://tduyng.com/blog/neovim-basic-setup/))
- LSP ([part 3](https://tduyng.com/blog/neovim-lsp-native/))
- Setup vim.pack with snacks.nvim ([part 4](https://tduyng.com/blog/vim-pack-and-snacks/))
- Tree-sitter syntax highlighting ([part 5](https://tduyng.com/blog/neovim-highlight-syntax))
- Auto-completion ([part 6](https://tduyng.com/blog/neovim-auto-completions/))
- Code formatter ([part 7](https://tduyng.com/blog/neovim-formatter-conform/))
- Git tools ([part 8](/blog/neovim-git-tools/))
- Setup debug (this article)

In the next article, I'll share how I enhanced my editing experience with flash.nvim, yanky.nvim, and grug-far.nvim.

---

My complete Neovim configuration: [https://github.com/tduyng/nvim](https://github.com/tduyng/nvim)

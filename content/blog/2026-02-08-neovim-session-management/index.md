+++
title = "Simple Neovim Session Management VSCode style"
description = "Native Neovim session management that works like VSCode: automatic save and restore per project"
template = "post.html"
date = 2026-02-08
generate_feed = true
tags = ["neovim", "productivity"]
series = "neovim"
series_order = 12

[extra]
comment = true
reaction = true
toc = true
copy = true
outdate_alert = true
outdate_alert_days = 365
img = "/img/dashboard.webp"
+++

In VSCode, I got used to running `code .` in a project folder and having all my files, windows, and layout restore automatically. When I switched to Neovim, that convenience was gone.

I tried `persistence.nvim` from `folke` because I always like his plugins, but it didn't do what I needed. I looked at others and couldn't find one that matched VSCode's behavior.

Then I discovered that Neovim already has `:mksession` built-in. With some basic autocmds and Lua, we can replicate VSCode's session management.

That means we could have something like:

- Automatic session save when you exit Neovim
- Automatic session restore when you open Neovim in a project directory (with no file arguments)
- A session picker to switch between projects
- A "last session" shortcut to jump back to most recent work
- Option to skip saving for a particular session

## The configuration

Put this in `~/.config/nvim/lua/config/session.lua`:

```lua
vim.opt.sessionoptions = "buffers,curdir,folds,help,tabpages,winsize,winpos,terminal,localoptions"

local session_dir = vim.fn.stdpath("state") .. "/sessions/"
if vim.fn.isdirectory(session_dir) == 0 then
  vim.fn.mkdir(session_dir, "p")
end

local function get_session_file()
  local cwd = vim.fn.getcwd()
  local session_name = cwd:gsub("/", "%%")
  return session_dir .. session_name .. ".vim"
end

local function get_last_session_file()
  return session_dir .. "last_session.vim"
end

vim.api.nvim_create_autocmd("VimEnter", {
  callback = function()
    if vim.fn.argc() == 0 then
      local session_file = get_session_file()
      if vim.fn.filereadable(session_file) == 1 then
        vim.cmd("silent! set winminwidth=1 winwidth=1 winminheight=1 winheight=1")
        vim.cmd("source " .. vim.fn.fnameescape(session_file))
      end
    end
  end,
})

vim.api.nvim_create_autocmd("VimLeavePre", {
  callback = function()
    local stop_file = session_dir .. ".stop_saving"
    if vim.fn.filereadable(stop_file) == 1 then
      vim.fn.delete(stop_file)
      return
    end

    local buf_count = 0
    for _, buf in ipairs(vim.api.nvim_list_bufs()) do
      if vim.api.nvim_buf_is_loaded(buf) and vim.api.nvim_buf_get_name(buf) ~= "" then
        buf_count = buf_count + 1
      end
    end

    if buf_count >= 1 then
      local session_file = get_session_file()
      vim.cmd("mksession! " .. vim.fn.fnameescape(session_file))
      vim.cmd("mksession! " .. vim.fn.fnameescape(get_last_session_file()))
    end
  end,
})

vim.keymap.set("n", "<leader>qs", function()
  local session_file = get_session_file()
  if vim.fn.filereadable(session_file) == 1 then
    vim.cmd("source " .. vim.fn.fnameescape(session_file))
  else
    print("No session found")
  end
end, { desc = "Load session" })

vim.keymap.set("n", "<leader>ql", function()
  local last_session = get_last_session_file()
  if vim.fn.filereadable(last_session) == 1 then
    vim.cmd("source " .. vim.fn.fnameescape(last_session))
  else
    print("No last session found")
  end
end, { desc = "Load last session" })

vim.keymap.set("n", "<leader>qS", function()
  local sessions = {}
  local session_files = vim.fn.glob(session_dir .. "*.vim", false, true)

  for _, file in ipairs(session_files) do
    local name = vim.fn.fnamemodify(file, ":t:r")
    name = name:gsub("%%", "/")
    table.insert(sessions, name)
  end

  if #sessions == 0 then
    print("No sessions found")
    return
  end

  vim.ui.select(sessions, { prompt = "Select session:" }, function(choice)
    if choice then
      local session_file = session_dir .. choice:gsub("/", "%%") .. ".vim"
      vim.cmd("source " .. vim.fn.fnameescape(session_file))
    end
  end)
end, { desc = "Select session" })

vim.keymap.set("n", "<leader>qd", function()
  local stop_file = session_dir .. ".stop_saving"
  vim.fn.writefile({}, stop_file)
  print("Session saving disabled")
end, { desc = "Disable session saving" })
```

## Keymaps

The config adds these keymaps:

- `<leader>qs` – Load session for current directory
- `<leader>ql` – Load last session
- `<leader>qS` – Pick and load any session
- `<leader>qd` – Disable auto-save for this project

## How it works

The native `:mksession` command saves everything about current Neovim state: open buffers, window layout, cursor positions, etc. The `sessionoptions` setting controls what gets saved. By setting it to include buffers, curdir, tabpages, winsize, etc., we get a complete snapshot.

The autocmds handle the automation:

- `VimEnter` with `argc() == 0` ensures we only auto-restore when Neovim was started without specific files
- `VimLeavePre` saves on exit, but only if there are real file buffers (not just empty Neovim)

The dual session files (project-specific + `last_session.vim`) give both per-project restore and a quick way to jump back to whatever you were last working on.

### Directory location

`stdpath("state")` returns Neovim's state directory. On Linux: `~/.local/state/nvim/`. On macOS: `~/Library/Application Support/nvim/`. This follows Neovim conventions.

### Path encoding

`cwd:gsub("/", "%%")` converts a directory path to a valid filename. The `/` character becomes `%`. For example, `/home/user/project` becomes `%home%user%project.vim`.

When reading back we reverse it: `name:gsub("%%", "/")`. The `%%` pattern matches a literal `%` in Lua. This works because `%` is not commonly used in path names.

### Auto-restore

The `VimEnter` autocmd runs when Neovim finishes starting. It checks `vim.fn.argc() == 0` (no files were given on command line). If a session file exists for the current directory, it sources it. The `winminwidth`/`winminheight` settings before sourcing help prevent layout issues.

### Auto-save

`VimLeavePre` runs before Neovim exits. It checks for a `.stop_saving` marker file; if found, it deletes the marker and returns without saving. Otherwise it counts loaded buffers with actual filenames. If at least one exists, it writes two session files: the project-specific one and `last_session.vim`.

### Session picker

`<leader>qS` uses `vim.ui.select` to show a list of all session files. It converts the encoded filenames back to normal paths for display. If you have a picker plugin (Telescope, snacks.picker), it will use that. Otherwise it uses the default command-line prompt.

### Opt-out

`<leader>qd` creates an empty `.stop_saving` file. The next time you exit Neovim, the save function sees this file, deletes it, and skips saving. This lets you temporarily disable auto-save for one session.

## Using it

```bash
# First time in a project
cd ~/projects/api
nvim   # starts clean, no session

# Edit files, split windows, etc.
# Exit with :qa
# Session is saved automatically

# Next time, same directory
cd ~/projects/api
nvim   # session restores automatically

# From any project, jump to most recently used
<leader>ql

# See all sessions and pick one
<leader>qS
```

Session files are stored in `~/.local/state/nvim/sessions/` (Linux) or `~/Library/Application Support/nvim/sessions/` (macOS). They have `%` in the filename.

## Limitations

- Contains absolute paths. Moving a project directory breaks the session.
- No git branch support – all branches in same directory share one session.
- Path escaping assumes `/` as separator. Windows would need different handling.
- Sessions stored centrally, not in project directory.
- Won't work with remote SSH sessions because session directory is local.

If you need branch-aware sessions, project-local files, or more features, you can try a plugin in [this list](https://github.com/rockerBOO/awesome-neovim?tab=readme-ov-file#session)

---

My complete Neovim configuration: [tduyng/nvim](https://github.com/tduyng/nvim)

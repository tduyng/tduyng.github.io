+++
title = "I built a WakaTime alternative that lives inside Neovim"
description = "Local-first coding tracker with beautiful dashboard. All data stays on your machine."
template = "post.html"
date = 2026-02-28
generate_feed = true
tags = ["neovim", "productivity", "privacy", "open-source"]
draft = true


[extra]
comment = true
reaction = true
toc = true
copy = true
outdate_alert = true
outdate_alert_days = 365
img = "img/codeme-dashboard.webp"
+++

I used WakaTime in the past. It was great at first - seeing exactly how much I coded, which languages I used, which projects took most of my time. But slowly, something started bothering me.

Every keystroke, every file I opened, every project I worked on - all sent to WakaTime's cloud. Stored on their servers. Forever.

That didn't feel right for client projects or proprietary code. And honestly, I wanted something cleaner - no account, no cloud, just tracking.

I also looked for a Neovim-native solution with a dashboard built right into the editor. Something that shows your coding stats directly in Neovim, not in a browser. I couldn't find anything like that. Most trackers either send data to the cloud or just don't have a good visual dashboard.

So I built [codeme](https://github.com/tduyng/codeme).

## Why track your coding?

People track their coding for different reasons. Some find it motivating - streaks, goals, and seeing progress feels good. Others use it to understand their patterns: which languages they use most, what time of day they're most productive, which projects consume their time. Freelancers bill clients. Developers reflect on their growth.

But tracking can also feel like surveillance. You might obsess over metrics instead of doing actual work. And cloud-based trackers raise privacy concerns - your code patterns, project names, file paths all leave your machine.

Codeme's approach: it's there when you want it, invisible when you don't. No pressure, no external eyes. Just your data, on your machine.

## What is codeme?

A private coding tracker with two parts:

1. **codeme** - Go CLI with SQLite (the backend)
2. **codeme.nvim** - Lua plugin for Neovim (the dashboard)

The key difference: everything stays on your machine. No cloud, no account, no third parties.

## Zero config - it just works

This was my main goal: no configuration needed.

WakaTime requires:

- Creating an account
- Generating an API key
- Adding the key to your editor config
- Configuring which projects to track
- Setting up the dashboard online

Codeme requires:

- Install the binary
- Add the plugin
- Start coding

That's it.

No API keys. No accounts. No config files. No options to tweak. It works out of the box.

## Auto-detection

Codeme figures things out automatically:

- **Project** - Detected from git root. Open any file in a repo, it knows which project you're working on.
- **Language** - Detected from file extension. `.py` → Python, `.ts` → TypeScript, `.rs` → Rust. No manual selection.
- **Branch** - Automatically tracks which git branch you're on.
- **Lines** - Counts what you actually wrote, not total file size.

You don't tell codeme anything. It just knows.

## Automatic tracking

Most trackers require manual start/stop. Codeme tracks automatically:

- **On save** - Every time you write a file, it records the session
- **On buffer enter** - Lightweight presence when you switch files
- **Idle detection** - 15-minute timeout groups your work into sessions

You open Neovim → you code → you close Neovim. That's the entire workflow. No `codeme start`, no `codeme stop`. Nothing to remember.

## Beautiful dashboard that adapts

The dashboard opens with `:CodeMe`. Five tabs:

- 📊 Dashboard - goals, streaks, overview
- ⏰ Activity - today's sessions, languages, files
- 📅 Weekly - daily breakdown, trends
- 📁 Work - projects and languages breakdown
- 🏆 Records - achievements and personal bests

Here's the thing: it auto-detects your colorscheme. Dark theme, light theme, any theme - the dashboard just matches. No config needed, no theme files to create.

<br/>
<img src="img/dashboard-overview.webp" alt="codeme dashboard overview showing goals and streaks" loading="lazy">
<figcaption style="font-size: 0.8em; color: gray; margin-top: 4px; text-align: center;">Dashboard overview with goals and streaks</figcaption>
<br/>

## Fun & motivating dashboard

The dashboard doesn't just show numbers - it celebrates your coding journey.

**Career level:** Based on total hours, you level up from 🌱 Rising to 👑 Legendary. Shows your current level and hours to next with a progress bar.

**Personal records:** Your best day, longest session, most lines, and best streak. See when they happened.

**Fun facts:** Your earliest start time, latest end time, and your most polyglot day. Surprise yourself.

**Challenges:** Personalized goals based on your stats:

- "2 hours more to beat your best day"
- "5 more days to beat your streak record"
- "Can you beat 6 hours in one session?"

**Achievements:** Over 30 badges across categories:

- **Streaks** from 🔥 5 days to 🌞 365 days
- **Lines** from 🌧️ 1K to 🌊 100K
- **Hours** from ⚡ 50h to 💡 20K hours
- **Languages** from 🚀 2 to 🎓 15 languages
- **Sessions** from ☕ 2h to 👑 12h
- **Time habits** like 🌅 Dawn Coder and 🌌 Night Coder

The Records tab shows unlocked badges, locked ones, and your completion percentage.

This makes tracking feel like a game. You're chasing milestones, breaking records, leveling up.

<br/>
<img src="img/achievements.webp" alt="achievements tab showing unlocked badges and progress" loading="lazy">
<figcaption style="font-size: 0.8em; color: gray; margin-top: 4px; text-align: center;">Achievements tab - track your unlocked badges</figcaption>
<br/>

## Why Go?

I chose Go for the backend because:

- **Fast** - Compiled language, starts instantly
- **Small binaries** - Single file, easy to distribute
- **Great for CLI** - Standard library has everything needed
- **SQLite support** - `mattn/go-sqlite3` works perfectly

Why not Rust? I just found Go easier to work with. Both are valid - Go fit my brain better.

## One file. Your data.

All your coding history lives in:

```
~/.local/share/codeme/codeme.db
```

One SQLite file. That's it.

- Want to back it up? Copy the file.
- Want to move to another machine? Copy the file.
- Want to delete everything? Delete the file.
- Want to inspect your data? Open with any SQLite client.

No cloud sync. No hidden folders. No complex directory structure. Just one file you own.

## Works offline

Since everything is local:

- No internet required
- No cloud service to fail
- Works on airplane mode
- Works in restricted networks
- No external dependencies

Your data never leaves your machine. Ever.

<br/>
<img src="img/activity.webp" alt="activity tab showing today's coding sessions and languages" loading="lazy">
<figcaption style="font-size: 0.8em; color: gray; margin-top: 4px; text-align: center;">Activity tab - see what you worked on today</figcaption>
<br/>

## What does it track?

Just the basics: which file you edited, which project it belongs to, how many lines you added, and when. No file contents. No code snippets. No sensitive data. The tracking is deliberately minimal.

You can see exactly what's stored in your database at any time.

## Does it slow down Neovim?

No. The tracking is lightweight: a simple SQLite write on file save, and a quick check on buffer enter. The binary starts in milliseconds. The dashboard only loads when you open it.

Most users won't notice it's running.

## Can I see my data?

Yes. Your data is in a plain SQLite file. Open it with any SQLite client or query it directly:

```bash
sqlite3 ~/.local/share/codeme/codeme.db "SELECT * FROM sessions LIMIT 10;"
```

Or use a GUI like DB Browser for SQLite. Your data is fully transparent.

## What about goals?

You can set daily goals in the config:

```lua
require("codeme").setup({
  goals = {
    daily_hours = 4,
    daily_lines = 500,
  },
})
```

Set to 0 to disable. The dashboard shows your progress visually. Simple.

## Using codeme

Install the binary:

```bash
# macOS
curl -L https://github.com/tduyng/codeme/releases/latest/download/codeme_darwin_arm64.tar.gz | tar xz
sudo mv codeme /usr/local/bin/

# Linux
curl -L https://github.com/tduyng/codeme/releases/latest/download/codeme_linux_amd64.tar.gz | tar xz
sudo mv codeme /usr/local/bin/
```

Add the Neovim plugin:

```lua
{ "tduyng/codeme.nvim", cmd = { "CodeMe", "CodeMeToggle" }, config = function() require("codeme").setup() end }
```

That's it. Start coding. It tracks automatically.

```vim
:CodeMe
:CodeMeToggle
```

Add a keybinding:

```lua
vim.keymap.set("n", "<leader>cm", "<cmd>CodeMe<cr>")
```

<br/>
<img src="img/neovim-with-codeme.webp" alt="Neovim with codeme dashboard open" loading="lazy">
<figcaption style="font-size: 0.8em; color: gray; margin-top: 4px; text-align: center;">The codeme dashboard open inside Neovim</figcaption>
<br/>

## Try it

If you've wanted to track your coding without sending data to the cloud, try codeme. Takes 2 minutes to set up.

Your coding history should stay yours.

---

**Links:**

- codeme CLI: [github.com/tduyng/codeme](https://github.com/tduyng/codeme)
- codeme.nvim: [github.com/tduyng/codeme.nvim](https://github.com/tduyng/codeme.nvim)
- My Neovim config: [github.com/tduyng/nvim](https://github.com/tduyng/nvim)

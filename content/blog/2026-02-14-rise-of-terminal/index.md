+++
title = "The Rise of Terminal Tools"
description = "The story of how Rust, Go, Zig, and AI brought the terminal back, and why developers are choosing terminal workflows over GUI editors."
template = "post.html"
date = 2026-02-14
generate_feed = true
tags = ["neovim", "cli", "terminal", "ai"]

[extra]
comment = true
reaction = true
toc = true
copy = true
outdate_alert = true
outdate_alert_days = 365
img = "img/terminal.webp"
+++

TL;DR: Terminal tools got better. Rust made CLI tools fast. AI agents need terminal to work everywhere. Neovim became easier to use. All these trends converged.

---

## The CLI revolution

The story starts in 2016 with Andrew Gallant ([BurntSushi](https://github.com/BurntSushi)) testing Rust's regex engine. He wrote [ripgrep](https://github.com/BurntSushi/ripgrep) as a benchmark, not to replace grep, just to see if Rust could be faster.

The result: ripgrep was 10x faster. Sometimes 100x faster.

BurntSushi published [detailed benchmarks](https://blog.burntsushi.net/ripgrep) showing ripgrep outperforms grep, ag, and git grep. The Hacker News discussion exposed the tool to a wider audience. Some celebrated: "Finally, a rewrite in Rust that actually delivers!" Others pointed out missing features.

Once developers tried it, they noticed the difference. Why wait 30 seconds for `grep -r` when `rg` took 2 seconds?

Today ripgrep is downloaded millions of times. Companies like Amazon, Google, and Microsoft use it in CI/CD pipelines.

Ripgrep started a wave. Developers asked: if grep got faster, what about cat? ls? find? What about other daily tasks? Then a new generation of CLI tools appeared, built with Rust and Go for performance and cross-platform compatibility: bat, eza, fd, zoxide, atuin, uv, yazi, btop, fzf, lazygit, lazydocker, k9s ...etc.

They rebuild core Unix tools or create new developer tools with better UX, modern features, and consistent interfaces. These tools weren't just replacements, they were upgrades.

On Hacker News, "rewrite it in Rust" became a running joke. But these tools proved the point. They were genuinely better: faster, prettier, and more intuitive out of the box.

See the [curated list of Rust CLI tools](https://github.com/sts10/rust-command-line-utilities) for hundreds more examples.

## The terminal emulator renaissance

It wasn't just the tools inside terminals. The terminals themselves got dramatically better.

For decades, terminals looked and worked basically the same. Then a new generation appeared:

- [Kitty](https://sw.kovidgoyal.net/kitty/) (python) - GPU-accelerated, feature-rich, zero latency
- [WezTerm](https://wezfurlong.org/wezterm/) (rust) - cross-platform, highly configurable, GPU-accelerated
- [Alacritty](https://github.com/alacritty/alacritty) (rust) - GPU-based, simple, fast
- [Warp](https://warp.dev/) (rust) - AI-powered, collaborative, beautiful UI
- [Ghostty](https://ghostty.org/) (Zig) - written by Mitchell Hashimoto (founder of HashiCorp)

These terminals support ligatures, splits, scrollback, modern themes, and even GPU rendering. They are as polished as any GUI app. The old black and white terminal is gone.

## The Age of AI

With terminals now beautiful and performant, a new opportunity emerged. Around 2024-2025, AI coding assistants moved into the terminal, not just as editor plugins but as standalone CLI tools.

Claude Code launched as a CLI that lives in your terminal. It can read large codebases, propose plans, edit files, run tests, and make commits without requiring a graphical editor.

This made autonomous coding practical anywhere: over SSH, inside Docker containers, and on cloud VMs. No GUI is needed.

GitHub Copilot CLI, Gemini CLI, OpenCode, and Mistral CLI soon followed.

The AI coding race shifted toward the terminal because that is where developers can work consistently across environments. Tools like Cursor and Windsurf are powerful but tied to VSCode style ecosystems, while terminal based AI can follow you everywhere.

This created a powerful incentive: if you want AI to use your tool, build a CLI.

CLI tools are perfect for AI agents. They follow the Unix philosophy: do one thing well, work with pipes. They work the same on any machine, laptop, server, container, or cloud VM. They have clear input/output and error codes that AI understands.

Anthropic's Agent Skills let you teach Claude how to use your tools, making the pattern explicit. Companies and developers took notice. Tool vendors across the board started building CLI interfaces so AI assistants could orchestrate their workflows:

- **Playwright** released a proper CLI for browser automation, now AI agents can control browsers programmatically
- **GitHub CLI** kept improving, now you can manage PRs, reviews, and issues entirely from the terminal

Peter Steinberger, known for useful iOS tools and the AI project openclaw, started releasing CLI tools specifically for AI integration. His projects like Peekaboo, gocli, and blucli demonstrate the pattern: small, focused CLIs that AI can easily call and compose into larger workflows.

The community embraced this shift. On social media, developers shared their CLI-first tools for AI projects. The message was clear: the future is terminal native AI. If your tool speaks CLI, AI agents can work with it anywhere: local machines, remote servers, containers, cloud VMs.

## Why terminal editors (and Neovim) win now

VSCode, IntelliJ, and Cursor are powerful tools. But they share a common weakness: they need a GUI, consume significant resources, and fall apart on remote servers.

This matters more than ever. From the Stack Overflow 2024 developer survey:

- VSCode dominates with 74% usage, but that comes with high memory and CPU demands
- Neovim is the most admired code editor, highest percentage of users want to keep using it
- Vim and Neovim together claim ~33% of the market, rivals any single GUI editor

Source: [stackoverflow.co/survey](https://survey.stackoverflow.co/2024/technology#most-popular-technologies-new-collab-tools-prof)

Terminal editors offer something different: speed and portability. They start in ~100ms, use ~80MB RAM, and work identically on your laptop, a remote server, or inside a container.

### Freedom and control

VSCode is free, but owned by Microsoft. Cursor is powerful, but locked to their platform.

Terminal tools are mostly open source. You can inspect the code, fork it, modify it, and ship changes. No licensing headaches. No vendor lock-in. Your tools work on any machine without restrictions.

This is not just philosophy, it is about practical freedom. When your editor runs everywhere, you are not dependent on specific environments or cloud services.

### Neovim's modern renaissance

Neovim in 2025 is dramatically easier and more capable:

**Built-in modern features:**

- Native LSP (Language Server Protocol) - code intelligence without heavy plugins
- vim.pack - built-in package manager for plugins (v0.12+)
- Improved UI - native tabline, statusline, color support, floating windows
- Treesitter integration - better syntax highlighting
- Terminal mode - run terminal inside Neovim
- Lua configuration - modern, approachable scripting (no more Vimscript complexity)

**Easy setup with distributions:**

- LazyVim - batteries-included, works out of the box
- Kickstart.nvim - minimal starter that teaches you as you go
- NvChad - beautiful, highly configured
- AstroNvim - modern, opinionated, feature-rich

**Community support:**

- Thousands of dotfiles on GitHub to learn from
- AI assistants like Claude Code can help you configure and troubleshoot Neovim
- Active Discord/Reddit communities

The traditional learning curve has disappeared. You can have a fully functional development environment installed and configured in under 10 minutes.

For teams, Neovim's portability means every developer uses the same tools the same way, whether on macOS, Linux, Windows, or working remotely via SSH.

## The right moment

All these trends converged at the right moment:

1. Rust/Go/Zig built fast, reliable, cross-platform CLI tools
2. AI agents demand terminal native workflows (they need to run everywhere)
3. Terminals became beautiful (GPU rendering, ligatures, themes)
4. Neovim matured (Lua, LSP, stable ecosystem, great defaults)
5. Community configs made setup trivial
6. Skills made terminal tools AI-ready

The terminal never left. It just got better while we were not looking.

If you are still using heavy GUI editors, ask yourself: what does your workflow look like on a remote server at 2am?

The terminal represents something simple: your tools work everywhere. Your AI works everywhere. Your skills are portable.

That is freedom. And that is why developers are returning.

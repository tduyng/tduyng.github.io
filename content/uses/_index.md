+++
title = "Uses"
description = "Tools, software, and hardware I use daily"
template = "prose.html"
generate_feed = false

[extra]
lang = 'en'
comment = true
reaction = true
+++

# What I Use

A curated list of tools, software, and hardware that power my daily workflow.

---

## 💻 Hardware

### Computer

- **MacBook Pro M4** - Apple Silicon is incredible for development
- **HP 27-inch Monitor** - Simple, reliable external display

### Peripherals

- **Logitech MX Mechanical Mini** - Quiet mechanical keyboard with perfect tactile feedback
- **Apple AirPods** - Seamless integration with macOS

---

## ⚡ Terminal Setup

### Terminal Emulator

- **[Ghostty](https://github.com/ghostty-org/ghostty)** 💚 - Built with Zig, fast, modern and easy to configure
- Past: Wezterm, iTerm2, Warp

### Shell & Prompt

- **[Fish Shell](https://fishshell.com/)** - Auto-suggestions and syntax highlighting out of the box
- **[Starship](https://starship.rs/)** - Fast, customizable prompt that works across all shells
- **Zsh** - Used in the past, still great

---

## 🛠️ Editor & Coding

- **[Neovim](https://neovim.io/)** 💚 - My main editor for everything now
- **[VSCode](https://code.visualstudio.com/) + Vim Extension** - Rarely used, but handy for debugging or git conflicts
- **[OpenCode](https://opencode.ai/)** - AI coding assistant in the terminal, alternative to Claude Code, connects with GitHub Copilot
- Past: IntelliJ, Zed, Helix, Vim

---

## 🚀 CLI Tools

Modern CLI tools (mostly Rust 🦀 and Go):

- **[Zoxide](https://github.com/ajeetdsouza/zoxide)** 💚 - Smarter `cd`, haven't typed full paths in over a year
- **[Fzf](https://github.com/junegunn/fzf)** 💚 - Fuzzy finder for everything
- **[Atuin](https://github.com/atuinsh/atuin)** 💚 - Magical shell history with sync across machines
- **[Yazi](https://github.com/sxyazi/yazi)** - Blazing fast terminal file manager written in Rust
- **[Eza](https://github.com/eza-community/eza)** - Modern `ls` with colors
- **[Fd](https://github.com/sharkdp/fd)** - Faster, friendlier `find`
- **[Ripgrep](https://github.com/BurntSushi/ripgrep)** - Lightning-fast code search
- **[Bat](https://github.com/sharkdp/bat)** - `cat` with syntax highlighting
- **[Jq](https://github.com/jqlang/jq)** - JSON processor
- **[Hyperfine](https://github.com/sharkdp/hyperfine)** - Benchmarking tool
- **[Bottom](https://github.com/ClementTsang/bottom)** - Graphical process/system monitor
- **[UV](https://github.com/astral-sh/uv)** - Fast Python package installer
- **[Direnv](https://direnv.net/)** - Auto environment switching per directory

---

## 🌳 Version Control

- **[Lazygit](https://github.com/jesseduffield/lazygit)** 💚 - Terminal UI for Git
- **[Git Delta](https://github.com/dandavison/delta)** - Beautiful diffs with syntax highlighting
- **[Git Cliff](https://github.com/orhun/git-cliff)** - Automated changelog generator
- **Git + Fzf** - Interactive branch switching and management

---

## 🎨 Window Management

- **[Aerospace](https://github.com/nikitabobko/aerospace)** 💚 - Tiling window manager for macOS. Keyboard-driven workspaces: Coding (C), Terminal (T), Browser (B), Music (M)
- **[Homerow](https://www.homerow.app/)** - Keyboard shortcuts for every button in macOS
- Past: Rectangle, Raycast

---

## 📦 Package Management

- **[Nix](https://nixos.org/)** 💚 - Reproducible package management
- **[nix-darwin](https://github.com/LnL7/nix-darwin)** - Nix integration for macOS
- **[Homebrew](https://brew.sh/)** - Works alongside Nix via nix-darwin

---

## 🐳 Containers & Kubernetes

- **[Docker](https://www.docker.com/)** - Container runtime with Docker Compose and Buildx
- **[Podman](https://podman.io/)** + **[Podman Desktop](https://podman-desktop.io/)** - Daemonless alternative
- **[Kubectl](https://kubernetes.io/docs/reference/kubectl/)** - Kubernetes CLI
- **[Kind](https://kind.sigs.k8s.io/)** - Local Kubernetes clusters
- **[Helm](https://helm.sh/)** - Kubernetes package manager

---

## 🗂️ Dotfiles

- **[Nix](https://nixos.org/)** 💚 - Now using Nix to manage symlinks
- **[GNU Stow](https://www.gnu.org/software/stow/)** - Used before switching to Nix

---

## 🌐 Browser

- **[Zen Browser](https://zen-browser.app/)** 💚 - Firefox-based, privacy-focused, beautifully designed
- **[Vimium](https://github.com/philc/vimium)** 💚 - Vim keybindings for the browser, navigate without the mouse
- Past: Arc, Firefox, Chrome, Safari

---

## 💚 Languages & Runtimes

- **[TypeScript](https://www.typescriptlang.org/)** - Daily driver for my work
- **[Go](https://go.dev/)** 💚 - Built [gozzi](https://github.com/tduyng/gozzi) with it, love its simplicity
- **[Zig](https://ziglang.org/)** 💚 - Exciting modern and simple systems language
- **[Rust](https://www.rust-lang.org/)** - Most of my favorite CLI tools are written in Rust
- **[Python](https://www.python.org/)** - Scripting and automation
- **[Lua](https://www.lua.org/)** - Neovim configuration
- **[Node.js](https://nodejs.org/)** - Via pnpm and fnm for version management (also nest.js, deno and bun)

---

## 🎯 Work Setup

For my job, I work with:

- **Backend**: Node.js, TypeScript, NestJS
- **Databases**: PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch
- **Infrastructure**: Docker, Kubernetes, AWS
- **CI/CD**: GitLab, GitHub Actions
- **Scripting**: Makefiles, Justfiles, Bash, JS/GO/Python scripting

---

## 🏃 Task Runners

Task runners help automate repetitive workflows with simple commands:

- **[Just](https://github.com/casey/just)** 💚 - Modern command runner with better UX than Make
- **[Make](https://www.gnu.org/software/make/)** - The classic, used it a lot in the past but now prefer Just
- **[npm scripts](https://docs.npmjs.com/cli/v10/using-npm/scripts)** - Built into Node.js, practical but meh

---

## 🎨 Design & Presentation

- **[Presenterm](https://github.com/mfontanini/presenterm)** - Create stunning presentations from Markdown in the terminal
- **[FFmpeg](https://ffmpeg.org/)** - Video/audio processing
- **[ImageMagick](https://imagemagick.org/)** - Image manipulation

---

## 🔤 Fonts

- **[Fira Code](https://github.com/tonsky/FiraCode)** - Programming ligatures that look beautiful
- **[Nerd Fonts](https://www.nerdfonts.com/)** - Patched fonts with tons of glyphs for terminal icons

---

## 💡 Philosophy

I optimize for speed and keyboard-driven workflows:

- **Fast**: Rust/Zig tools are blazingly fast
- **Keyboard-first**: Vim keybindings everywhere (editor, browser, window manager)
- **Reproducible**: Nix for package and dotfile management
- **Open Source**: Nearly everything here is FOSS

---

_Last updated: November 2025_

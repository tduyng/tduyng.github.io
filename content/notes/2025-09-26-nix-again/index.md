+++
title = "[Note] managing everything with nix-darwin + home manager"
date = 2025-09-26
template = "note.html"
generate_feed = true

[extra]
comment = true
copy = true
+++

# Managing everything with nix-darwin + home manager

At the beginning of the year, I tried Nix for the first time.
I even wrote about my first attempt: [migrating from Homebrew to Nix with Home Manager](https://tduyng.com/notes/nix-home-manager/).

This time, I finally made it work.

I’m now running **nix-darwin + nix home manager** with **flakes** to manage all my dotfiles.
The cool part: I don’t need `stow` anymore. Nix (through flakes) handles all the symlinks.
See my old note about [stow dotfiles](https://tduyng.com/notes/stow-dotfiles/), now all of that is replaced by Nix.

Flakes make the whole setup feel cleaner: everything is versioned, pinned, and reproducible.
One `nix flake update` → all dependencies stay fresh but consistent across machines.

Everything is in one place, declarative, reproducible.
Install and update feels much faster than when I was only using brew.

I still keep Homebrew integrated in my Nix config, mostly for tools missing in nixpkgs or Mac desktop apps via cask:

```nix
    brews = [
      "sst/tap/opencode" # AI tool
    ];

    casks = [
      # Terminals
      "ghostty@tip"
      "wezterm"

      # Development tools
      "visual-studio-code"
      "podman-desktop"

      # Productivity
      "bitwarden" # Password manager
      "homerow" # Mouseless navigation
      "nikitabobko/tap/aerospace" # Tiling window manager
    ];
```

Homebrew is still better for launching those from spotlight.

But now:

- configs + dotfiles = Nix flakes
- updates = one command
- machines = reproducible setup

Feels super clean.

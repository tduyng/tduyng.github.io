+++
title = "My Vim setup in VSCode"
description = "How I learned Vim motions in VSCode before switching to Neovim"
template = "post.html"
date = 2025-12-05
generate_feed = true
tags = ["vim", "vscode"]

[extra]
comment = true
reaction = true
toc = true
copy = true
outdate_alert = true
outdate_alert_days = 365
img = "img/vscodevim.png"
+++

I talked about [my Neovim journey](https://tduyng.com/blog/my-neovim-story/) before. How I tried Vim in 2019. Failed. Gave up. Then tried again in 2024 and succeeded.

The difference? I started with Vim mode in VSCode.

I learned the motions there for weeks. Built muscle memory. Kept my workflow. Then switching to Neovim was just learning configuration.

This approach got me maybe 50-60% of the Vim experience. Good enough to build muscle memory. Made the transition to Neovim easier.

In this article, I share my VSCode Vim setup in the past.

## Vim extension

I use [Vim extension](https://marketplace.visualstudio.com/items?itemName=vscodevim.vim), not Neovim extension.

I tried Neovim extension first. It loads your Neovim config. But that caused problems:

- Plugins didn't work
- Got warnings everywhere
- Had to add conditions: `if vim.g.vscode then ...`
- Keymaps didn't translate right
- Slower

Vim extension is simpler. Works with VSCode natively. I configure in `settings.json` and `keybindings.json`. No conflicts.

## My setup

I installed the Vim extension. Then added this config.

### settings.json

This is my Vim config in VSCode:

```json
{
    "vim.leader": "<space>",
    "vim.easymotion": true,
    "vim.incsearch": true,
    "vim.useCtrlKeys": true,
    "vim.hlsearch": true,
    "vim.ignorecase": true,
    "vim.smartcase": true,
    "vim.useSystemClipboard": true,
    "vim.sneak": true,
    "vim.surround": true,
    "vim.replaceWithRegister": true,
    "vim.camelCaseMotion.enable": true,
    "vim.argumentObjectSeparators": [",", ";"],
    "vim.argumentObjectOpeningDelimiters": ["(", "["],
    "vim.argumentObjectClosingDelimiters": [")", "]"],

    "vim.insertModeKeyBindings": [
        {
            "before": ["j", "j"],
            "after": ["<Esc>"]
        },
        {
            "before": ["j", "k"],
            "after": ["<Esc>"]
        },
        {
            "before": ["<C-s>"],
            "commands": [":w"]
        },
        {
            "before": ["<A-j>"],
            "commands": ["editor.action.moveLinesDownAction"]
        },
        {
            "before": ["<A-k>"],
            "commands": ["editor.action.moveLinesUpAction"]
        }
    ],

    "vim.normalModeKeyBindings": [
        {
            "before": ["<tab>"],
            "commands": ["workbench.action.nextEditor"]
        },
        {
            "before": ["<S-tab>"],
            "commands": ["workbench.action.previousEditor"]
        },
        {
            "before": ["g", "d"],
            "commands": ["editor.action.revealDefinition"]
        },
        {
            "before": ["g", "r"],
            "commands": ["editor.action.goToReferences"]
        },
        {
            "before": ["g", "i"],
            "commands": ["editor.action.goToImplementation"]
        },
        {
            "before": ["K"],
            "commands": ["editor.action.showHover"]
        },
        {
            "before": ["[", "d"],
            "commands": ["editor.action.marker.prev"]
        },
        {
            "before": ["]", "d"],
            "commands": ["editor.action.marker.next"]
        },
        {
            "before": ["g", "h"],
            "after": ["^"]
        },
        {
            "before": ["g", "l"],
            "after": ["$"]
        }
    ],

    "vim.visualModeKeyBindings": [
        {
            "before": [">"],
            "after": [">", "g", "v"]
        },
        {
            "before": ["<"],
            "after": ["<", "g", "v"]
        },
        {
            "before": ["g", "c", "c"],
            "commands": ["editor.action.commentLine", "extension.vim_escape"]
        },
        {
            "before": ["g", "c"],
            "commands": ["editor.action.commentLine"]
        },
        {
            "before": ["g", "h"],
            "after": ["^"]
        },
        {
            "before": ["g", "l"],
            "after": ["$"]
        }
    ],

    "vim.normalModeKeyBindingsNonRecursive": [
        {
            "before": ["<C-n>"],
            "commands": [":nohl"]
        },
        {
            "before": ["u"],
            "after": ["u"]
        },
        {
            "before": ["<C-r>"],
            "after": ["<C-r>"]
        }
    ],

    "vim.handleKeys": {
        "<C-a>": false,
        "<C-f>": false,
        "<C-w>": false,
        "<C-c>": false,
        "<C-v>": false,
        "<C-x>": false,
        "<C-z>": false,
        "<C-y>": false
    },

    "extensions.experimental.affinity": {
        "vscodevim.vim": 1
    }
}
```

### keybindings.json

This is my VSCode keymaps that work with Vim mode:

```json
[
    {
        "key": "ctrl+h",
        "command": "workbench.action.navigateLeft"
    },
    {
        "key": "ctrl+l",
        "command": "workbench.action.navigateRight"
    },
    {
        "key": "ctrl+k",
        "command": "workbench.action.navigateUp",
        "when": "!inputFocus"
    },
    {
        "key": "ctrl+j",
        "command": "workbench.action.navigateDown",
        "when": "!inputFocus"
    },
    {
        "key": "space e",
        "command": "runCommands",
        "args": {
            "commands": [
                "workbench.action.toggleSidebarVisibility",
                "workbench.files.action.focusFilesExplorer"
            ]
        },
        "when": "vim.mode == 'Normal' && editorTextFocus && !sideBarFocus"
    },
    {
        "key": "space e",
        "command": "runCommands",
        "args": {
            "commands": [
                "workbench.action.toggleSidebarVisibility",
                "workbench.action.focusActiveEditorGroup"
            ]
        },
        "when": "sideBarFocus && !inputFocus"
    },
    {
        "key": "space space",
        "command": "workbench.action.quickOpen",
        "when": "vim.mode == 'Normal' && (editorTextFocus || !inputFocus)"
    },
    {
        "key": "space s g",
        "command": "workbench.action.findInFiles",
        "when": "vim.mode == 'Normal' && (editorTextFocus || !inputFocus)"
    },
    {
        "key": "space s h",
        "command": "workbench.action.splitEditor",
        "when": "vim.mode == 'Normal' && editorTextFocus"
    },
    {
        "key": "space s v",
        "command": "workbench.action.splitEditorDown",
        "when": "vim.mode == 'Normal' && editorTextFocus"
    },
    {
        "key": "space b d",
        "command": "workbench.action.closeActiveEditor",
        "when": "vim.mode == 'Normal' && editorTextFocus"
    },
    {
        "key": "space b o",
        "command": "workbench.action.closeOtherEditors",
        "when": "vim.mode == 'Normal' && editorTextFocus"
    },
    {
        "key": "space c a",
        "command": "editor.action.codeAction",
        "when": "vim.mode == 'Normal' && editorTextFocus"
    },
    {
        "key": "space c r",
        "command": "editor.action.rename",
        "when": "vim.mode == 'Normal' && editorTextFocus"
    },
    {
        "key": "space c d",
        "command": "workbench.actions.view.problems",
        "when": "vim.mode == 'Normal' && editorTextFocus"
    },
    {
        "key": "space g b",
        "command": "runCommands",
        "when": "vim.mode == 'Normal' && editorTextFocus",
        "args": {
            "commands": ["workbench.view.scm", "workbench.scm.focus"]
        }
    },
    {
        "key": "g d",
        "command": "editor.action.revealDefinition",
        "when": "vim.mode == 'Normal' && editorTextFocus"
    },
    {
        "key": "g r",
        "command": "editor.action.goToReferences",
        "when": "vim.mode == 'Normal' && editorTextFocus"
    },
    {
        "key": "g i",
        "command": "editor.action.goToImplementation",
        "when": "vim.mode == 'Normal' && editorTextFocus"
    },
    {
        "key": "[ d",
        "command": "editor.action.marker.prev",
        "when": "vim.mode == 'Normal' && editorTextFocus"
    },
    {
        "key": "] d",
        "command": "editor.action.marker.next",
        "when": "vim.mode == 'Normal' && editorTextFocus"
    },
    {
        "key": "[ b",
        "command": "workbench.action.previousEditor",
        "when": "vim.mode == 'Normal' && editorTextFocus"
    },
    {
        "key": "] b",
        "command": "workbench.action.nextEditor",
        "when": "vim.mode == 'Normal' && editorTextFocus"
    },
    {
        "key": "r",
        "command": "renameFile",
        "when": "filesExplorerFocus && foldersViewVisible && !explorerResourceIsRoot && !explorerResourceReadonly && !inputFocus"
    },
    {
        "key": "a",
        "command": "explorer.newFile",
        "when": "filesExplorerFocus && foldersViewVisible && !inputFocus"
    },
    {
        "key": "d",
        "command": "deleteFile",
        "when": "filesExplorerFocus && foldersViewVisible && !explorerResourceIsRoot && !inputFocus"
    },
    {
        "key": "c",
        "command": "filesExplorer.copy",
        "when": "filesExplorerFocus && foldersViewVisible && !inputFocus"
    },
    {
        "key": "p",
        "command": "filesExplorer.paste",
        "when": "filesExplorerFocus && foldersViewVisible && !inputFocus"
    },
    {
        "key": "x",
        "command": "filesExplorer.cut",
        "when": "filesExplorerFocus && foldersViewVisible && !inputFocus"
    }
]
```

The keybindings are split into two files: `settings.json` handles Vim-specific bindings (works inside the editor), `keybindings.json` handles VSCode commands (works across the whole app).

I configure the same keymap multiple times with different `when` conditions. This makes them context-aware.

**Example: `<space>e` toggle explorer**

```json
// When in editor - Open sidebar and focus explorer
{
  "key": "space e",
  "when": "vim.mode == 'Normal' && editorTextFocus && !sideBarFocus"
}

// When in sidebar - Close sidebar and focus editor
{
  "key": "space e",
  "when": "sideBarFocus && !inputFocus"
}
```

Same key, different behavior based on where I am. In editor → open explorer. In explorer → go back to editor.

Example: `gd` go to definition

```json
// settings.json - Only in Normal mode
{
  "before": ["g", "d"],
  "commands": ["editor.action.revealDefinition"]
}

// keybindings.json - More specific condition
{
  "key": "g d",
  "when": "vim.mode == 'Normal' && editorTextFocus"
}
```

I put it in both files because sometimes Vim extension doesn't catch it. Adding it to `keybindings.json` ensures it always works.

### All my keymaps

#### Basic editing

- `jj` or `jk` - Exit insert mode (I prefer jk, less finger movement)
- `Ctrl+s` - Save (muscle memory from VSCode, works in insert mode)
- `g+h` - Jump to start of line (instead of `^`)
- `g+l` - Jump to end of line (instead of `$`)
- `Ctrl+d/u` - Half page down/up (from Vim extension)
- `gg` / `G` - Top/bottom of file (from Vim extension)

#### Window navigation

- `Ctrl+h` - Move to left split
- `Ctrl+l` - Move to right split
- `Ctrl+k` - Move to upper split (only when not in input)
- `Ctrl+j` - Move to lower split (only when not in input)

Note: `Ctrl+k` has condition `!inputFocus` so it doesn't break VSCode's command palette (`Ctrl+k Ctrl+s`, etc).

#### Splits

- `<leader>sh` - Split horizontal (`:split`)
- `<leader>sv` - Split vertical (`:vsplit`)

#### Buffer management

- `Tab` / `Shift+Tab` - Next/previous buffer
- `<leader>bd` - Close current buffer
- `<leader>bo` - Close other buffers

#### File navigation

- `<leader>e` - Toggle file explorer (and focus it)
- `<leader>e` (in explorer) - Close explorer and back to editor
- `<leader><leader>` - Quick open file (fuzzy finder)
- `<leader>sg` - Search in files (grep)

#### LSP features

- `gd` - Go to definition
- `gr` - Go to references
- `gi` - Go to implementation
- `gh` - Show hover info
- `<leader>ca` - Code actions
- `<leader>cr` - Rename symbol
- `<leader>cd` - Show problems panel
- `g+c` - Toggle comment
- `>` - Indent and reselect (so I can indent multiple times)
- `<` - Outdent and reselect

#### File explorer (when focused)

- `r` - Rename file
- `a` - New file
- `d` - Delete file
- `c` - Copy file
- `p` - Paste file
- `x` - Cut file

I can use vim motions in file explorer. Navigate with `j/k`, then use these keys.

#### Git

- `<leader>gb` - Open git view (source control)

#### Other useful ones

- `Ctrl+n` - Clear search highlight
- `Alt+j` / `Alt+k` - Move lines up/down (works in insert/normal mode)
- `u` / `Ctrl+r` - Undo/redo (defined in NonRecursive to prevent conflicts)

I disable Vim handling for these keys:

```json
"vim.handleKeys": {
  "<C-a>": false,
  "<C-f>": false,
  "<C-w>": false,
  "<C-c>": false,
  "<C-v>": false,
  "<C-x>": false,
  "<C-z>": false,
  "<C-y>": false
}
```

Let VSCode handle them. So `Ctrl+f` still opens find, `Ctrl+c` still copies, `Ctrl+z` still undoes.

Useful when I'm not in Vim mode (like in terminal or search panel).

## Useful Vim extension features

The config enables some powerful features:

**vim.surround** - Surround text with quotes, brackets, tags:

- `ysiw"` - Surround word with quotes
- `cs"'` - Change surrounding quotes to single quotes
- `ds"` - Delete surrounding quotes

**vim.replaceWithRegister** - Replace with yanked text:

- `griw` - Replace inner word with register

**vim.camelCaseMotion** - Navigate camelCase words:

- `w` moves through `myVariableName` as separate words

**vim.sneak** - Jump to character pair quickly:

- `s{char}{char}` - Jump forward to two characters
- `S{char}{char}` - Jump backward

**vim.argumentObject** - Text object for function arguments:

- `cia` - Change inner argument: `foo(bar, |baz, qux)` → `foo(bar, |, qux)`
- `daa` - Delete argument with comma: `foo(bar, |baz, qux)` → `foo(bar, |qux)`

**vim.easymotion** - Jump anywhere on screen:

- `<leader><leader>w` - Show jump labels on words
- `<leader><leader>s` - Jump to character

After some weeks with Vim in VSCode, I was comfortable with motions. Then I tried Neovim in terminal. The motions were already in my muscle memory. I just needed to learn configuration. That was much easier than learning both at once. Now I use Neovim full-time. But starting in VSCode made the transition smooth.

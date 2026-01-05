+++
title = "[Notes] Vim tricks"
date = 2026-01-05
template = "note.html"
generate_feed = true
series = "vim-tricks"
series_order = 1

[extra]
comment = true
copy = true
+++

# Vim tricks (vanilla mode)

## Shell Filter: ! and !!

Pipe text through external commands. Use any Unix tool as a text processor.
Command What it does

```vim
:.!date Replace line with date output
!ip sort Sort paragraph
!ap jq . Format JSON in paragraph
:%!column -t Align entire file
```

## Global Command: :g/pattern/cmd

Run Ex command on all matching lines. Surgical bulk operations.
Command Effect

```vim
:g/TODO/d Delete all TODOs
:g/^$/d 	Delete empty lines
:g/error/t$ Copy error lines to end
:g/func/norm A; Append ; to all functions
```

## Command-line Registers: Ctrl-r

Insert register contents in : or / prompt.
Shortcut Inserts

```vim
Ctrl-r Ctrl-w Word under cursor
Ctrl-r " Last yank
Ctrl-r / Last search pattern
Ctrl-r = Expression result
```

## Normal on Selection: :'<,'>norm

Run normal mode commands on each selected line. Multi-cursor without plugins.

```vim
:'<,'>norm A, → Append comma to each line
:'<,'>norm I# → Comment each line
:'<,'>norm @q → Run macro on each line
```

## The g Commands

Command Effect

```vim
gi Go to last insert position + insert mode
g; Jump to previous change
g, Jump to next change
gv Reselect last visual selection

```

## Auto-Marks

Positions Vim tracks automatically.
Mark Jumps to

```vim
``	Previous position (toggle back)`. Last change position
`" Position when file was last closed
[ /] Start/end of last yank or change
```

## Command History Window: q:

Editable command history in a buffer.

```vim
q: opens command history
q/ opens search history. Edit any line, hit Enter to execute.
```

## Copy/Move Lines: :t and :m

Duplicate or relocate lines without touching registers.
Command Effect

```vim
:t. Duplicate current line below
:t0 Copy line to top of file
:m+2 Move line 2 lines down
:'<,'>t. Duplicate selection below
```

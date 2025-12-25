+++
title = "[Note] make your shell magical with Atuin"
date = 2025-09-25
template = "note.html"
generate_feed = true
series = "terminal"
series_order = 7

[extra]
comment = true
copy = true
+++

# Make your shell magical with Atuin

Discovered [Atuin](https://github.com/atuinsh/atuin).
Feels like my shell just leveled up.

```bash
user@atuin:~$ echo "Making your shell"
Making your shell
magical█
```

Atuin replaces boring history with something smart:

- Full-screen fuzzy search (rebind `Ctrl-R`, or arrow up).
- All commands stored in SQLite, not a flat text file.
- Encrypted sync across machines.
- History per session, per directory, or global.
- Knows exit code, duration, cwd, hostname… even stats of “most used commands.”

Example:

```bash
# search through all your history
atuin search docker build

# fuzzy jump back to a command and run it
Ctrl-R → type "kubectl logs"
```

I open a new laptop → log into Atuin → my history is already there. Magic.

Bonus: it doesn’t delete your old history file, just makes it better. Supported shells: zsh, bash, fish, nushell, xonsh.

+++
title = "[Note] everyone should use zoxide" 
date = 2025-09-20
template = "note.html"
generate_feed = true

[extra]
comment = true
copy = true
+++

## zoxide > cd

I stopped using `cd` since more than a year ago.
Now I use [zoxide](https://github.com/ajeetdsouza/zoxide).

It’s a small rust tool, super fast, and it just remembers every folder you’ve been to.
Next time you want to jump back, type:

```bash
z projects
z notes
z blog
```

That’s it. No full paths. No thinking. It learns your habits.

And the best part: `zi` + [fzf](https://github.com/junegunn/fzf).

```bash
zi
```

It pops up a fuzzy list of your most used folders. Type a few letters, hit enter, and you’re there.

Example:

- `zi` → type `doc` → jumps straight to `~/work/docs/2025`.
- Way faster than `cd ~/work/docs/2025`.

After 5 minutes, `cd` feels broken.

Bonus tricks:

```bash
alias cd="z"
nvim $(zi)
```

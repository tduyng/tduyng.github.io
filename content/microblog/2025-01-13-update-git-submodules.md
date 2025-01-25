+++
title = "[Microblog] Update all Git submodules to latest commit"
date = 2025-01-13
+++

# Update all Git submodules to the latest commit

If you use [Git submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) often, here's the one-liner to update them to the latest commit on origin (since Git 1.8.2):

```bash
git submodule update --remote --rebase
```

Prefer merging? Swap `--rebase` for `--merge`.
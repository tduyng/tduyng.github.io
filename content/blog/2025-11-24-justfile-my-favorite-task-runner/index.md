+++
title = "Why Justfile became my favorite task runner"
description = "Discover why Just is better than Make: simpler syntax, better UX, and a lot of cool features"
template = "post.html"
date = 2025-11-24
tags = ["justfile", "makefile", "scripting", "task-runner"]
generate_feed = true

[extra]
comment = true
reaction = true
toc = true
copy = true
show_ended_words = true
img = "img/just.png"
+++

## From Make to Just

Not long ago, I wrote about [scripting tools](https://tduyng.com/blog/scripting-tools/). I talked about using JavaScript/TypeScript to replace Makefiles for Node.js teams. Make it more friendly for developers who work with JavaScript every day.

But I always loved Makefiles. Bash scripts are really powerful. No need to install extra stuff for CLI tools, file operations, or running commands. For simple automation, Makefile is still faster and easier than writing scripts in JavaScript or Python.

Then I found [Just](https://github.com/casey/just). It became my favorite task runner now.

## Why Just is special?

Just is a command runner, not a build system. The syntax looks like Make, but better UX. Written in Rust, so it's fast. Works on Linux, macOS, Windows.

Here's what I love about it:

1. **Show all commands easily**

Just do `just --list` and it shows all available commands with descriptions. No more grep through Makefile to find what commands you have.

Here's example in my [gozzi](https://github.com/tduyng/gozzi) project:

```bash
❯ just --list --unsorted
Available recipes:
    default                # Display all available commands (default when running 'just')

    [quality]
    check-tools            # Verify required tools are installed
    audit                  # Run security and quality checks

    [development]
    build-dev              # Build development binary
    install-dev            # Install system-wide to GOPATH/bin
    clean                  # Remove build artifacts
    test                   # Run all Go tests
    coverage               # Generate HTML coverage report
    lint                   # Run linter (requires golangci-lint)
    fmt                    # Format code with gofmt
    vet                    # Run go vet for static analysis
    tidy                   # Update go.mod and go.sum

    [production]
    build VERSION=""       # Build production binary (optionally from specific version tag)
    install VERSION=""     # Install production binary (optionally specific version)

    [release]
    changelog              # Generate changelog with git-cliff
    tag VERSION            # Create new version tag (format: vX.Y.Z)
    release-test           # Test goreleaser build locally (without publishing)
    release-dry-run        # Test goreleaser release process (without publishing)
    release-test-arch ARCH # Test specific architecture build
    release-test-all-arch  # Test all architectures
    release                # Build production binaries for multiple platforms
```

2. **No more tab vs space problem**

Make requires tabs. That makes it harder to write Makefile in some editors. If you use spaces instead of tabs, the command will fail to run. That's sucks. I had that problem many times.

In Just, this problem is gone. Just accepts both tabs and spaces. Much easier to write Justfile now.

3. **Simple variable syntax**

Make has different ways to assign variables: `?=`, `:=`, `=`, `+=`. Each one works differently. Confusing.

Just uses `:=` for everything. Just one way. Simple.

4. **No `.PHONY` needed**

In Make, you need to write `.PHONY: target` for every command that is not a file. That's verbose and annoying.

Just is a command runner, not a build system. Every recipe is a command by default. No need to write `.PHONY` anymore.

5. **Run with or without dependencies**

Run commands with dependencies, or bypass them with `--no-deps` when needed:

```just
cmd_a:
    @echo "run command a"

cmd_b: cmd_a
    @echo "run command b"
```

Usage:

```bash
$ just cmd_b
run command a
run command b

$ just --no-deps cmd_b
run command b
```

This is really useful for workflows like `build → test → deploy`. Sometimes you just want to run `deploy` without running `build` again. Just makes this easy.

6. **Write recipes in any language - special one, my favorite!**

This is the coolest feature. You can write recipes in any language you want. Python, JavaScript, Ruby, whatever. Just use shebang:

```just
polyglot: python js perl sh ruby nu

python:
  #!/usr/bin/env python3
  print('Hello from python!')

js:
  #!/usr/bin/env node
  console.log('Greetings from JavaScript!')

perl:
  #!/usr/bin/env perl
  print "Larry Wall says Hi!\n";

sh:
  #!/usr/bin/env sh
  hello='Yo'
  echo "$hello from a shell script!"

nu:
  #!/usr/bin/env nu
  let hello = 'Hola'
  echo $"($hello) from a nushell script!"

ruby:
  #!/usr/bin/env ruby
  puts "Hello from ruby!"
```

This solves the problem from my [scripting tools article](https://tduyng.com/blog/scripting-tools/)!

Node.js teams can write complex tasks in JavaScript directly in Justfile. Python teams can use Python. For simple tasks, you still use shell commands. No need to install extra libraries like `zx` or `execa`.

7. **Arguments are easy**

Passing arguments to commands is simple and clear:

```just
# Build Go binary with optional version
build version='dev':
  go build -ldflags "-X main.Version={{version}}" -o bin/app

# Install to system
install version='dev': (build version)
  cp bin/app /usr/local/bin/
```

Usage:

```bash
just build              # Builds with version "dev"
just build v1.2.3       # Builds with version "v1.2.3"
just install v1.2.3     # Builds v1.2.3 and installs it
```

```just
# Run tests with optional verbose and coverage flags
test verbose='false' coverage='false':
  #!/usr/bin/env bash
  args=""
  if [ "{{verbose}}" = "true" ]; then
    args="$args -v"
  fi
  if [ "{{coverage}}" = "true" ]; then
    args="$args -cover -coverprofile=coverage.out"
  fi
  go test $args ./...
```

Usage:

```bash
just test                           # Normal test run
just test verbose=true              # Verbose output
just test coverage=true             # With coverage
just test verbose=true coverage=true # Both
```

Compare with make:

- Use `{{arg}}` instead of Make's `$(VAR)` or `$$var`, much clearer
- Default values: `version='dev'` more simple and more natural
- Handle easier multiple arguments

8. **Easy to migrate from Make**

Just was made to be a better Make. Most Makefile syntax works in Justfile. So migration is easy.

Here's a real example:

Makefile:

```makefile
.PHONY: build test clean

VERSION ?= dev

build:
	go build -ldflags "-X main.Version=$(VERSION)" -o bin/app

test:
	go test ./...

clean:
	rm -rf bin/
```

Justfile:

```just
version := 'dev'

build:
  go build -ldflags "-X main.Version={{version}}" -o bin/app

test:
  go test ./...

clean:
  rm -rf bin/
```

What changed:

1. Remove `.PHONY` - not needed
2. Change `?=` to `:=` - one way to do things
3. Change `$(VAR)` to `{{version}}` - cleaner

That's it! I migrated most of my Makefiles in less than 10 minutes for simple Makefiles.

## More cool features

- **Run tasks in parallel**

You can run multiple tasks at the same time. Just add `[parallel]`:

```just
[parallel]
main: foo bar baz

foo:
  sleep 1

bar:
  sleep 1

baz:
  sleep 1
```

Or use GNU parallel for concurrent recipe lines:

```just
parallel:
  #!/usr/bin/env -S parallel --shebang --ungroup --jobs {{ num_cpus() }}
  echo task 1 start; sleep 3; echo task 1 done
  echo task 2 start; sleep 3; echo task 2 done
  echo task 3 start; sleep 3; echo task 3 done
```

Simple and works well!

- **Format Justfile**

Just can format itself:

```bash
just --fmt --unstable        # Format justfile
just --fmt --check --unstable # Check formatting
```

- **Choose command interactively**

Forgot what commands you have? Use `--choose`:

```bash
just --choose
```

This opens fuzzy finder (uses `fzf` by default). You can see all commands and choose one. Really convenient! I use this a lot when I switch between different projects.

- **Group your commands**

You can organize commands into groups:

```just
[group: 'development']
build:
  go build

[group: 'development']
test:
  go test ./...

[group: 'release']
publish:
  goreleaser release
```

Groups show up in `just --list`. Makes it easier to find commands in large Justfiles.

- **Environment variables**

You can control Just with environment variables. All start with `JUST_`:

```bash
export JUST_UNSTABLE=1
export JUST_COMMAND_COLOR=blue
just build
```

Just also makes it easy to work with environment variables in your recipes.

Export variables to recipes:

```just
export RUST_BACKTRACE := "1"

test:
  cargo test  # RUST_BACKTRACE is available here
```

Export all variables at once:

```just
set export

API_URL := "https://api.example.com"
API_KEY := "secret"

deploy:
  # Both API_URL and API_KEY are exported automatically
  ./deploy.sh
```

With `set export`, all Just variables become environment variables. Really convenient!

Recipe parameters as environment variables:

```just
test $RUST_BACKTRACE="1":
  cargo test  # RUST_BACKTRACE is available
```

Use `$` prefix and the parameter becomes environment variable in that recipe.

- **Just can load `.env` files automatically**

Add this to your Justfile:

```just
set dotenv-load
```

Now Just loads `.env` files automatically before running commands. No external tools needed.

- **Color output**

Just has built-in colors:

```just
test:
  @echo "{{BLUE}}Running tests...{{NORMAL}}"
  go test ./...
  @echo "{{GREEN}}Tests passed!{{NORMAL}}"
```

See all [color constants in the docs](https://just.systems/man/en/constants.html).

## Why I use Just now

Justfile is much much better than Make for me. Like how ripgrep is better than grep, or how eza is better than ls. Everything Make can do, Just does better. And Just can do things that Make can't do.

There's more stuff I didn't write about. Run `just --help` or read the [docs](https://just.systems/) to see what else Just can do.

Give Just a try. I think you will like it.

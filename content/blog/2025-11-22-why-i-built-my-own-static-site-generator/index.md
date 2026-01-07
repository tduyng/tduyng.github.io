+++
title = "Why I built my own static site generator"
description = "From Jekyll to Zola to building Gozzi learning by building instead of just using."
template = "post.html"
date = 2025-11-22
tags = ["blog", "go"]
generate_feed = true

[extra]
featured = true
comment = true
reaction = true
toc = true
copy = true
outdate_alert = true
outdate_alert_days = 365
img = "img/gozzi.webp"
+++

There are so many static site generators: Jekyll, Gatsby, Hexo, Hugo, Zola, Eleventy, and many more. So why did I build another one?

After using [Zola](https://www.getzola.org/) for a while and hitting some problems when I tried to customize my blog, I realized something: I wanted to understand how these tools work, not just how to use them. That's how [Gozzi](https://github.com/tduyng/gozzi) was born.

## My journey: Jekyll to Zola

I started blogging in 2019 with [Jekyll](https://jekyllrb.com/). It was perfect for GitHub Pages, free and easy. I even [wrote a guide](https://tduyng.com/blog/build-free-your-personal-website-using-jekyll/) about it. Over a few years, I tried 2-3 different Jekyll themes. Then I stopped blogging for almost 3 years. Life got busy.

In 2024, I wanted to start again. But my tech stack had changed, I wasn't using Ruby anymore. I was deep into TypeScript and learning Go and Rust. Going back to Jekyll felt wrong. I looked at some options like [Hugo](https://gohugo.io/), [Lume](https://lume.land/), but nothing felt right. Then I found [Zola](https://www.getzola.org/) written in Rust, super fast. I [moved everything to Zola](https://tduyng.com/blog/new-home-for-my-website/) and was happy.

Like Jekyll, I tried 1 or 2 Zola themes over months. Everything was good. But I wanted to understand how static site generators actually work. Not just use one, but really understand it.

The best way to learn something? Build it yourself (if possible). So I decided to build Gozzi. Not to replace Zola or Hugo. Just to learn by doing. And hey, if I build it, I can make it work exactly how I want.

I wasn't a Go expert. I'd never built a static site generator. But that's exactly why it was interesting.

### Why Go?

I was learning Go at that time and wanted to get better at it. Go is fast and really good for making CLI apps. Building a real project is the best way to actually learn a language way better than just doing tutorials. So this was perfect: learn how static site generators work AND get better at Go. Two birds, one stone.

## How static site generators work

I started learning. Turns out it's pretty simple:

```
1. Read config file (TOML/YAML)
2. Read Markdown files
3. Process templates
4. Make HTML
5. Copy static files
```

That's it. Everything else tags, pagination, RSS, syntax highlighting is just extra stuff built on top. Go had everything I needed to build this.

## Finding the right tools

I started to use these libraries:

- [BurntSushi/toml](https://github.com/BurntSushi/toml) for config
- [yuin/goldmark](https://github.com/yuin/goldmark) for Markdown
- [goldmark-highlighting](https://github.com/yuin/goldmark-highlighting) for syntax colors
- [goldmark/mermaid](https://go.abhg.dev/goldmark/mermaid) for diagrams
- Go's `html/template` for templates

## Building the first version

My goal was simple: make my blog work with Gozzi.

The first version was rough:

1. Read `config.toml`
2. Find all `.md` files in `content/`
3. Read frontmatter and Markdown
4. Load HTML templates
5. Make each post with its template
6. Write to `public/`

The code was messy. Error handling was basic. No tests. Lots of bugs. But when I ran `gozzi build` and saw my blog in the `public/` folder, all my posts there it felt great. That feeling when you build something from scratch and it works.

## Using it every day

Once it worked, I used Gozzi for my real blog. Every time something was missing, I could just add it.

Need custom date format? Add it:

```go
"dateFormat": func(date time.Time, format string) string {
    return date.Format(format)
}
```

Want posts grouped by year? Write it:

```go
"groupBy": func(key string, pages []Page) map[string][]Page {
    // Group pages
}
```

Need server side KaTeX so readers don't need JavaScript? Add it.

This is what I was missing: **full control over my tool.**

## What I learned

Building Gozzi taught me a lot:

- Static site generators are simpler than they look. The basics are pretty simple.
- Go is great for CLI tools. The standard library has everything you need.
- Real use drives features. I built what I needed, not "every feature." This kept the code small.
- Understanding the template syntax makes customization easy. I understand all the syntax and functions in my HTML files. This makes fixing and customizing my blog much easier.

## What Gozzi is today

Today, Gozzi runs [tduyng.com](https://tduyng.com):

- 100+ blog posts and notes
- ~100ms builds with live reload
- Server side KaTeX for math
- Syntax highlighting
- Mermaid diagrams
- Full-text search (Python script makes the index)
- RSS, sitemap and [more](https://tduyng.com/gozzi)

I finally have my own tool. It's my tool that works how I want. The code is clean, tested, and I understand every line.

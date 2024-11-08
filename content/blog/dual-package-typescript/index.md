+++
title = "Support Dual Package for CJS and ESM in Typescript Library"
description = "Explore an easy way to support dual package TypeScript NPM libraries for both CommonJS and ESM"
date = 2024-06-14

[taxonomies]
categories = ["DEVELOPMENT"]
tags = ["typescript", "javascript", "npm", "esm"]

[extra]
comment = false
reaction = true
enjoy = true
img = "img/dual-package.webp"
outdate_alert = true
outdate_alert_days = 700
+++

Hi there!

Today, ECMAScript Modules (ESM) have become the standard for writing JavaScript on both the front end and back end. However, many projects still use CommonJS (CJS), particularly those that have been around for a while.

If your project is written in TypeScript, you're in luck. TypeScript already uses ESM syntax with `import` and `export`. However, one thing to keep in mind is that if your TypeScript project does not specify `"type": "module"`, it will still output CommonJS.

With Deno, JSR, or Bun, the question of using CJS or ESM doesn't really matter. Deno and JSR enforce the use of ESM exclusively, while Bun supports both CommonJS and ESM. However, in Node.js, this question still requires careful consideration.

When building a library for npm, it's advisable to support both ESM and CommonJS (dual package). This is the approach taken by most popular packages today, as it allows any type of project to use the library. But how can we achieve this? It can be complex and challenging to maintain?

Here, I share an opinionated and straightforward way to handle this. You can read the solution in detail here: [Supporting Dual Packages for CJS and ESM in a TypeScript Library](https://medium.com/ekino-france/supporting-dual-package-for-cjs-and-esm-in-typescript-library-b5feabac1357). I wrote this article on [my company's page](https://medium.com/ekino-france).

I hope this helps. Happy coding!

>Note: Why didn’t I write this article on my personal blog? Because I originally published it on my company’s Medium page, I chose not to duplicate it here to avoid issues with content ownership. Additionally, hosting the original article on Medium makes it easier to gather feedback and comments compared to my personal blog.
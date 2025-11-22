+++
title = "[Gozzi] Native KaTeX support"
date = 2025-11-22
template = "note.html"
generate_feed = true

[extra]
comment = true
copy = true
+++

# [Gozzi] Native KaTeX support

Gozzi now has native KaTeX support! Let's test it.

## Inline Math

The famous Einstein equation $E = mc^2$ shows mass-energy equivalence.

The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.

Greek letters like $\alpha$, $\beta$, and $\gamma$ work too!

## Block Math

The Gaussian integral:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

The sum formula:

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

## Matrices

Matrix notation:

$$
\begin{bmatrix} a & b \\ c & d \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} ax + by \\ cx + dy \end{bmatrix}
$$

Identity matrix:

$$
I = \begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}
$$

## Mixed Content

Regular text with $f(x) = x^2$ inline math, followed by:

$$
\lim_{x \to \infty} \frac{1}{x} = 0
$$

So cool!

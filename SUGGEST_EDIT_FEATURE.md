# Post Engagement Component

## Overview

A unified "Post Engagement" component has been added to all blog posts and notes pages. This component combines:
1. **Ended Words**: A friendly message thanking readers and encouraging feedback
2. **Suggest Edit**: A GitHub edit link allowing readers to contribute improvements directly

This creates a cohesive call-to-action section that encourages community participation and collaboration.

## What Was Added

### 1. New Partial Template
**File:** `templates/partials/_suggest_edit.html`

This reusable component generates a GitHub edit link for each page, dynamically constructing the URL based on the page's file path.

### 2. Styling
**File:** `static/css/main.css`

Added responsive CSS styling for the suggest edit component with:
- Subtle background with primary color theme
- Hover effects with smooth transitions
- Edit icon animation on hover
- Mobile-responsive adjustments
- Consistent with your existing design system

### 3. Integration

The component is now included in:
- **Blog posts** (`templates/post.html`) - Appears after the article content, before related posts
- **Notes** (`templates/note.html`) - Appears after the note content, before the "Back to Notes" link

## How It Works

The component automatically:
1. Detects the current page's file path using `.Page.Path`
2. Constructs a GitHub edit URL pointing to: `https://github.com/tduyng/tduyng.github.io/edit/main/content/{path}/index.md`
3. Opens the edit page in a new tab when clicked
4. Shows an edit icon with a "Suggest an edit" text label

**Note**: The URL includes the `content/` prefix since that's the actual directory structure in your GitHub repository.

## Visual Design

The component features:
- **Edit icon**: A pencil/document icon that animates upward and rotates slightly on hover
- **Background**: Subtle blue-tinted background matching your primary color
- **Border**: Thin border that becomes more visible on hover
- **Typography**: Clean, readable text with your site's font
- **Responsive**: Adjusts padding and icon size on mobile devices

## GitHub Integration

When users click the "Suggest an edit" link, they'll be taken to GitHub's file editor where they can:
1. Fork your repository (if they haven't already)
2. Make their suggested changes to the markdown file
3. Submit a pull request with their improvements

## Benefits

- **Community Contributions**: Makes it easy for readers to fix typos, add clarifications, or suggest improvements
- **Open Source Spirit**: Encourages collaboration and transparency
- **Low Friction**: One-click access to edit pages without needing to navigate GitHub manually
- **Professional**: Shows that you value community input and contributions

## Example URLs

For a blog post at `content/blog/2020-11-03-basic-setup-webpack/index.md`:
```
https://github.com/tduyng/tduyng.github.io/edit/main/content/blog/2020-11-03-basic-setup-webpack/index.md
```

For a note at `content/notes/2025-01-08-aerospace/index.md`:
```
https://github.com/tduyng/tduyng.github.io/edit/main/content/notes/2025-01-08-aerospace/index.md
```

## Customization

You can customize the component by editing:

1. **Text**: Change "Suggest an edit" in `_suggest_edit.html`
2. **Icon**: Replace the SVG with a different icon
3. **Position**: Move the template include to a different location in post.html or note.html
4. **Styling**: Adjust colors, spacing, and effects in `main.css`
5. **Repository URL**: Update the GitHub URL if your repository changes

## Technical Details

- Uses gozzi's `.Page.Path` variable to dynamically construct URLs
- Conditionally renders only if `.Page.Path` exists
- Opens in new tab with `target="_blank"` and security attributes
- Includes proper ARIA labels for accessibility
- SVG icon is inline for optimal performance
- CSS uses your existing CSS custom properties for consistent theming

## Testing

The feature has been tested and verified to work on:
- ✅ Blog post pages
- ✅ Note pages
- ✅ Build process completes successfully
- ✅ HTML output includes correct GitHub URLs
- ✅ Dynamic path resolution works properly

---

**Note**: Make sure your content repository matches the URL in the template. If you change repositories, update the GitHub URL in `templates/partials/_suggest_edit.html`.

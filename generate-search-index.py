#!/usr/bin/env python3
# Generates search index JSON from markdown files for FlexSearch
# Extracts title, description, content, tags, and URL from blog posts and notes

import json
import os
import re
from pathlib import Path


def extract_toml_frontmatter(content):
    """Extract TOML frontmatter from markdown content"""
    match = re.match(r"^\+\+\+\s*\n(.*?)\n\+\+\+\s*\n(.*)", content, re.DOTALL)
    if not match:
        return {}, content

    frontmatter_text = match.group(1)
    body = match.group(2)

    frontmatter = {}
    current_section = frontmatter

    for line in frontmatter_text.split("\n"):
        line = line.strip()
        if not line:
            continue

        # Handle sections like [extra]
        if line.startswith("[") and line.endswith("]"):
            continue

        if "=" in line:
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")

            # Handle arrays
            if value.startswith("[") and value.endswith("]"):
                value = [
                    v.strip().strip('"').strip("'")
                    for v in value.strip("[]").split(",")
                ]
            # Handle booleans
            elif value.lower() == "true":
                value = True
            elif value.lower() == "false":
                value = False

            current_section[key] = value

    return frontmatter, body


def clean_markdown(text):
    """Remove markdown syntax and clean text for search"""
    # Remove code blocks
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = re.sub(r"`[^`]+`", "", text)

    # Remove HTML tags
    text = re.sub(r"<[^>]+>", "", text)

    # Remove markdown links but keep text
    text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)

    # Remove images
    text = re.sub(r"!\[([^\]]*)\]\([^\)]+\)", "", text)

    # Remove headers
    text = re.sub(r"^#+\s+", "", text, flags=re.MULTILINE)

    # Remove bold/italic
    text = re.sub(r"[*_]{1,2}([^*_]+)[*_]{1,2}", r"\1", text)

    # Remove blockquotes
    text = re.sub(r"^>\s+", "", text, flags=re.MULTILINE)

    # Clean up whitespace
    text = re.sub(r"\n+", " ", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def process_content_dir(base_dir, url_prefix):
    """Process all markdown files in a directory"""
    entries = []
    content_path = Path(base_dir)

    if not content_path.exists():
        print(f"Directory not found: {base_dir}")
        return entries

    for md_file in content_path.rglob("index.md"):
        try:
            # Skip the section index file
            if md_file.parent.name == content_path.name:
                continue

            with open(md_file, "r", encoding="utf-8") as f:
                content = f.read()

            frontmatter, body = extract_toml_frontmatter(content)

            title = frontmatter.get("title")
            if not title:
                continue

            # Get the slug from directory name
            slug = md_file.parent.name

            # Strip date prefix from slug (YYYY-MM-DD- format)
            # e.g., "2024-11-11-tsconfig-options" -> "tsconfig-options"
            date_pattern = r"^\d{4}-\d{2}-\d{2}-"
            clean_slug = re.sub(date_pattern, "", slug)

            # Build URL
            url = f"{url_prefix}/{clean_slug}"

            # Clean content
            clean_content = clean_markdown(body)

            # Limit content for search
            content_preview = (
                clean_content[:800] if len(clean_content) > 800 else clean_content
            )

            # Create search entry
            entry = {
                "id": url,
                "title": title,
                "description": frontmatter.get("description", ""),
                "content": content_preview,
                "tags": frontmatter.get("tags", [])
                if isinstance(frontmatter.get("tags"), list)
                else [],
                "url": url,
                "date": str(frontmatter.get("date", "")),
            }

            entries.append(entry)

        except Exception as e:
            print(f"Error processing {md_file}: {e}")
            continue

    return entries


def main():
    script_dir = Path(__file__).parent
    content_dir = script_dir / "content"

    all_entries = []

    # Process blog posts
    print("Processing blog posts...")
    blog_entries = process_content_dir(str(content_dir / "blog"), "/blog")
    all_entries.extend(blog_entries)
    print(f"  Found {len(blog_entries)} blog posts")

    # Process notes
    print("Processing notes...")
    notes_entries = process_content_dir(str(content_dir / "notes"), "/notes")
    all_entries.extend(notes_entries)
    print(f"  Found {len(notes_entries)} notes")

    # Sort by date (newest first)
    all_entries.sort(key=lambda x: x.get("date", ""), reverse=True)

    # Write to public directory
    public_dir = script_dir / "public"
    public_dir.mkdir(exist_ok=True)

    output_file = public_dir / "search-index.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_entries, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Generated search index with {len(all_entries)} entries")
    print(f"   File size: {output_file.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()

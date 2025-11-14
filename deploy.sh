#!/bin/bash
set -euo pipefail

# Build the site with the specified environment
gozzi build --config config/config.prod.toml

# Generate search index
echo "Generating search index..."
python3 generate-search-index.py

# Deploy if GITHUB_TOKEN is set
if [ -n "${GITHUB_TOKEN:-}" ]; then
  # Clone the existing gh-pages branch (preserving full history)
  git clone --branch gh-pages "https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git" gh-pages-repo || {
    # If gh-pages doesn't exist yet, create it
    mkdir -p gh-pages-repo
    cd gh-pages-repo
    git init -b gh-pages
    git remote add origin "https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
    cd ..
  }

  # Remove old content (but keep .git directory to preserve history)
  cd gh-pages-repo
  find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

  # Copy new build to gh-pages repo
  cp -r ../public/* .

  # Configure git
  git config user.name "GitHub Actions"
  git config user.email "github-actions-bot@users.noreply.github.com"

  # Check if there are changes
  if git diff --quiet && git diff --cached --quiet; then
    echo "No changes to deploy"
    exit 0
  fi

  # Add all changes
  git add .

  # Create commit with meaningful message
  COMMIT_MSG="Deploy from ${GITHUB_SHA::7}"
  if [ -n "${GITHUB_REF:-}" ]; then
    COMMIT_MSG="${COMMIT_MSG} (${GITHUB_REF##*/})"
  fi
  git commit -m "${COMMIT_MSG}"

  # Push to gh-pages (no force needed - we have history!)
  git push origin gh-pages
fi

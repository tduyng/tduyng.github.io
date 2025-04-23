#!/bin/bash
set -euo pipefail

# Build the site with the specified environment
./build.sh prod

# Deploy if GITHUB_TOKEN is set
if [ -n "${GITHUB_TOKEN:-}" ]; then
  # Navigate to the public directory where Zola's build output is
  cd public

  # Initialize git and set up configuration
  git init
  git config user.name "GitHub Actions"
  git config user.email "github-actions-bot@users.noreply.github.com"

  # Add all files in the public folder to Git
  git add .

  # Commit the changes
  git commit -m "Deploy site"

  # Check if gh-pages exists on the remote and create it if not
  git fetch origin gh-pages || git checkout --orphan gh-pages

  # Push to the gh-pages branch, forcing the update
  git push --force "https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git" master:gh-pages
fi

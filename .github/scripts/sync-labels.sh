#!/bin/bash

# Sync GitHub Labels
#
# This script syncs labels defined in .github/labels.yml to your repository.
# It uses the github-label-sync npm package.
#
# Usage:
#   ./sync-labels.sh [--dry-run]
#
# Environment variables:
#   GITHUB_TOKEN - GitHub personal access token
#   GITHUB_REPOSITORY - Repository name (owner/repo)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for required environment variables
if [ -z "$GITHUB_TOKEN" ]; then
  echo -e "${RED}Error: GITHUB_TOKEN environment variable is required${NC}"
  echo "Create a token at: https://github.com/settings/tokens"
  echo "Required scopes: repo"
  exit 1
fi

if [ -z "$GITHUB_REPOSITORY" ]; then
  echo -e "${YELLOW}Warning: GITHUB_REPOSITORY not set, using current repository${NC}"
  GITHUB_REPOSITORY=$(git remote get-url origin | sed -n 's/.*github\.com[:/]\(.*\)\.git/\1/p')
  if [ -z "$GITHUB_REPOSITORY" ]; then
    echo -e "${RED}Error: Could not determine repository${NC}"
    echo "Set GITHUB_REPOSITORY=owner/repo or run from a git repository"
    exit 1
  fi
fi

echo -e "${GREEN}Syncing labels for ${GITHUB_REPOSITORY}${NC}"

# Check if github-label-sync is installed
if ! command -v github-label-sync &> /dev/null; then
  echo -e "${YELLOW}Installing github-label-sync...${NC}"
  npm install -g github-label-sync
fi

# Determine if dry run
DRY_RUN=""
if [ "$1" = "--dry-run" ]; then
  DRY_RUN="--dry-run"
  echo -e "${YELLOW}Running in DRY RUN mode (no changes will be made)${NC}"
fi

# Run the sync
echo "Syncing labels from .github/labels.yml..."
github-label-sync \
  --access-token "$GITHUB_TOKEN" \
  --labels .github/labels.yml \
  $DRY_RUN \
  "$GITHUB_REPOSITORY"

echo -e "${GREEN}Label sync complete!${NC}"

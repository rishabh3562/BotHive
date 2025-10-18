# BotHive - Complete Setup Guide

This guide will help you set up the automated issue generation system and prepare your repository for open source contributions.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Setting Up Labels](#setting-up-labels)
3. [Generating Issues](#generating-issues)
4. [Manual Alternative](#manual-alternative)
5. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- GitHub repository with admin access
- GitHub account
- Node.js 18.x or 20.x installed (for local testing)

### Steps

1. **Enable GitHub Issues**
   - Go to your repository settings
   - Ensure "Issues" is enabled

2. **Set Up Labels** (Choose one method)

   **Option A: Via GitHub Actions (Recommended)**
   - Labels will be created automatically when you run the issue generator

   **Option B: Manually via Web Interface**
   - Go to Issues → Labels
   - Create labels from `.github/labels.yml`

   **Option C: Using CLI Tool**
   ```bash
   # Install github-label-sync
   npm install -g github-label-sync

   # Sync labels
   export GITHUB_TOKEN=your_github_token
   github-label-sync --access-token $GITHUB_TOKEN --labels .github/labels.yml owner/repo
   ```

3. **Generate Issues**

   Go to your repository on GitHub:
   - Click the **Actions** tab
   - Select **Generate Issues** workflow
   - Click **Run workflow** button
   - Choose:
     - `dry_run: true` for preview (recommended first time)
     - `dry_run: false` to create issues
   - Click **Run workflow**

4. **Check Results**
   - Go to the **Issues** tab
   - You should see 20+ new issues ready for contributors!

## Setting Up Labels

Labels are defined in `.github/labels.yml` and categorize issues for contributors.

### Label Categories

**Core Labels:**
- `hacktoberfest` - Hacktoberfest participation
- `good first issue` - Beginner-friendly (< 2 hours)
- `help wanted` - More complex (> 2 hours)

**Type Labels:**
- `bug` - Something is broken
- `enhancement` - New feature
- `documentation` - Docs improvements
- `security` - Security issues
- `refactor` - Code restructuring
- `test` - Testing related
- `performance` - Performance improvements

**Category Labels:**
- `accessibility` - A11y improvements
- `database` - Database changes
- `ci` - CI/CD related
- `monitoring` - Observability
- `seo` - SEO improvements
- `code quality` - Quality improvements

### Syncing Labels

**Method 1: Automatic (during issue generation)**

Labels are automatically created when issues are generated.

**Method 2: Using the sync script**

```bash
cd .github/scripts
chmod +x sync-labels.sh

# Dry run (preview changes)
GITHUB_TOKEN=your_token GITHUB_REPOSITORY=owner/repo ./sync-labels.sh --dry-run

# Apply changes
GITHUB_TOKEN=your_token GITHUB_REPOSITORY=owner/repo ./sync-labels.sh
```

**Method 3: Manual npm command**

```bash
npx github-label-sync \
  --access-token YOUR_TOKEN \
  --labels .github/labels.yml \
  owner/repo
```

## Generating Issues

### Via GitHub Actions (Recommended)

1. Navigate to **Actions** tab
2. Click **Generate Issues** workflow
3. Click **Run workflow**
4. Select options:
   - **dry_run: true** - Preview without creating
   - **dry_run: false** - Create issues
5. Click **Run workflow** to start

6. Monitor progress in the workflow run

7. Check **Issues** tab for results

### Via Command Line

```bash
# Navigate to issue generator directory
cd .github/issue-generator

# Test locally (dry run)
node generate-issues.js --dry-run

# Create issues (requires token)
export GITHUB_TOKEN=your_github_token
export GITHUB_REPOSITORY=owner/repo
node generate-issues.js
```

### Getting a GitHub Token

1. Go to https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Give it a name: "Issue Generator"
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click **Generate token**
6. Copy the token (you won't see it again!)

## Manual Alternative

If you prefer not to use automation, you can create issues manually using the templates in `.github/issue-generator/issues.json`.

### Steps

1. Open `.github/issue-generator/issues.json`
2. For each issue:
   - Go to **Issues** → **New issue**
   - Copy the `title`
   - Copy the `body`
   - Add the `labels`
   - Click **Submit new issue**

This is more time-consuming but gives you full control.

## What Gets Created

After running the issue generator, you'll have:

### 20+ Professional Issues

1. **Security Issues (High Priority)**
   - Move JWT secrets to environment variables
   - Add missing environment variables to .env.example

2. **Testing Infrastructure**
   - Set up Jest testing framework
   - Add unit tests for authentication

3. **Code Quality**
   - Replace 'any' types with proper TypeScript types
   - Replace console.log with logging library
   - Add stricter ESLint rules

4. **Bug Fixes**
   - Fix Stripe webhook error handling
   - Add database error handling

5. **Features**
   - Add rate limiting to API routes
   - Add input validation
   - Add database migration system
   - Add accessibility improvements
   - Add SEO metadata

6. **CI/CD**
   - Add automated testing workflow
   - Add automated build workflow

7. **Documentation**
   - Create CONTRIBUTING.md (✅ Already done!)
   - Improve README
   - Create API documentation

8. **Monitoring**
   - Add error tracking with Sentry

9. **Performance**
   - Add database indexes

10. **Refactoring**
    - Consolidate database abstraction layer

### Issue Distribution

- **good first issue**: ~60% (12+ issues)
- **help wanted**: ~40% (8+ issues)

### Priority Distribution

- **Security**: Highest priority (2 issues)
- **Bugs**: High priority (2 issues)
- **Testing**: High priority (2 issues)
- **Features**: Medium priority (8 issues)
- **Code Quality**: Medium priority (3 issues)
- **Documentation**: Medium priority (3 issues)

## Customizing Issues

### Adding New Issues

1. Edit `.github/issue-generator/issues.json`
2. Add new issue object:
   ```json
   {
     "title": "feat(scope): your feature description",
     "labels": ["enhancement", "hacktoberfest", "good first issue"],
     "body": "## Description\n\n..."
   }
   ```
3. Test with dry run:
   ```bash
   cd .github/issue-generator
   node generate-issues.js --dry-run
   ```
4. Generate issues via GitHub Actions

### Modifying Existing Issues

1. Edit the issue object in `issues.json`
2. Close the old issue on GitHub
3. Re-run the issue generator

### Changing Labels

1. Edit `.github/labels.yml`
2. Sync labels:
   ```bash
   cd .github/scripts
   ./sync-labels.sh
   ```
3. Update issues with new labels manually or regenerate

## Troubleshooting

### Issues Not Creating

**Problem**: Workflow runs but no issues appear

**Solutions**:
- Check workflow logs for errors
- Verify GITHUB_TOKEN has correct permissions
- Ensure Issues are enabled in repository settings
- Check if issues already exist (duplicates are skipped)

### Permission Denied

**Problem**: "Resource not accessible by integration"

**Solutions**:
- Go to Settings → Actions → General
- Set "Workflow permissions" to "Read and write permissions"
- Re-run the workflow

### Rate Limiting

**Problem**: "API rate limit exceeded"

**Solutions**:
- Wait 1 hour for rate limit to reset
- The script includes automatic delays to prevent this
- Use GitHub Actions (higher rate limits)

### Duplicate Issues

**Problem**: Same issues created multiple times

**Solutions**:
- The script checks for duplicates by title
- Close duplicate issues manually
- Don't run the generator multiple times quickly

### Labels Not Appearing

**Problem**: Issues created without labels

**Solutions**:
- Sync labels first (see "Setting Up Labels")
- Ensure label names in `issues.json` match `labels.yml` exactly
- Labels are case-sensitive

## Next Steps

After generating issues:

1. **Review Issues**
   - Check that all issues are relevant
   - Close any that don't apply to your codebase
   - Adjust priorities if needed

2. **Add to Projects**
   - Create a GitHub Project board
   - Organize issues by priority
   - Add to milestones

3. **Promote**
   - Share on social media with #Hacktoberfest
   - Post in developer communities
   - Add "Hacktoberfest" topic to repository

4. **Set Up Branch Protection**
   - Require PR reviews
   - Require status checks to pass
   - Enable "Require branches to be up to date"

5. **Monitor Contributions**
   - Respond to PRs promptly
   - Provide helpful feedback
   - Merge quality contributions

## Maintenance

### Weekly

- Review new issues and PRs
- Update issue status
- Close completed issues

### Monthly

- Review and update `issues.json`
- Generate new issues for new features
- Update documentation

### As Needed

- Add labels for new categories
- Update CONTRIBUTING.md
- Regenerate issues after major changes

## Getting Help

If you encounter issues with the setup:

1. Check this guide's troubleshooting section
2. Review `.github/issue-generator/README.md`
3. Check GitHub Actions logs
4. Open an issue in this repository

## Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [GitHub Labels Documentation](https://docs.github.com/issues/using-labels)
- [Hacktoberfest Guidelines](https://hacktoberfest.com/participation/)
- [Conventional Commits](https://www.conventionalcommits.org/)

Happy contributing!

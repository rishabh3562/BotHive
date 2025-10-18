# GitHub Actions Workflows

This directory contains automated workflows for the BotHive repository.

## Available Workflows

### 🎯 Generate Issues
**File:** `generate-issues.yml`
**Trigger:** Manual (workflow_dispatch)

Creates GitHub issues from the pre-defined list in `.github/issue-generator/issues.json`.

**Usage:**
1. Go to **Actions** → **Generate Issues**
2. Click **Run workflow**
3. Select options:
   - `dry_run: true` - Preview without creating issues
   - `dry_run: false` - Actually create issues
4. Click **Run workflow**

**What it does:**
- Creates 22 professional issues
- Automatically adds labels
- Checks for duplicates
- Rate limits requests to avoid API errors

---

### 🎃 Add Hacktoberfest Label
**File:** `add-hacktoberfest-label.yml`
**Trigger:** Manual (workflow_dispatch)

Bulk adds the `hacktoberfest` label to existing issues.

**Usage:**
1. Go to **Actions** → **Add Hacktoberfest Label**
2. Click **Run workflow**
3. Select options:
   - `dry_run: true` - Preview changes
   - `dry_run: false` - Apply changes
   - `filter_labels` - Only add to issues with specific labels (default: "good first issue,help wanted")
4. Click **Run workflow**

**What it does:**
- Creates `hacktoberfest` label if it doesn't exist
- Adds label to all open issues (or filtered subset)
- Skips issues that already have the label
- Skips pull requests
- Provides detailed summary

**Common Use Cases:**
```yaml
# Add to all issues
filter_labels: ""

# Add only to good first issues (default)
filter_labels: "good first issue,help wanted"

# Add to specific categories
filter_labels: "bug,enhancement"
```

---

### 🧹 Remove Hacktoberfest Label
**File:** `remove-hacktoberfest-label.yml`
**Trigger:** Manual (workflow_dispatch)

Bulk removes the `hacktoberfest` label from all issues (after Hacktoberfest ends).

**Usage:**
1. Go to **Actions** → **Remove Hacktoberfest Label**
2. Click **Run workflow**
3. Select:
   - `dry_run: true` - Preview what will be removed
   - `dry_run: false` - Actually remove labels
4. Click **Run workflow**

**What it does:**
- Finds all issues with `hacktoberfest` label
- Removes the label from each
- Works on both open and closed issues
- Provides summary of changes

---

## Workflow Permissions

All workflows require these permissions (already configured):
- `issues: write` - Create and modify issues
- `contents: read` - Read repository contents

These are set in the workflow files under the `permissions` section.

---

## Typical Workflow Sequence

### For Hacktoberfest Participation:

1. **Before Hacktoberfest** (Late September):
   ```
   1. Run "Generate Issues" (dry_run: false)
   2. Run "Add Hacktoberfest Label" (dry_run: false)
   3. Add "hacktoberfest" topic to repository
   ```

2. **During Hacktoberfest** (October):
   - Monitor issues and PRs
   - Labels are already applied
   - New issues can be created manually with the label

3. **After Hacktoberfest** (November):
   ```
   1. Run "Remove Hacktoberfest Label" (dry_run: false)
   2. Remove "hacktoberfest" topic from repository
   ```

### For Year-Round Open Source:

```
1. Run "Generate Issues" (dry_run: false)
2. Don't run Hacktoberfest workflows
3. Issues remain without Hacktoberfest branding
```

---

## Dry Run Best Practice

**Always run with `dry_run: true` first!**

This allows you to:
- Preview what will happen
- Check for errors
- Verify the changes are what you want
- Avoid mistakes

Then run with `dry_run: false` to apply changes.

---

## Troubleshooting

### Workflow fails with "Permission denied"

**Solution:**
1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions":
   - Select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"
3. Save and re-run workflow

### Issues not created

**Possible causes:**
- Duplicate issues already exist (check title match)
- Rate limiting (wait and retry)
- JSON syntax error in `issues.json`

**Fix:**
- Check workflow logs for errors
- Validate `issues.json` with a JSON validator
- Try dry run first

### Hacktoberfest label not added

**Check:**
- Issue is open (closed issues are skipped)
- Issue doesn't already have the label
- Issue matches filter criteria
- Label was created successfully

---

## Adding New Workflows

To add a new workflow:

1. Create a new `.yml` file in this directory
2. Follow GitHub Actions syntax
3. Add to this README
4. Test with a dry run option if applicable

**Example template:**
```yaml
name: My Workflow

on:
  workflow_dispatch:
    inputs:
      dry_run:
        description: 'Dry run'
        type: choice
        options:
          - 'true'
          - 'false'

jobs:
  my-job:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      contents: read
    steps:
      - name: Do something
        run: echo "Hello"
```

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Workflow Syntax](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub Script Action](https://github.com/actions/github-script)
- [Octokit REST API](https://octokit.github.io/rest.js/)

---

## Questions?

Check the main documentation:
- [Setup Guide](../docs/automation/SETUP_GUIDE.md)
- [Issue Generator README](../issue-generator/README.md)
- [Contributing Guide](../../CONTRIBUTING.md)

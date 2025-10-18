# Issue Generator

This directory contains the automated issue generation system for BotHive.

## Files

- `issues.json` - Definitions of all issues to generate
- `generate-issues.js` - Script that creates GitHub issues from JSON
- `README.md` - This file

## Usage

### Via GitHub Actions (Recommended)

1. Go to **Actions** tab in GitHub
2. Select **Generate Issues** workflow
3. Click **Run workflow**
4. Choose dry run mode:
   - `true` - Preview issues without creating them
   - `false` - Actually create the issues
5. Click **Run workflow** button

### Manually

```bash
# Navigate to the issue-generator directory
cd .github/issue-generator

# Preview issues (dry run)
node generate-issues.js --dry-run

# Create issues (requires GITHUB_TOKEN)
GITHUB_TOKEN=your_token GITHUB_REPOSITORY=owner/repo node generate-issues.js
```

## Environment Variables

- `GITHUB_TOKEN` - GitHub personal access token with `repo` scope
- `GITHUB_REPOSITORY` - Repository in format `owner/repo`

## Adding New Issues

1. Edit `issues.json`
2. Add new issue object:
   ```json
   {
     "title": "type(scope): description",
     "labels": ["label1", "label2"],
     "body": "## Description\n\nYour issue body in markdown..."
   }
   ```
3. Follow the conventional commit format for titles
4. Use proper labels from `.github/labels.yml`
5. Run dry-run to test:
   ```bash
   node generate-issues.js --dry-run
   ```

## Issue Format

### Title Format

Use conventional commits format:
```
type(scope): description
```

**Types:**
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation
- `refactor` - Code restructuring
- `test` - Testing
- `security` - Security fixes
- `perf` - Performance
- `ci` - CI/CD

**Examples:**
- `feat(api): add pagination to user list endpoint`
- `fix(auth): handle null pointer in user service`
- `security(env): move JWT secrets to environment variables`

### Body Format

Include these sections:

1. **Description** - What's the problem/feature?
2. **Affected file** - Specific file references with line numbers
3. **Impact** - Why does this matter?
4. **Tasks** - Checkbox list of actionable items
5. **Acceptance Criteria** - Testable outcomes
6. **Technical Details** - Code examples and implementation hints
7. **Estimated Time** - Time estimate

**Example:**
```markdown
## Description

JWT secrets are hardcoded in `lib/database/mongoose.ts:7-11`, exposing the authentication system.

**Affected file**: `lib/database/mongoose.ts:7-11`

## Impact

- Authentication system is compromised
- Attackers can generate valid tokens

## Tasks

- [ ] Remove fallback values
- [ ] Add environment variable validation
- [ ] Update documentation

## Acceptance Criteria

- No hardcoded secrets in code
- App fails gracefully if secrets missing

## Technical Details

\`\`\`typescript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET required');
}
\`\`\`

**Estimated Time**: 1 hour
```

## Labels

All labels must be defined in `.github/labels.yml`.

**Required labels:**
- At least one type: `bug`, `enhancement`, `documentation`, `security`, etc.
- Difficulty: `good first issue` or `help wanted`
- `hacktoberfest` for Hacktoberfest participation

**Example:**
```json
{
  "labels": ["security", "hacktoberfest", "good first issue"]
}
```

## Best Practices

1. **Be Specific** - Reference actual files and line numbers
2. **Be Actionable** - Tasks should be clear and specific
3. **Be Accurate** - Only create issues for real problems
4. **Be Helpful** - Include code examples and context
5. **Estimate Time** - Help contributors gauge effort

## Troubleshooting

### "GITHUB_TOKEN environment variable is required"

Set your GitHub token:
```bash
export GITHUB_TOKEN=ghp_your_token_here
```

### "GitHub API error (401)"

Your token is invalid or expired. Create a new one at:
https://github.com/settings/tokens

Required scopes: `repo`

### "Issue already exists"

The script checks for duplicate titles and skips them. To recreate:
1. Close or delete the existing issue
2. Run the script again

## Maintenance

### Updating Issues

1. Edit `issues.json`
2. Run dry-run to preview changes
3. Run workflow to create/update issues

### Regenerating All Issues

⚠️ **Warning**: This will create duplicate issues if not cleaned up first.

1. Close all existing generated issues
2. Edit `issues.json` with updated content
3. Run the workflow

## Notes

- Issues are created with a 1-second delay to respect GitHub API rate limits
- Duplicate detection checks issue titles (case-sensitive)
- Failed issues will be reported but won't stop the process
- Dry run mode is recommended for testing changes

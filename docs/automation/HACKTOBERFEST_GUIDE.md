# Hacktoberfest Setup Guide

This guide explains how to enable and disable Hacktoberfest participation for your BotHive repository.

## Quick Start

### Option 1: Enable Hacktoberfest (3 Steps)

1. **Generate Issues** (if not done already)
   ```
   Actions → Generate Issues → Run workflow (dry_run: false)
   ```

2. **Add Hacktoberfest Labels**
   ```
   Actions → Add Hacktoberfest Label → Run workflow (dry_run: false)
   ```

3. **Add Repository Topic**
   ```
   Repository → About (gear icon) → Add topic: "hacktoberfest"
   ```

### Option 2: Year-Round Open Source (No Hacktoberfest)

1. **Generate Issues**
   ```
   Actions → Generate Issues → Run workflow (dry_run: false)
   ```

2. **Skip** the Hacktoberfest label workflow

3. **Don't add** the hacktoberfest topic

---

## Detailed Instructions

### Before Hacktoberfest (Late September)

#### Step 1: Generate Issues

1. Go to **Actions** tab
2. Select **Generate Issues** workflow
3. Click **Run workflow**
4. Choose `dry_run: true` (preview first)
5. Review the output
6. Run again with `dry_run: false` to create issues

**Result:** 22 professional issues created without Hacktoberfest labels

#### Step 2: Add Hacktoberfest Labels

1. Go to **Actions** tab
2. Select **Add Hacktoberfest Label** workflow
3. Click **Run workflow**
4. Configure:
   - `dry_run: true` (preview first)
   - `filter_labels: good first issue,help wanted` (default)
5. Review what will be labeled
6. Run again with `dry_run: false` to apply

**Filter Options:**

```yaml
# Add to all issues
filter_labels: ""

# Add only to beginner-friendly issues (RECOMMENDED)
filter_labels: "good first issue,help wanted"

# Add to specific categories
filter_labels: "bug,enhancement,documentation"

# Add to security and performance issues
filter_labels: "security,performance"
```

**Result:** Hacktoberfest label added to your chosen issues

#### Step 3: Add Repository Topic

1. Go to repository homepage
2. Click the gear icon next to **About**
3. In **Topics**, add: `hacktoberfest`
4. Click **Save changes**

**Result:** Repository appears in Hacktoberfest searches

#### Step 4: Promote (Optional)

Share on social media:
```
🎃 BotHive is Hacktoberfest-ready!

22 contributor-friendly issues:
- 13 good first issues
- 9 help wanted issues
- Next.js + TypeScript + AI

Perfect for all skill levels!

#Hacktoberfest #OpenSource #NextJS
```

---

### During Hacktoberfest (October)

**Maintainer Checklist:**

✅ **Review PRs Quickly** (within 24-48 hours)
- Fast feedback = happy contributors
- Comment even if you can't merge yet

✅ **Be Welcoming**
- Thank first-time contributors
- Provide constructive feedback
- Point to documentation

✅ **Merge Quality Work**
- Check tests pass
- Verify code style
- Ensure issue is actually fixed

✅ **Close Spam**
- Low-quality PRs should be closed
- Comment explaining why
- Mark as spam if appropriate

✅ **Add New Issues**
- Create manually with `hacktoberfest` label
- Or add to `issues.json` and regenerate

**Response Templates:**

**First PR:**
```markdown
Thank you @username for your first contribution! 🎉

I'll review this shortly. Please ensure:
- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Commit message follows our format

Feel free to ask questions!
```

**Requesting Changes:**
```markdown
Great start @username! A few changes needed:

- [ ] Add test coverage for the new function
- [ ] Update documentation in README.md
- [ ] Fix the linting errors shown in CI

Let me know if you need help!
```

**Merging:**
```markdown
Excellent work @username! Thank you for improving BotHive. 🚀

Merged in #123.
```

---

### After Hacktoberfest (November)

#### Step 1: Remove Hacktoberfest Labels

1. Go to **Actions** tab
2. Select **Remove Hacktoberfest Label** workflow
3. Click **Run workflow**
4. Choose `dry_run: true` (preview)
5. Review what will be removed
6. Run with `dry_run: false` to remove

**Result:** All `hacktoberfest` labels removed

#### Step 2: Remove Repository Topic

1. Go to repository homepage
2. Click gear icon next to **About**
3. Remove `hacktoberfest` topic
4. Save changes

**Result:** Repository no longer in Hacktoberfest searches

#### Step 3: Continue Open Source

- Keep accepting contributions year-round
- Issues remain valid
- Labels like `good first issue` stay
- Just without Hacktoberfest branding

---

## Workflow Details

### Add Hacktoberfest Label Workflow

**Features:**
- ✅ Creates `hacktoberfest` label if needed
- ✅ Adds to all open issues or filtered subset
- ✅ Skips issues that already have the label
- ✅ Skips pull requests
- ✅ Dry run mode for testing
- ✅ Detailed summary report

**Advanced Usage:**

**Add to all issues:**
```yaml
dry_run: false
filter_labels: ""
```

**Add only to bugs:**
```yaml
dry_run: false
filter_labels: "bug"
```

**Add to multiple categories:**
```yaml
dry_run: false
filter_labels: "bug,enhancement,security"
```

### Remove Hacktoberfest Label Workflow

**Features:**
- ✅ Finds all issues with `hacktoberfest` label
- ✅ Removes from open and closed issues
- ✅ Skips pull requests
- ✅ Dry run mode for testing
- ✅ Summary report

**Usage:**
```yaml
# Always preview first
dry_run: true

# Then remove
dry_run: false
```

---

## Best Practices

### DO:
✅ Run dry runs first to preview changes
✅ Filter labels to only beginner-friendly issues
✅ Respond to contributors within 48 hours
✅ Merge quality contributions quickly
✅ Close spam PRs with explanation
✅ Add new issues during the month
✅ Remove labels after Hacktoberfest ends

### DON'T:
❌ Add Hacktoberfest label to all issues (too overwhelming)
❌ Ignore contributors for days
❌ Merge low-quality work just for Hacktoberfest
❌ Leave labels on year-round (confusing)
❌ Delete the label (just remove from issues)

---

## Troubleshooting

### Workflow fails with "Permission denied"

**Fix:**
1. Settings → Actions → General
2. Workflow permissions → "Read and write permissions"
3. Save and retry

### Labels not added

**Check:**
- Issues are open (closed issues are skipped)
- Issues match filter criteria
- Issues don't already have the label
- Label was created successfully

**Debug:**
- Run with `dry_run: true` to see what would happen
- Check workflow logs for errors
- Verify filter_labels syntax (comma-separated, no spaces)

### Too many/few issues labeled

**Adjust filter:**
```yaml
# More selective (fewer issues)
filter_labels: "good first issue"

# Less selective (more issues)
filter_labels: "good first issue,help wanted,bug,enhancement"

# All issues
filter_labels: ""
```

---

## Year-Round Open Source

You can use this repository for open source without Hacktoberfest:

1. **Generate issues** (without running Hacktoberfest workflow)
2. **Accept contributions** year-round
3. **Use `good first issue`** and `help wanted` labels
4. **Don't add** `hacktoberfest` topic or labels

This keeps your repository clean and focused on general open source, not just October.

---

## Timeline

### Recommended Timeline:

**September 25-30:**
- Generate issues
- Add Hacktoberfest labels
- Add repository topic
- Test everything
- Promote on social media

**October 1-31:**
- Monitor issues and PRs daily
- Respond quickly
- Merge quality work
- Close spam
- Add new issues as needed

**November 1-7:**
- Final PR reviews
- Close or merge pending work
- Remove Hacktoberfest labels
- Remove repository topic
- Continue open source work

---

## Statistics Tracking

Track your Hacktoberfest success:

**During October:**
- Issues created: _____
- PRs received: _____
- PRs merged: _____
- Contributors: _____
- Stars gained: _____

**Tools:**
- GitHub Insights (Pulse)
- [Hacktoberfest stats](https://hacktoberfest.com/profile/)
- Repository traffic analytics

---

## Resources

- [Hacktoberfest Official Site](https://hacktoberfest.com/)
- [Hacktoberfest Quality Standards](https://hacktoberfest.com/participation/)
- [GitHub Issues Documentation](https://docs.github.com/issues)
- [GitHub Actions Documentation](https://docs.github.com/actions)

---

## Questions?

- Check [Workflows README](../../.github/workflows/README.md)
- Check [Setup Guide](SETUP_GUIDE.md)
- Open an issue
- Check Hacktoberfest FAQ

---

**Good luck with Hacktoberfest!** 🎃

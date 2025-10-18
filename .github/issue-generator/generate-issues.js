#!/usr/bin/env node

/**
 * GitHub Issue Generator
 *
 * This script generates GitHub issues from the issues.json file.
 * It can be run manually or via GitHub Actions.
 *
 * Usage:
 *   node generate-issues.js [--dry-run]
 *
 * Environment variables:
 *   GITHUB_TOKEN - GitHub personal access token with repo scope
 *   GITHUB_REPOSITORY - Repository name in format "owner/repo"
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || 'owner/repo';
const [OWNER, REPO] = GITHUB_REPOSITORY.split('/');

// Load issues from JSON
const issuesPath = path.join(__dirname, 'issues.json');
const issues = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

console.log(`📋 Loaded ${issues.length} issues from ${issuesPath}`);
console.log(`🎯 Target repository: ${GITHUB_REPOSITORY}`);
console.log(`🔧 Dry run mode: ${DRY_RUN ? 'YES' : 'NO'}\n`);

/**
 * Create a GitHub issue using the REST API
 */
async function createIssue(issue) {
  if (!GITHUB_TOKEN && !DRY_RUN) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/issues`;

  const payload = {
    title: issue.title,
    body: issue.body,
    labels: issue.labels || [],
  };

  if (DRY_RUN) {
    console.log(`[DRY RUN] Would create issue:`);
    console.log(`  Title: ${issue.title}`);
    console.log(`  Labels: ${issue.labels.join(', ')}`);
    console.log(`  Body length: ${issue.body.length} characters`);
    return { number: 'DRY-RUN', html_url: 'N/A' };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error (${response.status}): ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Failed to create issue "${issue.title}":`, error.message);
    throw error;
  }
}

/**
 * Check if an issue with the same title already exists
 */
async function issueExists(title) {
  if (DRY_RUN) {
    return false; // In dry run, assume no duplicates
  }

  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/issues?state=all&per_page=100`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      console.warn('⚠️ Could not check for existing issues');
      return false;
    }

    const existingIssues = await response.json();
    return existingIssues.some(issue => issue.title === title);
  } catch (error) {
    console.warn('⚠️ Error checking for existing issues:', error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting issue generation...\n');

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const issue of issues) {
    try {
      // Check if issue already exists
      if (await issueExists(issue.title)) {
        console.log(`⏭️  Skipped (already exists): ${issue.title}`);
        skipped++;
        continue;
      }

      // Create the issue
      const result = await createIssue(issue);
      console.log(`✅ Created #${result.number}: ${issue.title}`);
      if (!DRY_RUN) {
        console.log(`   ${result.html_url}`);
      }
      created++;

      // Rate limiting: wait 1 second between requests
      if (!DRY_RUN) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`❌ Failed: ${issue.title}`);
      failed++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${issues.length}`);
  console.log('='.repeat(60));

  if (DRY_RUN) {
    console.log('\n💡 This was a dry run. Run without --dry-run to create issues.');
  }

  if (failed > 0) {
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('\n💥 Fatal error:', error.message);
  process.exit(1);
});

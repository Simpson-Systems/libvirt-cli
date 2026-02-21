import { danger, fail, warn, message } from "danger";

const pr = danger.github.pr;
const body = pr.body ?? "";

// Robust branch extraction (works across contexts)
const prBranch =
  danger.github?.pr?.head?.ref ??
  (danger as any).github?.thisPR?.head?.ref ??
  "";

// Files changed
const modified = danger.git.modified_files ?? [];
const created = danger.git.created_files ?? [];
const allFiles = [...modified, ...created];

// ---------------------------------------------
// Helpers
// ---------------------------------------------
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasSection(title: string) {
  const t = escapeRegExp(title);
  const regex = new RegExp(`^##\\s*${t}\\s*$`, "im");
  return regex.test(body);
}

function getSection(title: string): string {
  const t = escapeRegExp(title);
  const regex = new RegExp(`^##\\s*${t}\\s*$([\\s\\S]*?)(?=^##\\s|\\Z)`, "im");
  const match = body.match(regex);
  return match ? match[1].trim() : "";
}

// ---------------------------------------------
// 1) PR MUST REFERENCE AN ISSUE
// ---------------------------------------------
const issueRegex =
  /(close[sd]?|fix(e[sd])?|resolve[sd]?|refs?|related to)\s+#\d+/i;

if (!issueRegex.test(body)) {
  fail(`
❌ This PR does not reference an issue.

Add one of the following to the PR description:

Closes #123
Fixes #123
Resolves #123
Refs #123

Every change must be tied to tracked work.
`);
}

// ---------------------------------------------
// 2) BRANCH MUST CONTAIN ISSUE NUMBER
// ---------------------------------------------
const actor = pr.user?.login ?? "";
const isBot = pr.user?.type === "Bot" || /bot/i.test(actor);

// allow merge PRs / automation PRs to bypass if you want
const isMergePR =
  /^Merge\b/i.test(pr.title) || /dev\s*->\s*stable/i.test(pr.title);

// NOTE: you used "feat" in this regex. If your branches are "feature/",
// change feat -> feature below.
const branchIssueRegex =
  /^(feat|fix|docs|refactor|test|chore|build|ci|perf)\/\d+([-/].+)?$/i;

if (!isBot && !isMergePR) {
  if (!prBranch) {
    warn("Could not determine PR branch name in Danger context. Skipping branch naming rule.");
  } else if (!branchIssueRegex.test(prBranch)) {
    fail(`
❌ Branch name must include the issue number.

Required format:
  type/123-description

Examples:
  feat/123-paging
  fix/88-memory-leak
  refactor/52-allocator
`);
  }
}

// ---------------------------------------------
// 3) PR TITLE MUST BE CONVENTIONAL COMMITS
// ---------------------------------------------
const conventional =
  /^(feat|fix|docs|style|refactor|test|chore|build|ci|perf)(\([^)]+\))?: .+/;

if (!conventional.test(pr.title)) {
  fail(`
❌ PR title must follow Conventional Commits:

feat(kernel): add paging
fix(memory): prevent double free
refactor(allocator): simplify free list
`);
}

// ---------------------------------------------
// 4) DESCRIPTION QUALITY
// ---------------------------------------------
if (body.trim().length < 30) {
  warn("PR description is very short. Explain WHY this change exists.");
}

// ---------------------------------------------
// 5) HUGE PR WARNING
// ---------------------------------------------
const bigPR = (pr.additions ?? 0) + (pr.deletions ?? 0) > 800;
if (bigPR) {
  warn("Large PR detected (>800 lines). Consider splitting it.");
}

// ---------------------------------------------
// 6) PREVENT BUILD ARTIFACTS
// ---------------------------------------------
const badFiles = allFiles.filter((f) =>
  f.startsWith("target/") ||
  f.endsWith(".o") ||
  f.endsWith(".a") ||
  f.endsWith(".iso") ||
  f.endsWith(".img")
);

if (badFiles.length) {
  fail(`Build artifacts committed: ${badFiles.join(", ")}`);
}

// ---------------------------------------------
// 7) CHANGELOG SUGGESTION
// ---------------------------------------------
const touchesRust = allFiles.some((f) => f.endsWith(".rs"));
const touchedChangelog = allFiles.some((f) => /changelog/i.test(f));

if (touchesRust && !touchedChangelog) {
  message("Rust code changed — consider updating CHANGELOG.md if user-facing.");
}

// ---------------------------------------------
// 8) PR TEMPLATE STRUCTURE
// ---------------------------------------------

// ---- Verify Steps ----
const verifyTitle = "How can a reviewer verify?";
if (!hasSection(verifyTitle)) {
  fail("Missing **How can a reviewer verify?** section.");
} else {
  const verify = getSection(verifyTitle);
  if (!/^\s*\d+\.\s+/m.test(verify)) {
    fail(`
The **How can a reviewer verify?** section must contain numbered reproduction steps.

Example:

1. docker compose up
2. upload test.json to S3
3. observe Step Function completes
`);
  }
}



// ---- Soft structure rules (warn only) ----
const recommendedSections = [
  "What does this change do?",
  "Why is this change needed?",
  "Risks",
];

for (const sec of recommendedSections) {
  if (!hasSection(sec)) {
    warn(`Consider filling out **${sec}** to help reviewers understand the change.`);
  }
}

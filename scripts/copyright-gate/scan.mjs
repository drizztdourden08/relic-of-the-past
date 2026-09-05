/* @layer tooling-scripts @kind logic */
/**
 * Copyright / media gate engine. Shared by the commit-msg hook and CI.
 *
 *   node scan.mjs --staged                 local: scans `git diff --cached`
 *   node scan.mjs --range <base>...<head>  CI: scans a diff range
 *
 * Exits 1 when blocking findings exist and the change is not owner-approved.
 * Approval = `[allow-copyright]` in a commit message (range mode) OR the
 * COPYRIGHT_APPROVED=1 env var (CI sets it when the PR has the owner label).
 */
import { execSync } from 'child_process';
import { RULES } from './rules.mjs';
import { TEXT_RULE_BLOCKS, ALLOW_MARKER } from './patterns.mjs';

const git = (cmd) => execSync(`git ${cmd}`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const diffSpec = () => {
  const argv = process.argv.slice(2);
  const i = argv.indexOf('--range');
  return i !== -1 && argv[i + 1] ? argv[i + 1] : '--cached';
};

const collectChanges = (spec) => {
  const nameStatus = git(`diff --name-status --diff-filter=AMR ${spec}`).trim();
  const files = nameStatus ? nameStatus.split('\n').map((l) => l.split('\t').pop()) : [];
  const addedLines = {};
  let cur = null;
  let lineNo = 0;
  for (const raw of git(`diff -U0 --diff-filter=AM ${spec}`).split('\n')) {
    if (raw.startsWith('+++ b/')) { cur = raw.slice(6); addedLines[cur] = []; continue; }
    const hunk = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
    if (hunk) { lineNo = parseInt(hunk[1], 10); continue; }
    if (cur && raw.startsWith('+') && !raw.startsWith('+++')) {
      addedLines[cur].push({ n: lineNo, text: raw.slice(1) });
      lineNo += 1;
    }
  }
  return { files, addedLines };
};

const isApproved = (spec) => {
  if (process.env.COPYRIGHT_APPROVED === '1') return true;
  if (spec === '--cached') return false;
  try {
    return git(`log --format=%B ${spec}`).toLowerCase().includes(ALLOW_MARKER.toLowerCase());
  } catch {
    return false;
  }
};

const main = () => {
  const spec = diffSpec();
  const findings = RULES.flatMap((rule) => rule(collectChanges(spec)));
  if (!findings.length) {
    console.log('✓ copyright gate: clean');
    return;
  }
  for (const f of findings) {
    const where = f.line ? `${f.file}:${f.line}` : f.file;
    console.error(`  [${f.rule}] ${where}${f.match ? `: "${f.match}"` : ''}`);
    console.error(`      ${f.hint}`);
  }
  if (isApproved(spec)) {
    console.log("\n✓ owner-approved ([allow-copyright] / 'copyright-ok' label), so the change is allowed.");
    return;
  }
  const blocking = findings.filter((f) => f.severity === 'block' || (f.severity === 'text' && TEXT_RULE_BLOCKS));
  if (!blocking.length) {
    console.log('\n⚠ copyright gate: warnings only, so the change is allowed.');
    return;
  }
  console.error(`\n✗ copyright gate blocked: ${blocking.length} item(s) need owner approval.`);
  console.error("  Commit: add [allow-copyright] to the message.   PR: apply the 'copyright-ok' label.");
  process.exit(1);
};

main();

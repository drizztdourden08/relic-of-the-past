/* @layer tooling-scripts @kind logic */
/**
 * One short report to stderr — silent when both mirrors are clean/unmanaged,
 * specific about what to do when they aren't.
 */
const printReport = ({ ai, vault }) => {
  const lines = [];

  if (ai.status === 'drift') {
    lines.push('ai-config: local edits differ from the last render — these live only in the');
    lines.push('gitignored .claude/ and will be OVERWRITTEN by the next bootstrap render:');
    ai.edits.forEach((p) => lines.push(`  ${p}`));
    lines.push('  -> fold the edit back into the claude-config source, commit + push it there');
  }

  if (vault.status === 'dirty') {
    lines.push('vault: .vault/ has local changes never sent to rotp-vault:');
    vault.files.forEach((p) => lines.push(`  ${p}`));
    lines.push('  -> npm run vault:push "<what changed>"');
  }

  if (!lines.length) return;

  console.error(`\n${'-'.repeat(60)}`);
  console.error('sync-check: local-only work found in ai-config / vault');
  console.error('-'.repeat(60));
  lines.forEach((l) => console.error(l));
  console.error('Add [sync-ack] to the commit message to bypass this check.');
  console.error(`${'-'.repeat(60)}\n`);
};

export { printReport };

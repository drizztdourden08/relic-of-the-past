/* @layer tooling-scripts @kind logic */
/**
 * One short report to stderr — silent when both mirrors are clean/unmanaged,
 * specific about what to do when they aren't.
 *
 * Not everything reported here blocks. An unpushed vault commit is worth saying
 * out loud but is recoverable, so the bypass line only appears when something
 * actually stands in the way — otherwise it reads as an instruction to silence a
 * warning that was never stopping anything.
 */
import { join } from 'node:path';
import { locateAiConfigRepo } from './locate-ai-config-repo.mjs';

const printReport = ({ ai, vault, blocking }) => {
  const lines = [];

  if (ai.status === 'drift') {
    const repo = locateAiConfigRepo();
    lines.push('ai-config: local edits differ from the last render — these live only in the');
    lines.push('gitignored .claude/ and will be OVERWRITTEN by the next bootstrap render:');
    ai.edits.forEach((p) => lines.push(`  ${p}`));
    lines.push('  -> fold the edit back into the claude-config source, commit + push it there');
    lines.push(repo
      ? `  -> then re-render: node "${join(repo, 'ai', 'bootstrap.mjs')}" claude rotp --confirm`
      : '  -> then re-render with your ai-config bootstrap command');
  }

  if (vault.status === 'dirty') {
    lines.push(`vault: ${vault.dir} has uncommitted changes:`);
    vault.files.forEach((p) => lines.push(`  ${p}`));
    lines.push('  -> commit them there, or run npm run vault:sync to settle both sides');
  }

  if (vault.ahead > 0) {
    lines.push(`vault: ${vault.ahead} commit(s) in ${vault.dir} not pushed to rotp-vault`);
    lines.push(`  -> git -C ${vault.dir} push`);
  }

  if (!lines.length) return;

  console.error(`\n${'-'.repeat(60)}`);
  console.error('sync-check: local-only work found in ai-config / vault');
  console.error('-'.repeat(60));
  lines.forEach((l) => console.error(l));
  if (blocking) console.error('Add [sync-ack] to the commit message to bypass this check.');
  console.error(`${'-'.repeat(60)}\n`);
};

export { printReport };

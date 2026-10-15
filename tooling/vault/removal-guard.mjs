/* @layer tooling-scripts @kind logic */
import { execFileSync } from 'node:child_process';

const MAX_MIRRORED_DELETIONS = 10;

const vaultHead = (vaultDir) => {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: vaultDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return null;
  }
};

const guardMirroredDeletions = ({ entries, vaultDir, mode }) => {
  const outgoing = entries.filter((entry) => entry.status === 'local-deleted');
  const head = vaultHead(vaultDir);

  if (outgoing.length === 0) return { blocked: false, outgoing, head };
  if (mode === 'force-push') return { blocked: false, outgoing, head, forced: true };

  return { blocked: outgoing.length > MAX_MIRRORED_DELETIONS, outgoing, head };
};

const refusalLines = ({ outgoing, head }) => [
  `REFUSING to sync: ${outgoing.length} file(s) are gone locally and would be removed from the vault.`,
  'That many at once is far more often an accident than an intent, because an emptied managed root',
  'looks exactly like a deliberate delete by the time it reaches here.',
  '',
  `Nothing has been changed on either side. The vault still holds every one of them${head ? ` at ${head}.` : '.'}`,
  '',
  ...outgoing.slice(0, 10).map((entry) => `  would remove  ${entry.path}`),
  ...(outgoing.length > 10 ? [`  ...and ${outgoing.length - 10} more`] : []),
  '',
  'If the files should go, restore them locally first and delete them deliberately,',
  'or re-run with --force-push to declare this checkout correct.',
];

export { MAX_MIRRORED_DELETIONS, guardMirroredDeletions, refusalLines, vaultHead };

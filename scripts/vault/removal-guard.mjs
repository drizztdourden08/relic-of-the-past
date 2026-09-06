/* @layer tooling-scripts @kind logic */
/**
 * A sync mirrors deletions, and an accident is indistinguishable from an intent by the
 * time it gets here: an emptied managed root reads as "the user deleted these". That
 * happened once, for 233 files, after a worktree removal followed a junction into the
 * main checkout. A local snapshot cannot help (`local-deleted` means the local copy is
 * already gone); the last good copy is the vault's HEAD. So: refuse when the count looks
 * like an accident, and name the vault commit that still holds the files otherwise.
 */
import { execFileSync } from 'node:child_process';

// Deliberately low: a real removal is a handful of files; the incident was 233.
const MAX_MIRRORED_DELETIONS = 10;

/** The vault commit that still holds whatever this sync is about to remove. */
const vaultHead = (vaultDir) => {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: vaultDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return null;  // an unborn vault has nothing to lose yet
  }
};

/** May the mirrored deletions proceed? `force-push` passes through; everything else meets the threshold. */
const guardMirroredDeletions = ({ entries, vaultDir, mode }) => {
  const outgoing = entries.filter((entry) => entry.status === 'local-deleted');
  const head = vaultHead(vaultDir);

  if (outgoing.length === 0) return { blocked: false, outgoing, head };
  if (mode === 'force-push') return { blocked: false, outgoing, head, forced: true };

  return { blocked: outgoing.length > MAX_MIRRORED_DELETIONS, outgoing, head };
};

/** What to tell the user when the guard trips. Kept here so the wording lives with the rule. */
const refusalLines = ({ outgoing, head }) => [
  `REFUSING to sync: ${outgoing.length} file(s) are gone locally and would be removed from the vault.`,
  'That many at once is far more often an accident than an intent, because an emptied managed root',
  'looks exactly like a deliberate delete by the time it reaches here.',
  '',
  'Nothing has been changed on either side. The vault still holds every one of them' +
    (head ? ` at ${head}.` : '.'),
  '',
  ...outgoing.slice(0, 10).map((entry) => `  would remove  ${entry.path}`),
  ...(outgoing.length > 10 ? [`  ...and ${outgoing.length - 10} more`] : []),
  '',
  'If the files really should go, restore them locally first and delete them deliberately,',
  'or re-run with --force-push to declare this checkout correct.',
];

export { MAX_MIRRORED_DELETIONS, guardMirroredDeletions, refusalLines, vaultHead };

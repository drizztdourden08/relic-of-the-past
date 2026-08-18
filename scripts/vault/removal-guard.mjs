/* @layer tooling-scripts @kind logic */
/**
 * Standing between an accident and the vault.
 *
 * A sync mirrors deletions, which is correct: a file the maintainer really removed should
 * leave the vault too. The problem is that an ACCIDENT is indistinguishable from an intent
 * by the time it gets here — an emptied managed root reads as "the user deleted these",
 * and the emptiness gets committed to the vault. That happened once, for 233 files, after
 * a worktree removal followed a junction into the main checkout.
 *
 * A local snapshot cannot help in that direction, and it is important to understand why:
 * `local-deleted` MEANS the local copy is already gone, so a snapshot of local disk
 * captures everything except the one thing at risk. The last good copy is the vault's, and
 * it lives at the vault's HEAD until this sync commits over it.
 *
 * So there are two jobs here, and only the first one actually saves anything:
 *   1. refuse outright when the number of mirrored deletions looks like an accident;
 *   2. name the vault commit that still holds them, for the cases we do allow through.
 */
import { execFileSync } from 'node:child_process';

/**
 * Above this many local deletions in one sync, stop and make a person look.
 *
 * Deliberately low. A real removal is a handful of files someone can recall doing; the
 * incident was 233. Anything in between is worth one question, and the answer is a flag.
 */
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

/**
 * Decide whether the mirrored deletions in `entries` may proceed.
 *
 * `force-push` is an explicit "this checkout wins everywhere", which legitimately includes
 * wholesale removal, so it passes through. Everything else is held to the threshold.
 */
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
  'That many at once is far more often an accident than an intent — an emptied managed root',
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

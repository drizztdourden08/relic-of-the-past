/* @layer tooling-scripts @kind logic */
/**
 * Turns a record plus its git status into one word, and into the two decisions that
 * actually matter: may an agent claim this, and may anything delete it.
 *
 * Pure by design — no filesystem, no git, no clock beyond the `now` passed in — so the
 * rules that decide whether work gets thrown away are unit-testable.
 *
 * Priority matters. A held lease outranks everything, because "someone is working
 * here" is true regardless of what the tree contains. Unmerged or uncommitted work
 * outranks every reuse verdict, because losing it is the one unrecoverable outcome.
 */
import { isExpired, isHeld } from './lease.mjs';

const VERDICTS = {
  MISSING: 'missing',
  LEASED: 'leased',
  HOLDS_WORK: 'holds-work',
  SPENT: 'spent',
  READY: 'ready',
};

/** Has this worktree been worked in? Notes are appended per prompt; a PR is explicit. */
const hasHistory = (record) => (record.notes?.length ?? 0) > 0 || record.pr != null;

const verdictFor = (record, status, now = Date.now()) => {
  if (status.missing) return VERDICTS.MISSING;
  if (isHeld(record.lease, now)) return VERDICTS.LEASED;
  if (status.dirty || (status.ahead > 0 && !status.merged)) return VERDICTS.HOLDS_WORK;
  return hasHistory(record) ? VERDICTS.SPENT : VERDICTS.READY;
};

/**
 * The full picture for one worktree. `staleLease` marks a lease that has expired but
 * not been released — the pool reclaims it silently, and the list says so.
 */
const assess = (record, status, now = Date.now()) => {
  const verdict = verdictFor(record, status, now);
  const reusable = verdict === VERDICTS.READY || verdict === VERDICTS.SPENT;
  return {
    verdict,
    claimable: reusable,
    // Deleting is never allowed to destroy uncommitted or unlanded commits.
    deletable: reusable,
    staleLease: isExpired(record.lease, now),
    behind: status.behind,
  };
};

/**
 * Pick the best worktree to claim. A never-used one wins over a spent one so recycling
 * (which discards its notes) is a last resort; ties break on least catching-up to do.
 */
const bestToClaim = (assessments) => {
  const rank = (a) => (a.assessment.verdict === VERDICTS.READY ? 0 : 1);
  return assessments
    .filter((a) => a.assessment.claimable)
    .sort((a, b) => rank(a) - rank(b) || a.assessment.behind - b.assessment.behind)[0] ?? null;
};

export { VERDICTS, assess, bestToClaim, hasHistory, verdictFor };

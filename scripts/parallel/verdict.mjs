/* @layer tooling-scripts @kind logic */
/**
 * Turns a record plus its git status into a verdict and two decisions: may an agent
 * claim this, and may anything delete it. Pure (no filesystem, git, or clock beyond
 * `now`) so the rules are unit-testable. Priority: a held lease outranks everything;
 * unmerged or uncommitted work outranks every reuse verdict.
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

/** `staleLease` marks a lease that expired without release; the pool reclaims it and the list says so. */
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

/** Best worktree to claim: never-used beats spent (recycling discards notes); ties break on least behind. */
const bestToClaim = (assessments) => {
  const rank = (a) => (a.assessment.verdict === VERDICTS.READY ? 0 : 1);
  return assessments
    .filter((a) => a.assessment.claimable)
    .sort((a, b) => rank(a) - rank(b) || a.assessment.behind - b.assessment.behind)[0] ?? null;
};

export { VERDICTS, assess, bestToClaim, hasHistory, verdictFor };

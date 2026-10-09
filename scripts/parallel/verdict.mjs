/* @layer tooling-scripts @kind logic */
import { isExpired, isHeld } from './lease.mjs';

const VERDICTS = {
  MISSING: 'missing',
  LEASED: 'leased',
  HOLDS_WORK: 'holds-work',
  SPENT: 'spent',
  READY: 'ready',
};

const hasHistory = (record) => (record.notes?.length ?? 0) > 0 || record.pr != null;

const verdictFor = (record, status, now = Date.now()) => {
  if (status.missing) return VERDICTS.MISSING;
  if (isHeld(record.lease, now)) return VERDICTS.LEASED;
  if (status.dirty || (status.ahead > 0 && !status.merged)) return VERDICTS.HOLDS_WORK;
  return hasHistory(record) ? VERDICTS.SPENT : VERDICTS.READY;
};

const assess = (record, status, now = Date.now()) => {
  const verdict = verdictFor(record, status, now);
  const reusable = verdict === VERDICTS.READY || verdict === VERDICTS.SPENT;
  return {
    verdict,
    claimable: reusable,
    deletable: reusable,
    staleLease: isExpired(record.lease, now),
    behind: status.behind,
  };
};

const bestToClaim = (assessments) => {
  const rank = (a) => (a.assessment.verdict === VERDICTS.READY ? 0 : 1);
  return assessments
    .filter((a) => a.assessment.claimable)
    .sort((a, b) => rank(a) - rank(b) || a.assessment.behind - b.assessment.behind)[0] ?? null;
};

export { VERDICTS, assess, bestToClaim, hasHistory, verdictFor };

/* @layer tooling-scripts @kind logic */
/**
 * `wt claim <name>` / `wt claim --any` — take a worktree for this session.
 *
 * `--any` is the path an agent should normally use: it picks the least-drifted free
 * worktree, brings it up to date, leases it and prints the launch command. That is
 * seconds of work, against ~5 minutes for `wt new` — which is the whole reason the
 * pool exists rather than creating a worktree per task.
 *
 * A worktree that holds uncommitted or unlanded work is never handed out, and a dirty
 * tree is never rebased — claiming must not touch work it did not create.
 */
import { updateRegistry, findRecord } from '../registry.mjs';
import { surveyAll } from '../survey.mjs';
import { bestToClaim, VERDICTS } from '../verdict.mjs';
import { DEFAULT_TTL_MS, isHeld, makeLease, parseDuration, currentHolder } from '../lease.mjs';
import { flag } from '../args.mjs';
import { refreshWorktree } from '../refresh.mjs';
import { launchLine } from '../launch-line.mjs';

const resolveTtl = (raw) => {
  if (raw === undefined || raw === true) return DEFAULT_TTL_MS;
  const ms = parseDuration(raw);
  if (ms === null) throw new Error(`Unparseable --ttl "${raw}". Use forms like 90m, 4h, 2d.`);
  return ms;
};

/** Explain refusals in terms of what the agent should do instead. */
const refuse = (name, verdict) => {
  if (verdict === VERDICTS.LEASED) {
    throw new Error(`"${name}" is leased by another session. Use --any, or wait for the lease to expire.`);
  }
  if (verdict === VERDICTS.HOLDS_WORK) {
    throw new Error(`"${name}" holds uncommitted or unlanded work — land or discard it first, by hand.`);
  }
  if (verdict === VERDICTS.MISSING) {
    throw new Error(`"${name}" has no checkout on disk. Run: npm run wt -- doctor`);
  }
  throw new Error(`"${name}" cannot be claimed (${verdict}).`);
};

const pickTarget = (positional, options) => {
  const entries = surveyAll();

  if (flag(options, 'any')) {
    const best = bestToClaim(entries);
    if (!best) {
      throw new Error(
        entries.length === 0
          ? 'The pool is empty. Create one with: npm run wt -- new <name>'
          : 'No free worktree. See: npm run wt:list — then either wait, or npm run wt -- new <name>',
      );
    }
    return best;
  }

  const [name] = positional;
  if (!name) throw new Error('Usage: npm run wt -- claim <name> | --any [--ttl 4h]');

  const entry = entries.find((e) => e.record.name === name);
  if (!entry) throw new Error(`No worktree named "${name}". Run: npm run wt -- list`);
  if (!entry.assessment.claimable) refuse(name, entry.assessment.verdict);
  return entry;
};

const run = async ({ positional, options }) => {
  const ttlMs = resolveTtl(options.ttl);
  const target = pickTarget(positional, options);
  const { record, assessment } = target;

  const lease = await updateRegistry((registry) => {
    const live = findRecord(registry, record.name);
    if (!live) throw new Error(`"${record.name}" disappeared from the registry.`);
    // Re-check under the lock: another agent may have claimed it since the survey.
    if (isHeld(live.lease)) throw new Error(`"${record.name}" was just claimed by ${live.lease.holder}. Try again.`);
    live.lease = makeLease(ttlMs);
    live.lastUsedAt = new Date().toISOString();
    return live.lease;
  });

  console.log(`[wt] Claimed ${record.name} for ${currentHolder()} until ${lease.expiresAt}`);
  if (assessment.verdict === VERDICTS.SPENT) {
    console.log('[wt] This one has been used before — its previous work has landed.');
  }

  if (!flag(options, 'no-refresh')) refreshWorktree(record);

  console.log(`\nWorktree: ${record.path}`);
  console.log(`Branch:   ${record.branch}`);
  console.log(`Profile:  ${record.name}`);
  console.log(`\nLaunch:\n  ${launchLine(record.name)}`);
};

const command = {
  summary: 'Lease a worktree (--any picks the best free one)',
  usage: 'npm run wt -- claim <name> | --any [--ttl 4h] [--no-refresh]',
  run,
};

export { command };

/* @layer tooling-scripts @kind logic */
/**
 * `wt release <name>` — hand a worktree back to the pool.
 *
 * Releasing never requires the lease to belong to this session: a lease left behind by
 * a session that ended abruptly has to be clearable, or the worktree is stranded until
 * its TTL runs out. A mismatch is reported rather than refused.
 *
 * The checkout, the branch and the notes are all left intact — this frees the lease,
 * nothing else. Removal is `wt clean`.
 */
import { updateRegistry, findRecord } from '../registry.mjs';
import { currentHolder, isHeld } from '../lease.mjs';

const run = async ({ positional }) => {
  const [name] = positional;
  if (!name) throw new Error('Usage: npm run wt -- release <name>');

  const released = await updateRegistry((registry) => {
    const record = findRecord(registry, name);
    if (!record) throw new Error(`No worktree named "${name}". Run: npm run wt -- list`);

    const previous = record.lease;
    record.lease = null;
    record.lastUsedAt = new Date().toISOString();
    return previous;
  });

  if (!released) {
    console.log(`[wt] ${name} was already free.`);
    return;
  }

  const me = currentHolder();
  if (released.holder !== me) {
    console.warn(`[wt] Released a lease held by ${released.holder} (this session is ${me}).`);
  }
  console.log(`[wt] Released ${name}${isHeld(released) ? '' : ' (its lease had already expired)'}.`);
};

const command = {
  summary: 'Return a worktree to the pool',
  usage: 'npm run wt -- release <name>',
  run,
};

export { command };

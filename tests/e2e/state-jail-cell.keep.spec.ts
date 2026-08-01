/* @layer tests @kind test */
/**
 * PERMANENT (`.keep.spec.ts`) — do not delete with the scratch specs.
 *
 * `test-jail-cell` is the richest single room in the game for our purposes: a cell
 * lock, a big-key carrier, a chest and the princess all in one 64×64 grid. That
 * makes it the indoor navigation baseline, and it is also the room whose count
 * caught the dumper/widget disagreement that `flood-parity.keep.spec.ts` guards.
 *
 * The meaning worth pinning is that the CELL IS STILL LOCKED: both checks sit
 * behind the lock, so both must read unreachable and the flood must stop at 608.
 * A number that drifts up here means something started walking through the lock.
 */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

test('test-jail-cell still has both checks behind a locked cell', async () => {
  test.setTimeout(300_000);
  await withState('test-jail-cell', async (r) => {
    expect(await r.screenId(), 'the Jail Cell is screen-133 (room 0x080)').toMatch(/^screen-133 · 0x80 · INDOOR/);

    const flood = await r.flood();
    expect(flood, 'the blessed indoor baseline').toEqual({ reachable: 608, total: 4096 });

    expect(await r.groups()).toEqual({
      'Checks': 2, 'Locks & barriers': 1, 'Triggers': 1, 'Ways out': 1,
    });

    // Everything in the room is behind the cell lock, so nothing is collectable.
    const summary = await r.checkSummary();
    expect(summary.blocked, 'both checks sit behind the cell lock').toBe(2);
    expect(summary.available).toBe(0);
    expect(summary.done).toBe(0);

    const rows = await r.rows();
    const lock = rows.find((row) => row.kind === 'cell-lock');
    expect(lock, `no cell lock in ${JSON.stringify(rows)}`).toBeDefined();
    expect(lock?.state, 'a cell lock that reads open invalidates the baseline').toBe('shut');

    // The big-key carrier is the trigger that would eventually open it.
    expect(rows.some((row) => row.kind === 'big-key-carrier'), 'the big-key guard must be annotated').toBe(true);
    expect(rows.filter((row) => row.state === 'unreachable')).toHaveLength(2);
  });
});

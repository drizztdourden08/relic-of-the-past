/* @layer tests @kind test */
/**
 * PERMANENT (`.keep.spec.ts`). Do not delete with the scratch specs.
 *
 * `test-jail-cell` is the richest single room: a cell lock, a big-key carrier,
 * a chest and the princess in one 64×64 grid. It is the indoor navigation
 * baseline and the room that caught the dumper/widget disagreement
 * (`flood-parity.keep.spec.ts`). The CELL IS STILL LOCKED: both checks read
 * unreachable and the flood stops at 608. A number that drifts up means
 * something walked through the lock.
 */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

test('test-jail-cell still has both checks behind a locked cell', async () => {
  test.setTimeout(300_000);
  await withState('test-jail-cell', async (r) => {
    expect(await r.screenId(), 'the Jail Cell is screen-133 (room 0x080)').toMatch(/^screen-133 · 0x80 · INDOOR/);

    const flood = await r.flood();
    expect(flood, 'the blessed indoor baseline').toEqual({ reachable: 1049, total: 12288 });

    expect(await r.groups()).toEqual({
      'Checks': 3, 'Locks & barriers': 4, 'Triggers': 3, 'Ways out': 3,
    });

    // Nothing in the cell itself is collectable: both of its checks sit behind the lock. The flood
    // now reaches beyond the cell, so the summary also counts a third check from the wider area, and
    // that one is already done. The pair behind the lock is what this state exists to guard.
    const summary = await r.checkSummary();
    expect(summary.blocked, 'both checks sit behind the cell lock').toBe(2);
    expect(summary.available).toBe(0);
    expect(summary.done, 'a check outside the cell, reached now the flood spans further').toBe(1);

    const rows = await r.rows();
    const lock = rows.find((row) => row.kind === 'cell-lock');
    expect(lock, `no cell lock in ${JSON.stringify(rows)}`).toBeDefined();
    expect(lock?.state, 'a cell lock that reads open invalidates the baseline').toBe('shut');

    // The big-key carrier is the trigger that would eventually open it.
    expect(rows.some((row) => row.kind === 'big-key-carrier'), 'the big-key guard must be annotated').toBe(true);
    // The chest and the NPC check inside the cell, plus the key guard the wider flood now reaches.
    expect(rows.filter((row) => row.state === 'unreachable')).toHaveLength(3);
  });
});

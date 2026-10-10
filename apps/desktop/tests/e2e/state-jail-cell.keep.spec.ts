/* @layer tests @kind test */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

test('test-jail-cell still has both checks behind a locked cell', async () => {
  test.setTimeout(300_000);
  await withState('test-jail-cell', async (r) => {
    expect(await r.screenId(), 'the Jail Cell is screen-133 (room 0x080)').toMatch(/^screen-133 · 0x80 · INDOOR/);

    const flood = await r.flood();
    expect(flood, 'the blessed indoor baseline').toEqual({ reachable: 1049, total: 12288 });

    expect(await r.groups()).toEqual({
      'Checks': 3, 'Locks & barriers': 4, 'Triggers': 3,
    });

    const summary = await r.checkSummary();
    expect(summary.blocked, 'both checks sit behind the cell lock').toBe(2);
    expect(summary.available).toBe(0);
    expect(summary.done, 'a check outside the cell, reached now the flood spans further').toBe(1);

    const rows = await r.rows();
    const lock = rows.find((row) => row.kind === 'cell-lock');
    expect(lock, `no cell lock in ${JSON.stringify(rows)}`).toBeDefined();
    expect(lock?.state, 'a cell lock that reads open invalidates the baseline').toBe('shut');

    expect(rows.some((row) => row.kind === 'big-key-carrier'), 'the big-key guard must be annotated').toBe(true);
    expect(rows.filter((row) => row.state === 'unreachable')).toHaveLength(3);
  });
});

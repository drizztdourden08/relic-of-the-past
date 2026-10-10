/* @layer tests @kind test */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

test('test-throne-room keeps the follower gate shut with no follower', async () => {
  test.setTimeout(300_000);
  await withState('test-throne-room', async (r) => {
    expect(await r.screenId(), 'the Throne Room is screen-119 (room 0x051)').toMatch(/^screen-119 · 0x51 · INDOOR/);

    const states = await r.states();
    expect(
      states.filter((s) => /following$/.test(s)),
      `a follower would open the gate and invalidate the baseline; chips: ${JSON.stringify(states)}`,
    ).toHaveLength(0);

    const flood = await r.flood();
    expect(flood, 'the blessed count with the gate shut').toEqual({ reachable: 3076, total: 8192 });

    expect(await r.groups()).toEqual({ 'Locks & barriers': 1 });

    const rows = await r.rows();
    const gate = rows.find((row) => row.kind === 'follower-gate');
    expect(gate, `no follower gate annotated in ${JSON.stringify(rows)}`).toBeDefined();
    expect(gate?.state, 'with nobody in tow the push wall stays shut').toBe('shut');
    expect(gate?.detail, 'the gate says what it is waiting for').toMatch(/follower/i);
  });
});

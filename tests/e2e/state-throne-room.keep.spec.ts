/* @layer tests @kind test */
/**
 * PERMANENT (`.keep.spec.ts`) — do not delete with the scratch specs.
 *
 * `test-throne-room` is the only place the follower gate is testable: the push
 * wall behind the throne is `nativeType 0x14`, and it opens only while a follower
 * is in tow. The state is deliberately saved WITHOUT one, so the gate is shut.
 *
 * That pairing is the whole point, and it is easy to break from either side — a
 * save state that gained a follower, or a gate that stops checking. So this spec
 * asserts both halves: the gate reads shut AND there is no follower chip. If a
 * later change made the gate open by default, the 1320-tile count would jump.
 */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

test('test-throne-room keeps the follower gate shut with no follower', async () => {
  test.setTimeout(300_000);
  await withState('test-throne-room', async (r) => {
    expect(await r.screenId(), 'the Throne Room is screen-119 (room 0x051)').toMatch(/^screen-119 · 0x51 · INDOOR/);

    // Half one: nobody is following, which is why the gate is shut.
    const states = await r.states();
    expect(
      states.filter((s) => /following$/.test(s)),
      `a follower would open the gate and invalidate the baseline; chips: ${JSON.stringify(states)}`,
    ).toHaveLength(0);

    const flood = await r.flood();
    expect(flood, 'the blessed count with the gate shut').toEqual({ reachable: 3076, total: 8192 });

    expect(await r.groups()).toEqual({ 'Locks & barriers': 1, 'Ways out': 4 });

    // Half two: the gate itself, annotated as a follower gate and shut.
    const rows = await r.rows();
    const gate = rows.find((row) => row.kind === 'follower-gate');
    expect(gate, `no follower gate annotated in ${JSON.stringify(rows)}`).toBeDefined();
    expect(gate?.state, 'with nobody in tow the push wall stays shut').toBe('shut');
    expect(gate?.detail, 'the gate says what it is waiting for').toMatch(/follower/i);
  });
});

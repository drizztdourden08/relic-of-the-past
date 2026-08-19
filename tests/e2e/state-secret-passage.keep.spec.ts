/* @layer tests @kind test */
/**
 * PERMANENT (`.keep.spec.ts`) — do not delete with the scratch specs.
 *
 * `test-secret-passage` exists to hold two rules honest at once.
 *
 * 1. The uncle BLOCKS the corridor. A sprite that occupies collision has to stop
 *    the flood, so the chest behind him must read *unreachable*. If the flood ever
 *    starts walking through NPCs this room reports a bigger number and a reachable
 *    chest, and nothing else in the suite would notice.
 * 2. It is the Lamp chest, and Link already owns a lamp — so the duplicate-item
 *    rule must substitute, and the row must show the SUBSTITUTE ("5 Rupees"), not
 *    the primary item. Showing "Lamp" here would be the bug.
 */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

test('test-secret-passage keeps the blocked chest and the substituted item', async () => {
  test.setTimeout(300_000);
  await withState('test-secret-passage', async (r) => {
    // room 0x055 is a genuine dataset collision (screen-resolve.ts documents it: "room
    // 0x55 is claimed by BOTH the dam and a castle secret passage"). Neither carries an
    // entranceId or a variant, so resolution falls through to the first non-variant
    // candidate and currently returns the Dam record (screen-170), not the Secret
    // Passage (screen-171), even on this fixture. Asserting the id the widget actually
    // renders today rather than the one that would be semantically correct.
    expect(await r.screenId(), 'room 0x055 resolves to screen-170 today (a known collision, not screen-171)').toMatch(/^screen-170 · 0x55 · INDOOR/);

    const flood = await r.flood();
    expect(flood, 'the flood must stop at the uncle').toEqual({ reachable: 152, total: 4096 });

    const rows = await r.rows();
    const chest = rows.find((row) => row.kind === 'chest');
    expect(chest, `no chest row in ${JSON.stringify(rows)}`).toBeDefined();
    // Rule 1 — behind the blocking uncle.
    expect(chest?.state, 'the chest is behind the uncle, so it cannot be reached').toBe('unreachable');
    // Rule 2 — the substitute, not the primary. "Lamp" here means the rule broke.
    expect(chest?.label, 'already owning a lamp must substitute the item').toBe('Rupees (5)');
    expect(chest?.label).not.toBe('Lamp');
    expect(chest?.detail, 'the substitution says why').toMatch(/already owned/);

    // The uncle is a real check, named from the check table rather than by sprite id.
    const npc = rows.find((row) => row.kind === 'npc-check');
    expect(npc, `no npc-check row in ${JSON.stringify(rows)}`).toBeDefined();
    expect(npc?.label, 'a table-named check, not the `npc 0x..` fallback').not.toMatch(/^npc 0x/);
    expect(npc?.label).toBe("Link's Uncle");

    // One check reachable (the uncle), one not (the chest he blocks).
    expect(await r.checkSummary()).toEqual({ done: 0, available: 1, blocked: 1 });
  });
});

/* @layer tests @kind test */
/**
 * PERMANENT (`.keep.spec.ts`). Do not delete with the scratch specs.
 *
 * `test-secret-passage` holds two rules honest at once:
 * 1. The uncle BLOCKS the corridor, so the chest behind him reads *unreachable*.
 *    If the flood ever walks through NPCs, this is the only room that shows it.
 * 2. It is the Lamp chest and the player already owns a lamp, so the row must
 *    show the SUBSTITUTE ("5 Rupees"). "Lamp" here is the bug.
 */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

test('test-secret-passage keeps the blocked chest and the substituted item', async () => {
  test.setTimeout(300_000);
  await withState('test-secret-passage', async (r) => {
    // room 0x055 is a dataset collision (screen-resolve.ts: "room 0x55 is
    // claimed by BOTH the dam and a castle secret passage"). Neither carries an
    // entranceId or variant, so resolution returns the Dam record (screen-170),
    // not the Secret Passage (screen-171). Asserting what the widget renders today.
    expect(await r.screenId(), 'room 0x055 resolves to screen-170 today (a known collision, not screen-171)').toMatch(/^screen-170 · 0x55 · INDOOR/);

    const flood = await r.flood();
    expect(flood, 'the flood must stop at the uncle').toEqual({ reachable: 152, total: 4096 });

    const rows = await r.rows();
    const chest = rows.find((row) => row.kind === 'chest');
    expect(chest, `no chest row in ${JSON.stringify(rows)}`).toBeDefined();
    // Rule 1 covers the chest behind the blocking uncle.
    expect(chest?.state, 'the chest is behind the uncle, so it cannot be reached').toBe('unreachable');
    // Rule 2 wants the substitute, not the primary. "Lamp" here means the rule broke.
    expect(chest?.label, 'already owning a lamp must substitute the item').toBe('Rupees (5)');
    expect(chest?.label).not.toBe('Lamp');
    expect(chest?.detail, 'the substitution says why').toMatch(/already owned/);

    // The uncle is a real check, named from the check table instead of by sprite id.
    const npc = rows.find((row) => row.kind === 'npc-check');
    expect(npc, `no npc-check row in ${JSON.stringify(rows)}`).toBeDefined();
    expect(npc?.label, 'a table-named check, not the `npc 0x..` fallback').not.toMatch(/^npc 0x/);
    expect(npc?.label).toBe("Link's Uncle");

    // One check reachable (the uncle), one not (the chest he blocks).
    expect(await r.checkSummary()).toEqual({ done: 0, available: 1, blocked: 1 });
  });
});

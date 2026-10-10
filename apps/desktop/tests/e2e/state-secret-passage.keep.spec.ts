/* @layer tests @kind test */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

test('test-secret-passage keeps the blocked chest and the substituted item', async () => {
  test.setTimeout(300_000);
  await withState('test-secret-passage', async (r) => {
    expect(await r.screenId(), 'room 0x055 resolves to screen-170 today (a known collision, not screen-171)').toMatch(/^screen-170 · 0x55 · INDOOR/);

    const flood = await r.flood();
    expect(flood, 'the flood must stop at the uncle').toEqual({ reachable: 152, total: 4096 });

    const rows = await r.rows();
    const chest = rows.find((row) => row.kind === 'chest');
    expect(chest, `no chest row in ${JSON.stringify(rows)}`).toBeDefined();
    expect(chest?.state, 'the chest is behind the uncle, so it cannot be reached').toBe('unreachable');
    expect(chest?.label, 'already owning a lamp must substitute the item').toBe('Rupees (5)');
    expect(chest?.label).not.toBe('Lamp');
    expect(chest?.detail, 'the substitution says why').toMatch(/already owned/);

    const npc = rows.find((row) => row.kind === 'npc-check');
    expect(npc, `no npc-check row in ${JSON.stringify(rows)}`).toBeDefined();
    expect(npc?.label, 'a table-named check, not the `npc 0x..` fallback').not.toMatch(/^npc 0x/);
    expect(npc?.label).toBe("Link's Uncle");

    expect(await r.checkSummary()).toEqual({ done: 0, available: 1, blocked: 1 });
  });
});

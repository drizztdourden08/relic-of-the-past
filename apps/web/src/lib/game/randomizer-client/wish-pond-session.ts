/* @layer bridge-wasm @kind logic */
/**
 * Wish-pond arming for a session, the impure half: hands both waters' rungs to
 * the core in the single call it takes (the core empties both tables at once),
 * then each armed water's two host lines, and logs one line per water. The
 * translation itself is wish-pond-rungs.ts.
 *
 * Arm after the plan's own overrides: a water at its native economy pays out
 * through the npc entries those put in the table, and a custom rung's fire id
 * comes from the same ledger they allocate from.
 *
 * A planned water hands over the next rung on each visit, and a spent water
 * only shows its closing line. A rung with no demand takes no throw and asks
 * nothing. A rung with one asks for it first, through the visit every pond
 * shares (pond-demand-session.ts arms the demands and their lines).
 */

import { log } from '../../log-bus';
import { clearWishPondPlan, setWishPondLines, setWishPondRungs } from '../wish-pond-plan';
import type { WishPondSessionPlan, WishPondWaterPlan } from './wish-pond-rungs';

const hex = (id: number): string => `0x${id.toString(16).padStart(2, '0')}`;

const logWater = (water: WishPondWaterPlan, tag: string): void => {
  const { label, pond, mode, rungs, refusal } = water;
  if (refusal !== undefined) {
    log.randomizer(`${tag} ${label}: NOT armed (${mode}), ${refusal}; the native branches stay`, 'warn');
    return;
  }
  if (rungs.length === 0) {
    log.randomizer(`${tag} ${label}: the native branches, core not armed`);
    return;
  }
  const route = mode === 'vanilla-cost' ? 'vanilla ids through the npc table' : 'placed items, fire-reported';
  log.randomizer(`${tag} ${label} armed as pond ${pond}: ${rungs.length} rungs, one per visit, ${route}: `
    + rungs.map((row) => `"${row.location}" -> ${hex(row.newItem)} (fire ${row.fireId})`).join(', '));
};

const armWishPondSession = (plan: WishPondSessionPlan, tag: string): void => {
  const { waters, rungs } = plan;
  for (const water of waters) logWater(water, tag);
  if (rungs.length === 0) return;
  setWishPondRungs(rungs);
  for (const { pond, rungs: waterRungs, lines } of waters) {
    if (waterRungs.length > 0) setWishPondLines({ pond, ...lines });
  }
};

const disarmWishPondSession = (): void => {
  clearWishPondPlan();
};

export { armWishPondSession, disarmWishPondSession };

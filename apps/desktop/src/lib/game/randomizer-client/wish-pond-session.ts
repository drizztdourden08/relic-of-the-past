/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { setWishPondLines, setWishPondRungs } from '../wish-pond-plan';
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

export { armWishPondSession };

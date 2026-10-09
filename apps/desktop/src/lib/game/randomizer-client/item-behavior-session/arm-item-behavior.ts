/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { setItemPower } from '../../item-power';
import { setProgressiveTiers } from '../../progressive-tiers';
import { setRetroBow } from '../../retro-bow';
import { setRetroShelves } from '../../retro-shelf';
import { setSessionStoryGates } from '../../story-gates';
import type { ItemBehaviorPlan } from './item-behavior-session.type';

const armItemBehavior = (plan: ItemBehaviorPlan, tag: string): void => {
  setSessionStoryGates(plan.storyGates);
  if (plan.vanilla) {
    log.randomizer(`${tag} Item behaviour: every tier present and nothing altered, core not armed`);
    return;
  }
  setProgressiveTiers(plan.tiers, plan.modes);
  setItemPower(plan.itemPower, plan.darkRooms);
  const retroSeed = plan.retroBow.enabled;
  if (retroSeed) setRetroBow(plan.retroBow);
  if (retroSeed) setRetroShelves(plan.retroShelves);
};

export { armItemBehavior };

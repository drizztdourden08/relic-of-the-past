/* @layer bridge-wasm @kind logic */
import { clearItemPower } from '../../item-power';
import { clearProgressiveTiers } from '../../progressive-tiers';
import { clearRetroBow } from '../../retro-bow';
import { clearRetroShelves } from '../../retro-shelf';
import { setSessionStoryGates } from '../../story-gates';

const disarmItemBehavior = (): void => {
  setSessionStoryGates(null);
  clearProgressiveTiers();
  clearItemPower();
  clearRetroShelves();
  clearRetroBow();
};

export { disarmItemBehavior };

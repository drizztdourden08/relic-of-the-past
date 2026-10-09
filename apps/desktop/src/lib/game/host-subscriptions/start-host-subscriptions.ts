/* @layer bridge-wasm @kind logic */
import { initGearOwnership } from '../gear-ownership';
import { initHostMenu } from '@rotp/game-core';
import { initMusicDebug } from '@rotp/msu';

const startHostSubscriptions = (profileId: string | null): void => {
  initGearOwnership(profileId);
  initHostMenu();
  initMusicDebug();
};

export { startHostSubscriptions };

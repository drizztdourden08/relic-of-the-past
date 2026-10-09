/* @layer bridge-wasm @kind logic */
import { initGearOwnership } from '../gear-ownership';
import { initHostMenu } from '../host-menu';
import { initMusicDebug } from '../music-debug';

const startHostSubscriptions = (profileId: string | null): void => {
  initGearOwnership(profileId);
  initHostMenu();
  initMusicDebug();
};

export { startHostSubscriptions };

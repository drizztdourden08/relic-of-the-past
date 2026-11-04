/* @layer bridge-wasm @kind logic */
import { initGearOwnership } from '../gear-ownership';
import { initHostMenu } from '@rotp/game-core';
import { alttpMsuConfig, createTraceHandlers, initMusicDebug } from '@rotp/msu';
import { msuHost } from '../msu-session/msu-host';

const startHostSubscriptions = (profileId: string | null): void => {
  initGearOwnership(profileId);
  initHostMenu();
  initMusicDebug(msuHost);
  const trace = createTraceHandlers(alttpMsuConfig);
  window.__onSoundTrace = trace.onSoundTrace;
  window.__onMusicTrace = trace.onMusicTrace;
};

export { startHostSubscriptions };

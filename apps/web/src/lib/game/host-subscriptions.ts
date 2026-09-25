/* @layer bridge-wasm @kind logic */
/**
 * The host-side records and subscriptions a running core feeds, started and stopped with it.
 *
 * Each is an explicit call and never a subscription run at import time: host-menu used to
 * subscribe on import, which the bundled build evaluated inside the wasm-bridge re-export cycle
 * and threw on. They start after the module is set and the live flags are re-asserted, and
 * before the UI bridge takes its first reading.
 */
import { initGearOwnership } from './gear-ownership';
import { initHostMenu } from './host-menu';
import { initMusicDebug } from './music-debug';

/**
 * Keys the gear high-water record to the profile (the ui-bridge observer re-checks the id on
 * every reading, but the record has to point at the right file before the first one lands),
 * installs the host menu's boot watcher (it replays the current state, so it still catches this
 * boot), and attaches the music debugger to the core's sound and music traces.
 */
const startHostSubscriptions = (profileId: string | null): void => {
  initGearOwnership(profileId);
  initHostMenu();
  initMusicDebug();
};

/** The gear record is keyed by profile, so it is dropped with the module. */
const stopHostSubscriptions = (): void => initGearOwnership(null);

export { startHostSubscriptions, stopHostSubscriptions };

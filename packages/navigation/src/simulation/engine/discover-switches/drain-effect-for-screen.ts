/* @layer shared-game @kind logic */
import type { DrainSwitch } from './discover-switches.type';
import { DRAIN_SWITCHES } from './discover-switches.constants';

const drainEffectForScreen = (screenId: number): DrainSwitch | undefined => DRAIN_SWITCHES.find((d) => d.screen === screenId);

export { drainEffectForScreen };

/* @layer bridge-wasm @kind logic */
import { setSessionGate } from '../../session-gate-flags';

const setGearArtActive = (on: boolean): void => setSessionGate('gearArt', on);

export { setGearArtActive };

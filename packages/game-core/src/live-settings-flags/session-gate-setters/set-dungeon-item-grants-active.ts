/* @layer bridge-wasm @kind logic */
import { setSessionGate } from '../../session-gate-flags';

const setDungeonItemGrantsActive = (on: boolean): void => setSessionGate('dungeonItemGrants', on);

export { setDungeonItemGrantsActive };

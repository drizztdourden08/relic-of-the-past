/* @layer bridge-wasm @kind logic */
import { KEY_PREFIX } from './client-status.constants';

const clientStatusKey = (team: number, slot: number): string => `${KEY_PREFIX}${team}_${slot}`;

export { clientStatusKey };

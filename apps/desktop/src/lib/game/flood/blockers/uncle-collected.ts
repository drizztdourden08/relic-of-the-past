/* @layer bridge-wasm @kind logic */
import { getCompletedChecks } from '../../tracker';
import { npcCheckFor } from '../annotate/npc-checks';
import { UNCLE_CHECK_ROOM, UNCLE_SPRITE } from './blockers.constants';

const uncleCollected = (): boolean =>
  npcCheckFor(UNCLE_SPRITE, UNCLE_CHECK_ROOM, getCompletedChecks())?.done === true;

export { uncleCollected };

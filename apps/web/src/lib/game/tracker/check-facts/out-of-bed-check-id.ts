/* @layer bridge-wasm @kind logic */
import { getCheckByGameId } from '@shared/game/data';
import type { CheckId } from '@shared/game/data';
import { BED_STATE_BUFFER_INDEX } from './check-facts.constants';

const outOfBedCheckId = (): CheckId | undefined =>
  getCheckByGameId({ bufferIndex: BED_STATE_BUFFER_INDEX, compare: 'gte', value: 2 })?.id;

export { outOfBedCheckId };

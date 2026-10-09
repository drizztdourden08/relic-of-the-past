/* @layer shared-game @kind constants */
import type { ParsedSlotData } from './slot-data.type';

const ARCHIPELAGO_ROLL_WORD = /^random$/i;

const MALFORMED_SLOT_DATA: ParsedSlotData = { kind: 'malformed' };

export { ARCHIPELAGO_ROLL_WORD, MALFORMED_SLOT_DATA };

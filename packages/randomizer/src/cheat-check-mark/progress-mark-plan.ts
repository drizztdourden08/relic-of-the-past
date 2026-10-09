/* @layer bridge-wasm @kind logic */
import type { CheckRecord } from '@rotp/game-data';
import { voidCall, numArgs } from '@rotp/game-core';
import type { MarkPlan } from './cheat-check-mark.type';
import { BUFFER_INDEX_OF_FLAG_TYPE, NO_ITEM_SENTINEL, SUBSTITUTION_BUFFER_INDEXES } from './cheat-check-mark.constants';

const markSubstitutionTaken = (vanillaItemId: number): void =>
  voidCall('WasmCheatMarkSubstitutionTaken', numArgs(vanillaItemId));

const markNpcFlag = (flagType: number, flagMask: number, spriteType: number, postGfx: number): void =>
  voidCall('WasmTriggerNpcCheck', numArgs(flagType, flagMask, NO_ITEM_SENTINEL, spriteType, postGfx));

const progressMarkPlan = (check: CheckRecord, bufferIndex: number): MarkPlan => {
  const { itemId, flagType, flagMask, spriteType, postGfx } = check.gameId;
  if (SUBSTITUTION_BUFFER_INDEXES.has(bufferIndex)) {
    if (itemId === undefined) return { refusal: 'its completion bit has no key in the record' };
    return { write: () => markSubstitutionTaken(itemId) };
  }
  if (flagType === undefined || flagMask === undefined || flagMask === 0) {
    return { refusal: 'its completion is a save byte the console has no mask for' };
  }
  if (BUFFER_INDEX_OF_FLAG_TYPE[flagType] !== bufferIndex) {
    return { refusal: 'its flag byte and its detection disagree in the record' };
  }
  return { write: () => markNpcFlag(flagType, flagMask, spriteType ?? 0, postGfx ?? 0) };
};

export { progressMarkPlan };

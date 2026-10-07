/* @layer bridge-wasm @kind logic */
/**
 * Recording a check as collected, without handing anything over.
 *
 * The write is chosen from the check's own DETECTION, never from its grant coordinates. Those two
 * are not the same fact and for several checks they do not even live in the same byte: a wish pond
 * carries flagType 2 and flagMask 0 for its grant, while the tracker and the poller read its
 * substitution-completion bit in the progress buffer. Marking the grant side wrote a zero mask into
 * a byte nothing observes, so the item went out and the check stayed open. Deriving the write from
 * detectionOf, the function the tracker itself reads through, is what keeps the two surfaces
 * pointed at one fact.
 *
 * A check whose completion cannot be written honestly is refused, never approximated. That covers
 * every threshold detection (key counts, capacity tiers, pond throws): those are counters the game
 * reads for more than this one check, and faking one corrupts the file.
 */

import { voidCall } from './bridge/wasm-call';
import { detectionOf } from './randomizer-client/check-detection';
import { cheatItemGrantAllowed } from './cheats';
import type { CheckRecord } from '@shared/game/data';

/** The core's "no item" argument for a trigger export: record the flag, hand nothing over. */
const NO_ITEM_SENTINEL = 0xff;

/**
 * Progress-buffer bytes that hold the substitution-completion bits (state_queries_progress.c
 * [21], [22] and [25]; the table that allocates them is in npc_overrides.c). A check detected
 * through one of these is recorded by its substitution key, which is the vanilla receive id its
 * giver's own script grants.
 */
const SUBSTITUTION_BUFFER_INDEXES: ReadonlySet<number> = new Set([21, 22, 25]);

/**
 * Progress buffer index of each flagType the npc trigger accepts. The two numberings DISAGREE
 * (check_triggers.c takes flagType 0 as sram_progress_flags, which the buffer publishes at [1]),
 * so a mark that assumed they matched would write the wrong byte.
 */
const BUFFER_INDEX_OF_FLAG_TYPE: Readonly<Record<number, number>> = { 0: 1, 1: 0, 2: 2 };

const numArgs = (...args: number[]): { argTypes: string[]; args: unknown[] } =>
  ({ argTypes: args.map(() => 'number'), args });

/** Chest slot: the room word plus, in the loaded room, the open-chest tile, through the chest trigger. */
const markChestCollected = (roomId: number, chestIndex: number): void =>
  voidCall('WasmCheatTriggerCheck', numArgs(roomId, chestIndex, NO_ITEM_SENTINEL));

/** A possession-gated giver: the one bit that says its check was taken. */
const markSubstitutionTaken = (vanillaItemId: number): void =>
  voidCall('WasmCheatMarkSubstitutionTaken', numArgs(vanillaItemId));

/** An overworld event bit, through the trigger export that already honours the no-item sentinel. */
const markOverworldEvent = (owScreen: number, mask: number): void =>
  voidCall('WasmTriggerOverworldCheck', numArgs(owScreen, mask, NO_ITEM_SENTINEL));

/** A giver flag byte, same sentinel, which also records the giver's own post-grant state. */
const markNpcFlag = (flagType: number, flagMask: number, spriteType: number, postGfx: number): void =>
  voidCall('WasmTriggerNpcCheck', numArgs(flagType, flagMask, NO_ITEM_SENTINEL, spriteType, postGfx));

/** Why a check cannot be recorded, for the row to show instead of a button that does nothing. */
type MarkPlan = { write: () => void } | { refusal: string };

const isWritable = (plan: MarkPlan): plan is { write: () => void } => 'write' in plan;

const progressMarkPlan = (check: CheckRecord, bufferIndex: number): MarkPlan => {
  const { itemId, flagType, flagMask, spriteType, postGfx } = check.gameId;
  if (SUBSTITUTION_BUFFER_INDEXES.has(bufferIndex)) {
    if (itemId === undefined) return { refusal: 'its completion bit has no key in the record' };
    return { write: () => markSubstitutionTaken(itemId) };
  }
  // A real save byte: the npc trigger writes it, but only a non-zero mask writes anything, and the
  // flag it names has to be the byte the detection reads.
  if (flagType === undefined || flagMask === undefined || flagMask === 0) {
    return { refusal: 'its completion is a save byte the console has no mask for' };
  }
  if (BUFFER_INDEX_OF_FLAG_TYPE[flagType] !== bufferIndex) {
    return { refusal: 'its flag byte and its detection disagree in the record' };
  }
  return { write: () => markNpcFlag(flagType, flagMask, spriteType ?? 0, postGfx ?? 0) };
};

/**
 * How this check's completion would be recorded, or why it cannot be. Pure, so the widget can call
 * it to decide whether the Grant button is live.
 */
const markPlanOf = (check: CheckRecord): MarkPlan => {
  const detection = detectionOf(check.id);
  if (detection === null) return { refusal: 'the record carries no detection to write back' };
  if (detection.mode === 'room-mask') {
    const { roomId, chestIndex } = check.gameId;
    if (roomId === undefined || chestIndex === undefined) {
      return { refusal: 'its room flag is not a chest slot the console can open' };
    }
    return { write: () => markChestCollected(roomId, chestIndex) };
  }
  if (detection.mode === 'ow-mask') {
    const { owScreen, mask } = detection;
    return { write: () => markOverworldEvent(owScreen, mask) };
  }
  if (detection.mask === undefined) {
    return { refusal: 'its completion is a counter, which the console will not fake' };
  }
  return progressMarkPlan(check, detection.bufferIndex);
};

/** Runs the plan, under the cheat gate. A refused plan writes nothing. */
const markCheckCollected = (check: CheckRecord): void => {
  if (!cheatItemGrantAllowed()) return;
  const plan = markPlanOf(check);
  if (isWritable(plan)) plan.write();
};

export { isWritable, markCheckCollected, markPlanOf };
export type { MarkPlan };

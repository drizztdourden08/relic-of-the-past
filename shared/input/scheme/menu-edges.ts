/* @layer shared-input @kind logic */
/**
 * Turns two consecutive function reads into the pause machine's events.
 *
 * RISING EDGES ONLY. A menu must not act on a held button (holding confirm
 * for two frames is one confirm, not sixty), so every event here fires on
 * the frame a function goes from up to down and never again until it is
 * released. Auto-repeat, if the menu ever wants it, belongs to the machine
 * that owns the cursor, not to this reader.
 *
 * Emission order is fixed (move, confirm, cancel, prevScreen, nextScreen,
 * pause, slot) so a frame that presses two things at once always reduces the
 * same way: the cursor moves before what lands on it is confirmed, and pause
 * (which can close the menu) is handled after the verbs that assume it is
 * still open.
 *
 * ONE PRESS, ONE MEANING. Contract §11 puts a menu verb and a gameplay slot on
 * the same physical button on purpose, so a button the menu consumes as a verb
 * would otherwise ALSO rise as a slot here, and a slot press assigns. That is
 * ordinary navigation silently rewriting the player's setup: walking Items →
 * Gear → Status re-assigned every screen key to whatever the cursor landed on.
 * `shadowed` names the slots in that position; their edges are dropped, because
 * the verb is what the player pressed the button for while the menu is open.
 * The set is a property of the BINDINGS, not of the frame, which is why it
 * arrives as a parameter. This reader is handed two masks and cannot see that
 * `confirm` and slot 4 are one key (see menu-shadowed-slots.ts).
 */
import { DIRECTION_BIT } from './function-mask';
import type { FunctionMask } from './function-mask';
import type { SlotIndex } from '../../types/controls';
import type { PauseEvent } from '@shared/game/logic/pause/pause-machine';

type MoveDirection = 'up' | 'down' | 'left' | 'right';

const MOVE_ORDER: readonly MoveDirection[] = ['up', 'down', 'left', 'right'];

const rose = (now: boolean, prev: boolean): boolean => now && !prev;

const roseBit = (now: number, prev: number, bit: number): boolean => {
  return (now & bit) !== 0 && (prev & bit) === 0;
};

const menuEdges = (
  now: FunctionMask,
  prev: FunctionMask,
  shadowed: ReadonlySet<SlotIndex>,
): PauseEvent[] => {
  const events: PauseEvent[] = [];

  for (const dir of MOVE_ORDER) {
    if (roseBit(now.dpad, prev.dpad, DIRECTION_BIT[dir])) events.push({ type: 'move', dir });
  }
  if (rose(now.menu.confirm, prev.menu.confirm)) events.push({ type: 'confirm' });
  if (rose(now.menu.cancel, prev.menu.cancel)) events.push({ type: 'cancel' });
  if (rose(now.menu.prevScreen, prev.menu.prevScreen)) events.push({ type: 'prevScreen' });
  if (rose(now.menu.nextScreen, prev.menu.nextScreen)) events.push({ type: 'nextScreen' });
  if (rose(now.pause, prev.pause)) events.push({ type: 'pause' });

  const held = new Set(prev.slots);
  for (const slot of now.slots) {
    if (shadowed.has(slot)) continue;
    if (!held.has(slot)) events.push({ type: 'slot', slot });
  }

  return events;
};

export { menuEdges };
export type { MoveDirection };

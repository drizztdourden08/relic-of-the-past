/* @layer shared-input @kind logic */
import { DIRECTION_BIT } from './function-mask';
import { MOVE_ORDER } from './menu-edges.constants';
import type { FunctionMask } from './function-mask';
import type { SlotIndex, PauseEvent } from '@rotp/game-data';

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

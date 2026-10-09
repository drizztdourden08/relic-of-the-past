/* @layer bridge-wasm @kind logic */
import type { ScreenCrossing } from '@rotp/game-core';
import { FALL_HOLE_ID_BASE } from '../flood/overworld-entrances';
import { FLOOD_ENTRANCE_PREFIXES } from './usable-crossings.constants';

const floodEntranceIdOf = (crossing: ScreenCrossing, isIndoors: boolean): number | null => {
  const [prefix, tail] = crossing.id.split(':');
  if (!FLOOD_ENTRANCE_PREFIXES.includes(prefix)) return null;
  const id = Number(tail);
  if (Number.isNaN(id)) return null;
  return prefix === 'hole' && !isIndoors ? FALL_HOLE_ID_BASE + id : id;
};

export { floodEntranceIdOf };

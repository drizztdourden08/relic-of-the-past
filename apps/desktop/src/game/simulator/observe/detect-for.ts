/* @layer bridge-wasm @kind logic */
import type { EngineState } from '@rotp/navigation';
import { detectScreenExits } from '../screen-exits';
import type { DetectedScreen } from '@rotp/navigation';
import { ENTRY_REGION_SHIFT } from '@rotp/navigation';
import { floodItems } from '@rotp/navigation';
import type { DetectCache } from '@rotp/navigation';

const detectFor = (state: EngineState, cache: DetectCache): DetectedScreen | null => {
  const t = state.virtual.tile;
  const key = `${state.virtual.screenId}#${state.epoch}#${t.row >> ENTRY_REGION_SHIFT},${t.col >> ENTRY_REGION_SHIFT}`;
  if (!cache.has(key)) {
    cache.set(key, detectScreenExits(state.virtual.screenId, { entryTile: state.virtual.tile, items: floodItems(state) }));
  }
  return cache.get(key) ?? null;
};

export { detectFor };

/* @layer bridge-wasm @kind logic */
import type { EngineState } from '@shared/game/simulation';
import { detectScreenExits } from '../screen-exits';
import type { DetectedScreen } from '../screen-exits.type';
import { ENTRY_REGION_SHIFT } from './observe.constants';
import { floodItems } from './flood-items';
import type { DetectCache } from './observe.type';

const detectFor = (state: EngineState, cache: DetectCache): DetectedScreen | null => {
  const t = state.virtual.tile;
  const key = `${state.virtual.screenId}#${state.epoch}#${t.row >> ENTRY_REGION_SHIFT},${t.col >> ENTRY_REGION_SHIFT}`;
  if (!cache.has(key)) {
    cache.set(key, detectScreenExits(state.virtual.screenId, { entryTile: state.virtual.tile, items: floodItems(state) }));
  }
  return cache.get(key) ?? null;
};

export { detectFor };

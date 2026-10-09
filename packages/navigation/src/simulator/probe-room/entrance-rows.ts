/* @layer bridge-wasm @kind logic */
import { wasmGetOverworldEntrances, wasmGetEntranceSpawns, wasmGetAreaHeads } from '@rotp/game-core';
import { enrichEntrances } from '../../flood/overworld-entrances';
import type { EntranceRow } from './probe-room.type';

const entranceRows = (entranceIds: number[]): EntranceRow[] => {
  const raw = wasmGetOverworldEntrances();
  const enriched = enrichEntrances();
  const spawns = wasmGetEntranceSpawns();
  const heads = wasmGetAreaHeads();
  return entranceIds.map((id) => {
    const idx = raw.findIndex((e) => e.id === id);
    const r = raw[idx];
    const en = enriched.find((e) => e.id === id);
    const sp = spawns?.[id];
    return {
      id,
      tableIndex: idx,
      rawArea: r?.area ?? -1,
      rawPos: r?.pos ?? -1,
      ...(sp ? { spawnX: sp.x, spawnY: sp.y } : {}),
      ...(en ? { enrichedArea: en.area, gridRow: en.gridRow, gridCol: en.gridCol } : {}),
      ...(r && heads ? { areaHead: heads[r.area] } : {}),
    };
  });
};

export { entranceRows };

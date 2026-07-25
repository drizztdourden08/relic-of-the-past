/* @layer bridge-wasm @kind logic */
/**
 * Numeric screen/room indices → dataset screen ids, progress-aware. Display and
 * traversal both key on screen ids, but the game only speaks indices; room
 * indices additionally collide across the dataset (e.g. room 0x55 is BOTH 'dam'
 * and 'hyrule-castle-secret-passage'), so interior resolution prefers candidates
 * sharing the SOURCE screen's world, then its location.
 */
import type { GridPos } from '@shared/game/navigation';
import type { VariantGameState } from '@shared/game/data/screens';
import type { ScreenDefinition } from '@shared/game/types';
import type { SimArea } from '@shared/game/simulation';
import { resolveCurrentScreen, SCREEN_BY_ID } from '@shared/game/data/screens';
import { computeBigScreenGroup } from '@domains/widgets/navigation/widget-helpers';
import { wasmGetEntranceSpawns, wasmGetProgressIndicator } from '../';
import { getCompletedChecks } from '../tracker';

const variantState = (): VariantGameState => ({
  completedChecks: getCompletedChecks(),
  progressTier: wasmGetProgressIndicator()?.tier,
});

const owScreenId = (idx: number): string =>
  resolveCurrentScreen(false, 0xff, 0, idx, undefined, variantState())?.id ?? `ow:${idx}`;

/** Progress-matching variant first, then the non-variant base, then anything. */
const pickVariant = (list: ScreenDefinition[]): ScreenDefinition => {
  const tier = wasmGetProgressIndicator()?.tier ?? 0;
  const cond = (s: ScreenDefinition) => s.variant?.condition;
  const match = list.find((s) => {
    const c = cond(s);
    return c?.type === 'progress' && (c.max == null || tier <= c.max) && (c.min == null || tier >= c.min);
  });
  return match ?? list.find((s) => !s.variant) ?? list[0];
};

/** Interior room index → screen id, disambiguated by the source screen. */
const interiorScreenId = (destRoom: number, src?: ScreenDefinition): string => {
  const candidates = [...SCREEN_BY_ID.values()].filter((s) => s.type !== 'overworld' && s.roomIndex === destRoom);
  if (candidates.length === 0) return `room:${destRoom}`;
  const sameWorld = src ? candidates.filter((c) => c.world === src.world) : [];
  const sameLocation = src ? sameWorld.filter((c) => c.location === src.location) : [];
  return pickVariant(sameLocation.length > 0 ? sameLocation : sameWorld.length > 0 ? sameWorld : candidates).id;
};

/** In-room landing tile for an entrance (its spawn point — always walkable). */
const spawnTile = (entranceId: number, destRoom: number): GridPos | undefined => {
  const spawn = wasmGetEntranceSpawns()?.[entranceId];
  if (!spawn) return undefined;
  const row = Math.floor((spawn.y - Math.floor(destRoom / 16) * 512) / 8);
  const col = Math.floor((spawn.x - (destRoom % 16) * 512) / 8);
  return row >= 0 && row < 64 && col >= 0 && col < 64 ? { row, col } : undefined;
};

/** Big multi-sub-screen area membership (castle-style groups); undefined = 1×1. */
const screenAreaInfo = (screenId: string): SimArea | undefined => {
  const screen = SCREEN_BY_ID.get(screenId);
  if (!screen || screen.type !== 'overworld') return undefined;
  const group = computeBigScreenGroup(screen.roomIndex ?? 0);
  if (group.length <= 1) return undefined;
  const head = Math.min(...group);
  return { key: `area-${head}`, label: screen.location ?? `area 0x${head.toString(16)}`, size: group.length };
};

export { owScreenId, interiorScreenId, spawnTile, screenAreaInfo };

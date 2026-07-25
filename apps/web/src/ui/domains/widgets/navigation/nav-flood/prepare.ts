/* @layer renderer-widgets @kind logic */
/** Flood-fill run preparation: inventory set, overworld blockers, and the player's start context. */
import { wasmGetLiveSprites, wasmGetOverworldGuardSpawns, wasmGetIndoorDualLayerGrids, wasmGetLinkLayer } from '../../../../../lib/game';
import { getScreenGrids, screenOriginFor } from '../../../../../lib/game/flood';
import type { wasmGetViewportInfo } from '../../../../../lib/game';
import type { TileAttrContext } from '@shared/game/navigation/tile-attrs';
import { linkStartTile } from '@shared/game/navigation/link-start-tile';

type Point = { x: number; y: number };
type DualLayerGrids = { layer0: number[][]; layer1: number[][]; stairTiles: Array<{ row: number; col: number }> };

interface StartContext {
  startPos: { row: number; col: number } | undefined;
  tileContext: TileAttrContext;
  rawAttrGrid: number[][] | undefined;
  dualLayerGrids: DualLayerGrids | undefined;
  playerLayer: 0 | 1 | undefined;
}

const buildInventory = (
  equipment: { gloves: number; boots: unknown; flippers: unknown },
  inventoryItems: ArrayLike<number>,
): string[] => {
  // lift.1=bushes/pots (no glove), lift.2=Power Glove (light rocks), lift.3=Titan's Mitt (dark rocks)
  const items: string[] = ['lift.1'];
  if (equipment.gloves >= 1) items.push('lift.2');
  if (equipment.gloves >= 2) items.push('lift.3');
  if (equipment.boots) items.push('boots');
  if (equipment.flippers) items.push('flippers');
  if (inventoryItems[2] >= 1) items.push('hookshot');
  if (inventoryItems[3] >= 1) items.push('bombs');
  if (inventoryItems[11] >= 1) items.push('hammer');
  return items;
};

const buildOverworldBlockers = (): Point[] => {
  const live = wasmGetLiveSprites();
  const staticGuards = wasmGetOverworldGuardSpawns();
  // Only specific sprites block BFS: tutorial guards (0x3F), barriers (0x40),
  // and uncle (0x73 with e=0). Regular enemies are completely ignored.
  const livePoints = live.flatMap(s => {
    if (s.type === 0x3f || s.type === 0x40 || (s.type === 0x73 && s.e === 0)) {
      const pts: Point[] = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          pts.push({ x: s.x + dc * 8, y: s.y + dr * 8 });
        }
      }
      return pts;
    }
    return [];
  });

  const staticGuardPoints = staticGuards.flatMap(g => {
    const pts: Point[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        pts.push({ x: g.x + dc * 8, y: g.y + dr * 8 });
      }
    }
    return pts;
  });

  const blockers: Point[] = [];
  const seen = new Set<string>();
  for (const p of [...livePoints, ...staticGuardPoints]) {
    const key = `${p.x},${p.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    blockers.push(p);
  }
  return blockers;
};

const computeStartContext = (args: {
  vp: ReturnType<typeof wasmGetViewportInfo>;
  primaryScreenIndex: number;
  isIndoors: boolean;
}): StartContext => {
  const { vp, primaryScreenIndex, isIndoors } = args;
  let startPos: { row: number; col: number } | undefined;
  let tileContext: TileAttrContext = isIndoors ? 'interior-house' : 'overworld';
  let rawAttrGrid: number[][] | undefined;
  let dualLayerGrids: DualLayerGrids | undefined;
  let playerLayer: 0 | 1 | undefined;

  if (vp) {
    if (isIndoors) {
      // One grid source for widget + simulator + dumper (lib/game/flood): it picks
      // live tables for the loaded room, rebuilds any other addressably, and stamps
      // the uncle's blocker footprint into EVERY layer. Stamping only the raw grid
      // (which aliases layer 0) let a dual-layer room flood straight through him.
      const bundle = getScreenGrids({ isIndoors: true, roomId: primaryScreenIndex, owScreenIndex: 0 });
      tileContext = bundle.tileContext;
      rawAttrGrid = bundle.rawAttrGrid;
      // The widget's overlay wants stairTiles alongside the layers; the flood
      // itself never reads them (see flood-options).
      const liveDual = wasmGetIndoorDualLayerGrids();
      dualLayerGrids = bundle.dualLayerGrids
        ? { ...bundle.dualLayerGrids, stairTiles: liveDual?.stairTiles ?? [] }
        : undefined;
      playerLayer = wasmGetLinkLayer() ?? undefined;
    }
    const origin = screenOriginFor({ isIndoors, linkX: vp.linkX, linkY: vp.linkY, screenIndex: primaryScreenIndex });
    startPos = linkStartTile({ linkX: vp.linkX, linkY: vp.linkY, screenWorldX: origin.x, screenWorldY: origin.y });
  }

  return { startPos, tileContext, rawAttrGrid, dualLayerGrids, playerLayer };
};

export { buildInventory, buildOverworldBlockers, computeStartContext };
export type { Point, DualLayerGrids, StartContext };

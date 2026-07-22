/* @layer renderer-widgets @kind logic */
/** Flood-fill run preparation: inventory set, overworld blockers, and Link's start context. */
import {
  wasmGetLiveSprites, wasmGetOverworldGuardSpawns,
  wasmGetIndoorDualLayerGrids, wasmGetIndoorLayer0Grid, wasmGetLinkLayer, wasmGetIndoorUncleBlockers,
} from '../../../../../lib/game';
import type { wasmGetViewportInfo } from '../../../../../lib/game';
import { getCompletedChecks } from '../../../../../lib/game/tracker';
import type { TileAttrContext } from '@shared/game/navigation/tile-attrs';
import { linkStartTile } from '@shared/game/navigation/link-start-tile';

type Point = { x: number; y: number };
type DualLayerGrids = { layer0: number[][]; layer1: number[][]; stairTiles: Array<{ row: number; col: number }> };

interface StartContext {
  startPos: { row: number; col: number } | undefined;
  tileContext: TileAttrContext;
  rawAttrGrid: number[][] | undefined;
  dualLayerGrids: DualLayerGrids | undefined;
  linkLayer: 0 | 1 | undefined;
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
  let linkLayer: 0 | 1 | undefined;

  if (vp) {
    if (isIndoors) {
      // TileDetect only branches on indoors, but we keep cave/house and dungeon contexts separate for future tuning.
      tileContext = vp.locationType === 2 ? 'interior-dungeon' : 'interior-house';
      dualLayerGrids = wasmGetIndoorDualLayerGrids() ?? undefined;
      rawAttrGrid = dualLayerGrids?.layer0 ?? wasmGetIndoorLayer0Grid() ?? undefined;
      linkLayer = wasmGetLinkLayer() ?? undefined;

      // Early-game indoor variant: Uncle at house / in-passage physically blocks tiles.
      // We stamp his live sprite footprint into the attr grid so flood-fill reflects state.
      // Once the uncle check is collected, he no longer blocks (randomizer-safe).
      if (rawAttrGrid && !getCompletedChecks().has("Link's Uncle")) {
        const blockers = wasmGetIndoorUncleBlockers();
        const roomWorldX = Math.floor(vp.linkX / 512) * 512;
        const roomWorldY = Math.floor(vp.linkY / 512) * 512;
        // Uncle uses 3x3 expanded footprint (same as overworld guards)
        // to properly block narrow passages.
        for (const b of blockers) {
          const c0 = Math.floor((b.x - roomWorldX) / 8);
          const r0 = Math.floor((b.y - roomWorldY) / 8);
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const rr = r0 + dr;
              const cc = c0 + dc;
              if (rr >= 0 && rr < 64 && cc >= 0 && cc < 64) {
                rawAttrGrid[rr][cc] = 0x01; // wall/blocked
              }
            }
          }
        }
      }
    }
    const screenWorldX = isIndoors
      ? (Math.floor(vp.linkX / 512) * 512)
      : ((primaryScreenIndex & 7) * 512);
    const screenWorldY = isIndoors
      ? (Math.floor(vp.linkY / 512) * 512)
      : (((primaryScreenIndex >> 3) & 7) * 512);

    startPos = linkStartTile({ linkX: vp.linkX, linkY: vp.linkY, screenWorldX, screenWorldY });
  }

  return { startPos, tileContext, rawAttrGrid, dualLayerGrids, linkLayer };
};

export { buildInventory, buildOverworldBlockers, computeStartContext };
export type { Point, DualLayerGrids, StartContext };

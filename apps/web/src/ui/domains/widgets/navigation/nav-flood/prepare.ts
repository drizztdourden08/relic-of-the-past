/* @layer renderer-widgets @kind logic */
/**
 * Flood-fill run preparation: the inventory set and where the player is standing.
 *
 * The overworld blocker builder that used to live here read the LIVE sprite list,
 * which only describes the screen the game occupies. Blockers now come from the
 * addressable spawn table inside the shared flood (lib/game/flood/blockers.ts),
 * so the widget and the simulator agree about every screen, not just this one.
 */
import { screenOriginFor } from '../../../../../lib/game/flood';
import type { wasmGetViewportInfo } from '../../../../../lib/game';
import { linkStartTile } from '@shared/game/navigation/link-start-tile';

type Point = { x: number; y: number };
type DualLayerGrids = { layer0: number[][]; layer1: number[][]; stairTiles: Array<{ row: number; col: number }> };

interface StartContext {
  startPos: { row: number; col: number } | undefined;
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

const computeStartContext = (args: {
  vp: ReturnType<typeof wasmGetViewportInfo>;
  primaryScreenIndex: number;
  isIndoors: boolean;
}): StartContext => {
  const { vp, primaryScreenIndex, isIndoors } = args;
  if (!vp) return { startPos: undefined };
  const origin = screenOriginFor({ isIndoors, linkX: vp.linkX, linkY: vp.linkY, screenIndex: primaryScreenIndex });
  return { startPos: linkStartTile({ linkX: vp.linkX, linkY: vp.linkY, screenWorldX: origin.x, screenWorldY: origin.y }) };
};

export { buildInventory, computeStartContext };
export type { StartContext };

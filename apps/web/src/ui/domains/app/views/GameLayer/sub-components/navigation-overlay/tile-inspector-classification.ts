/* @layer renderer-components @kind logic */
import { classifyTile, resolveRoomContext, roomTypeLabel } from '@shared/game/navigation/tile-classification';
import type { ReachState } from '@shared/game/navigation/types';
import type { SimDoor } from '@shared/game/simulation';
import { getRoomDoors } from '@app/lib/game/simulator/interactables';
import { wasmGetReplacementTileState, wasmGetChestLocations } from '@app/lib/game';
import { getLayerDisplayMode } from './tooltip/layer-display/get-layer-display-mode';
import { getLockedLayer } from './tooltip/layer-display/get-locked-layer';
import type { LayerTileData, TooltipLayers } from './tooltip/tooltip.type';
import { computeCanPass } from './tile-inspector-tooltip';
import type { BuildTooltipLayersParams, TooltipLayersBuild } from './tile-inspector-classification.type';

const hasOwnContent = (attr: number, reach: ReachState): boolean => attr !== 0x00 || reach !== 0;

const buildTooltipLayers = (params: BuildTooltipLayersParams): TooltipLayersBuild => {
  const { result, row, col, roomIndex, isIndoors, rawPalaceIndexX2, reachableByLayer, equipment, inventoryItems } = params;

  const room = resolveRoomContext(isIndoors, rawPalaceIndexX2);
  const doors: readonly SimDoor[] = isIndoors ? getRoomDoors(roomIndex) : [];
  const replacementTileState = wasmGetReplacementTileState() ?? [];
  const chestLocations = wasmGetChestLocations() ?? [];

  const classify = (attr: number, layer: 0 | 1) =>
    classifyTile({ attr, layer, indoors: room.indoors, palaceIndex: room.palaceIndex, replacementTileState, chestLocations, doors });

  const toLayerData = (attr: number, layer: 0 | 1, reach: ReachState, isAboveLayer: boolean): LayerTileData => {
    const classification = classify(attr, layer);
    const canPass = classification.collision.type === 'obstacle'
      ? computeCanPass(classification.collision.req, equipment, inventoryItems)
      : null;
    return { classification, reach, canPass, isAboveLayer };
  };

  const label = roomTypeLabel(room);
  const mergedAttr = result.attrGrid?.[row]?.[col] ?? 0;
  const mergedReach = result.reachable[row]?.[col] ?? 0;
  const single = (): TooltipLayers => ({ mode: 'single', primary: toLayerData(mergedAttr, 0, mergedReach, false) });

  if (!result.dualLayerGrids) return { roomTypeLabel: label, layers: single() };

  const a0 = result.dualLayerGrids.layer0[row]?.[col] ?? 0;
  const a1 = result.dualLayerGrids.layer1[row]?.[col] ?? 0;
  const r0 = reachableByLayer?.[0]?.[row]?.[col] ?? 0;
  const r1 = reachableByLayer?.[1]?.[row]?.[col] ?? 0;

  const mode = getLayerDisplayMode(result);
  if (mode === 'locked') {
    const lockedLayer = getLockedLayer(result);
    const attr = lockedLayer === 0 ? a0 : a1;
    const reach = lockedLayer === 0 ? r0 : r1;
    return {
      roomTypeLabel: label,
      layers: { mode: 'locked', lockedLayer, primary: toLayerData(attr, lockedLayer, reach, lockedLayer === 0) },
    };
  }

  if (!hasOwnContent(a0, r0) || !hasOwnContent(a1, r1)) return { roomTypeLabel: label, layers: single() };

  return {
    roomTypeLabel: label,
    layers: {
      mode: 'dual',
      above: toLayerData(a0, 0, r0, true),
      ground: toLayerData(a1, 1, r1, false),
    },
  };
};

export { buildTooltipLayers };

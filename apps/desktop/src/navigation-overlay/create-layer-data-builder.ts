/* @layer renderer-components @kind logic */
import { classifyTile, getRoomDoors } from '@rotp/navigation';
import type { resolveRoomContext } from '@rotp/navigation';
import { wasmGetReplacementTileState, wasmGetChestLocations } from '@app/game';
import type { LayerDataBuilder } from './layer-data-builder.type';
import type { BuildTooltipLayersParams } from './tile-inspector-classification.type';
import { computeCanPass } from './tile-inspector-tooltip';

const createLayerDataBuilder = (params: BuildTooltipLayersParams, room: ReturnType<typeof resolveRoomContext>): LayerDataBuilder => {
  const { roomIndex, isIndoors, equipment, inventoryItems } = params;
  const doors = isIndoors ? getRoomDoors(roomIndex) : [];
  const replacementTileState = wasmGetReplacementTileState() ?? [];
  const chestLocations = wasmGetChestLocations() ?? [];

  return (attr, layer, reach, isAboveLayer) => {
    const classification = classifyTile({ attr, layer, indoors: room.indoors, palaceIndex: room.palaceIndex, replacementTileState, chestLocations, doors });
    const canPass = classification.collision.type === 'obstacle'
      ? computeCanPass(classification.collision.req, equipment, inventoryItems)
      : null;
    return { classification, reach, canPass, isAboveLayer };
  };
};

export { createLayerDataBuilder };

/* @layer renderer-appshell @kind logic */
import type { NavDumpParts } from './nav-dump.type';
import { LAYER_TOGGLE_ATTR_FIRST, LAYER_TOGGLE_ATTR_LAST, LAYER_TOGGLE_DOOR_TYPE } from './nav-dump.constants';

const hex = (value: number, width: number): string => `0x${value.toString(16).padStart(width, '0')}`;

const buildNavDump = (parts: NavDumpParts) => {
  const {
    slot, location, progressInfo, viewport, detection, exitScreen, matchingEntrances, fallHoleLandings, stairInfo,
    travelDests, doorBoundaryTiles, attrGrid, roomLayout, playerLayer, startPos, staircaseType, toggleFloorPositions,
    floodFill, annotations,
  } = parts;
  const { isIndoors, roomIndex, palaceIndex, overworldScreenIndex, whichEntrance } = location;
  return {
    slot,
    isIndoors,
    roomIndex,
    roomIndexHex: hex(roomIndex, 4),
    palaceIndex,
    palaceIndexHex: hex(palaceIndex, 2),
    overworldScreenIndex,
    overworldScreenIndexHex: hex(overworldScreenIndex, 2),
    whichEntrance,
    whichEntranceHex: hex(whichEntrance, 2),
    progressTier: progressInfo?.tier ?? null,
    progressLabel: progressInfo?.label ?? null,
    viewport: viewport ? { locationType: viewport.locationType } : null,
    detection: detection ? {
      screenId: detection.screen.id,
      screenName: detection.screen.name,
      method: detection.method,
      hasVariant: Boolean(detection.screen.variant),
      variantKey: detection.screen.variant?.key ?? null,
    } : null,
    exitScreen,
    exitScreenHex: exitScreen != null ? hex(exitScreen, 2) : null,
    entrancesPointingHere: matchingEntrances,
    fallHoleLandings,
    stairs: stairInfo,
    travelDestinations: travelDests,
    summary: {
      totalEntrances: matchingEntrances.filter(e => !e.isFallHole).length + stairInfo.length,
      overworldExits: exitScreen != null ? 1 : 0,
      stairConnections: stairInfo.length,
      entranceSpawns: matchingEntrances.filter(e => !e.isFallHole).length,
      fallHoleLandingCount: fallHoleLandings.length,
      excludedFallHoleIds: matchingEntrances.filter(e => e.isFallHole).map(e => e.id),
    },
    doorBoundaryTiles: doorBoundaryTiles.map(d => {
      const tileAttr = attrGrid ? attrGrid[d.row * 64 + d.col] : null;
      return {
        direction: d.direction,
        col: d.col,
        row: d.row,
        doorType: d.doorType,
        doorTypeHex: hex(d.doorType, 2),
        isOpen: d.isOpen,
        isLayerToggle: d.doorType === LAYER_TOGGLE_DOOR_TYPE,
        tileAttr: tileAttr != null ? hex(tileAttr, 2) : null,
        tileAttrIsLayerToggle: tileAttr != null && tileAttr >= LAYER_TOGGLE_ATTR_FIRST && tileAttr <= LAYER_TOGGLE_ATTR_LAST,
      };
    }),
    roomLayout: roomLayout ? {
      layout: roomLayout.layout,
      shape: roomLayout.shape,
      quadrantFullsizeX: roomLayout.quadrantFullsizeX,
      quadrantFullsizeY: roomLayout.quadrantFullsizeY,
      quadrantX: roomLayout.quadrantX,
      quadrantY: roomLayout.quadrantY,
      intraEdges: roomLayout.intraEdges,
    } : null,
    linkLayer: playerLayer,
    linkStart: startPos ?? null,
    staircaseType,
    toggleFloorPositions: toggleFloorPositions.map(p => ({
      pos: hex(p.pos, 4),
      row: p.row,
      col: p.col,
    })),
    floodFill,
    annotations,
  };
};

export { buildNavDump };

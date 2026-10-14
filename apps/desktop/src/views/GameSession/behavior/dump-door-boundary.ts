/* @layer renderer-appshell @kind logic */
import type { NavDumpParts } from './nav-dump.type';
import { LAYER_TOGGLE_ATTR_FIRST, LAYER_TOGGLE_ATTR_LAST, LAYER_TOGGLE_DOOR_TYPE } from './nav-dump.constants';
import { hex } from './hex';

const dumpDoorBoundary = (tiles: NavDumpParts['doorBoundaryTiles'], attrGrid: NavDumpParts['attrGrid']) =>
  tiles.map(d => {
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
  });

export { dumpDoorBoundary };

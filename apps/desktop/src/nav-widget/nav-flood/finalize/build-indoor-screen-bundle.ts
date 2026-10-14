/* @layer renderer-widgets @kind logic */
import type { ScreenBundleGrid } from '@rotp/game-data';
import type { IndoorBundleArgs } from '../nav-flood.type';
import { effectiveLayout } from './effective-layout';
import { gridSizeOf } from './grid-size-of';
import { isMultiRoom } from './is-multi-room';

const buildIndoorScreenBundle = (args: IndoorBundleArgs): ScreenBundleGrid => {
  const { screenName, primaryScreenIndex, allConnections, roomLayout, intraEdges } = args;
  const connectedRooms = new Set<number>([primaryScreenIndex]);
  for (const c of allConnections) {
    if (!c.isIntraRoom) connectedRooms.add(c.targetScreen);
  }
  const roomList = [...connectedRooms];

  const shape = roomLayout?.shape ?? '1x1';
  const hasIntraEdges = intraEdges.length > 0;
  const layout = effectiveLayout();
  const grid = gridSizeOf(layout, shape, hasIntraEdges);
  const minDim = roomList.length > 1 ? 2 : 1;

  return {
    name: screenName,
    screens: roomList,
    cols: Math.max(grid.cols, minDim),
    rows: Math.max(grid.rows, minDim),
    subNames: {}, screenNames: {},
    isMulti: isMultiRoom(layout, hasIntraEdges, roomList.length),
    head: primaryScreenIndex,
    roomShape: hasIntraEdges ? shape : undefined,
    activeQuadrant: hasIntraEdges && roomLayout ? { x: roomLayout.quadrantX, y: roomLayout.quadrantY } : undefined,
    effectiveLayout: layout,
  };
};

export { buildIndoorScreenBundle };

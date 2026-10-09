/* @layer renderer-widgets @kind logic */
import { wasmGetDungeonMapPosition } from '../../../../game';
import type { ScreenBundleGrid } from '@rotp/game-data';
import type { IndoorBundleArgs } from '../nav-flood.type';

const buildIndoorScreenBundle = (args: IndoorBundleArgs): ScreenBundleGrid => {
  const { screenName, primaryScreenIndex, allConnections, roomLayout, intraEdges } = args;
  const connectedRooms = new Set<number>([primaryScreenIndex]);
  for (const c of allConnections) {
    if (!c.isIntraRoom) connectedRooms.add(c.targetScreen);
  }
  const roomList = [...connectedRooms];

  const shape = roomLayout?.shape ?? '1x1';
  const roomGridCols = (shape === '2x2' || shape === '2x1') ? 2 : 1;
  const roomGridRows = (shape === '2x2' || shape === '1x2') ? 2 : 1;
  const hasIntraEdges = intraEdges.length > 0;

  const mapPos = wasmGetDungeonMapPosition();
  const effLayout = mapPos?.found ? { width: mapPos.effectiveWidth, height: mapPos.effectiveHeight } : undefined;

  const effCols = effLayout ? effLayout.width : (hasIntraEdges ? roomGridCols : 1);
  const effRows = effLayout ? effLayout.height : (hasIntraEdges ? roomGridRows : 1);

  return {
    name: screenName,
    screens: roomList,
    cols: Math.max(effCols, roomList.length > 1 ? 2 : 1),
    rows: Math.max(effRows, roomList.length > 1 ? 2 : 1),
    subNames: {}, screenNames: {},
    isMulti: (effLayout ? (effLayout.width > 1 || effLayout.height > 1) : hasIntraEdges) || roomList.length > 1,
    head: primaryScreenIndex,
    roomShape: hasIntraEdges ? shape : undefined,
    activeQuadrant: hasIntraEdges ? { x: roomLayout!.quadrantX, y: roomLayout!.quadrantY } : undefined,
    effectiveLayout: effLayout,
  };
};

export { buildIndoorScreenBundle };

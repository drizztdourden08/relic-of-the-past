/* @layer renderer-appshell @kind logic */
import type { NavDumpParts } from './nav-dump.type';

const dumpRoomLayout = (roomLayout: NavDumpParts['roomLayout']) => (roomLayout ? {
  layout: roomLayout.layout,
  shape: roomLayout.shape,
  quadrantFullsizeX: roomLayout.quadrantFullsizeX,
  quadrantFullsizeY: roomLayout.quadrantFullsizeY,
  quadrantX: roomLayout.quadrantX,
  quadrantY: roomLayout.quadrantY,
  intraEdges: roomLayout.intraEdges,
} : null);

export { dumpRoomLayout };

/* @layer renderer-appshell @kind logic */
import type { NavDumpParts } from './nav-dump.type';
import { hex } from './hex';
import { dumpDetection } from './dump-detection';
import { dumpDoorBoundary } from './dump-door-boundary';
import { dumpRoomLayout } from './dump-room-layout';
import { dumpSummary } from './dump-summary';

const buildNavDump = (parts: NavDumpParts) => {
  const { slot, location, progressInfo, viewport, detection, exitScreen, matchingEntrances, fallHoleLandings, stairInfo, travelDests } = parts;
  const { attrGrid, doorBoundaryTiles, roomLayout, playerLayer, startPos, staircaseType, toggleFloorPositions, floodFill, annotations } = parts;
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
    detection: dumpDetection(detection),
    exitScreen,
    exitScreenHex: exitScreen != null ? hex(exitScreen, 2) : null,
    entrancesPointingHere: matchingEntrances,
    fallHoleLandings,
    stairs: stairInfo,
    travelDestinations: travelDests,
    summary: dumpSummary({ matchingEntrances, stairInfo, exitScreen, fallHoleLandings }),
    doorBoundaryTiles: dumpDoorBoundary(doorBoundaryTiles, attrGrid),
    roomLayout: dumpRoomLayout(roomLayout),
    linkLayer: playerLayer,
    linkStart: startPos ?? null,
    staircaseType,
    toggleFloorPositions: toggleFloorPositions.map(p => ({ pos: hex(p.pos, 4), row: p.row, col: p.col })),
    floodFill,
    annotations,
  };
};

export { buildNavDump };

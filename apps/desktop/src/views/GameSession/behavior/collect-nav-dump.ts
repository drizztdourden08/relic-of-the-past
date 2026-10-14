/* @layer renderer-appshell @kind logic */
import {
  wasmGetViewportInfo,
  wasmGetExitScreenMap,
  wasmGetEntranceRooms,
  wasmGetEntranceSpawns,
  wasmGetRoomStairInfo,
  wasmGetRoomTravelDestinations,
  wasmGetFallHoles,
  wasmGetOverworldEntrances,
  wasmGetProgressIndicator,
} from '@app/game';
import { resolveCurrentScreenDetailed } from '@rotp/game-data';
import type { VariantGameState } from '@rotp/game-data';
import type { DumpSlot } from './nav-dump.type';
import { collectEntranceData } from './collect-entrance-data';
import { formatStairs } from './format-stairs';
import { formatTravelDests } from './format-travel-dests';
import { runDumpFlood } from './run-dump-flood';
import { readNavLocation } from './read-nav-location';
import { readIndoorData } from './read-indoor-data';
import { floodStartOf } from './flood-start-of';
import { buildNavDump } from './build-nav-dump';

const collectNavDump = (slot: DumpSlot) => {
  const location = readNavLocation();
  const { roomIndex, palaceIndex, overworldScreenIndex, isIndoors, whichEntrance } = location;

  const viewport = wasmGetViewportInfo();
  const progressInfo = wasmGetProgressIndicator();

  const variantState: VariantGameState = {
    progressTier: progressInfo?.tier,
    entranceId: whichEntrance || undefined,
  };
  const detection = resolveCurrentScreenDetailed({ isIndoors, palaceIndex, roomIndex, overworldScreenIndex, whichEntrance, variantState });

  const exitScreenMap = wasmGetExitScreenMap();
  const entranceRooms = wasmGetEntranceRooms();
  const entranceSpawns = wasmGetEntranceSpawns();
  const stairs = wasmGetRoomStairInfo();
  const fallHoles = wasmGetFallHoles();
  const owEntrances = wasmGetOverworldEntrances();

  const exitScreen = exitScreenMap.get(roomIndex) ?? null;

  const { matchingEntrances, fallHoleLandings } = collectEntranceData({
    roomIndex, entranceRooms, entranceSpawns, fallHoles, owEntrances,
  });
  const stairInfo = formatStairs(stairs);
  const travelDests = formatTravelDests(wasmGetRoomTravelDestinations());

  const { doorBoundaryTiles, roomLayout, playerLayer, staircaseType, dualLayerGrids, attrGrid, toggleFloorPositions } = readIndoorData(isIndoors, roomIndex);

  const { floodScreenIndex, startPos } = floodStartOf(isIndoors, overworldScreenIndex, viewport);
  const { floodFill, annotations } = runDumpFlood({
    isIndoors, roomIndex, overworldScreenIndex: floodScreenIndex, startPos,
    screenId: detection?.screen.id ?? null,
    attrGrid, dualLayerGrids, playerLayer, staircaseType, roomLayout,
  });

  return buildNavDump({
    slot, location, progressInfo, viewport, detection, exitScreen, matchingEntrances, fallHoleLandings, stairInfo,
    travelDests, doorBoundaryTiles, attrGrid, roomLayout, playerLayer, startPos, staircaseType, toggleFloorPositions,
    floodFill, annotations,
  });
};

export { collectNavDump };

/* @layer renderer-stores @kind logic */
import type { DebugCaptureSnapshot } from '@shared/types/debug-report';
import { useGameUIStore } from '../game-ui-store';

const takeSnapshot = (session: number): DebugCaptureSnapshot => {
  const map = useGameUIStore.getState().map;
  return {
    session,
    capturedAt: Date.now(),
    screenId: map.isIndoors ? `room-0x${map.roomIndex.toString(16)}` : `ow-0x${map.overworldScreenIndex.toString(16)}`,
    isIndoors: map.isIndoors,
    roomIndex: map.roomIndex,
    isDarkWorld: map.isDarkWorld,
    overworldScreenIndex: map.overworldScreenIndex,
    palaceIndex: map.palaceIndex,
    whichEntrance: map.whichEntrance,
    playerX: map.linkX,
    playerY: map.linkY,
  };
};

export { takeSnapshot };

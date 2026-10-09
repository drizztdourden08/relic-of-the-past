/* @layer renderer-widgets @kind hook */
import { useMemo } from 'react';
import { find, pairLinksScreens, toScreenIdOf } from '@rotp/game-data';
import type { ScreenId } from '@rotp/game-data';
import type { RoomStairInfo } from '../../../game';
import { detectConnections, detectionTargetId } from '../../../nav-widget/detect-connections';
import type { ConnectionStatus, ConnectionStatusResult } from '../NavigationWidget.type';

const useConnectionStatus = (screenId: ScreenId | null, detectedEntranceScreens: number[], detectedStairs: RoomStairInfo[], exitScreen: number | null, detectedFallHoleRooms: number[]): ConnectionStatusResult => {
  return useMemo(() => {
    if (!screenId) {
      return { status: 'none', missingCount: 0, existingConnections: [], detectedConnections: [], unmatched: [] };
    }

    const existing = find('connection', c => c.screenId === screenId || toScreenIdOf(c) === screenId);
    const detected = detectConnections({ detectedEntranceScreens, detectedStairs, exitScreen, detectedFallHoleRooms });

    const unmatched = detected.filter(det => {
      const targetId = detectionTargetId(det);
      if (!targetId) return true;
      return !pairLinksScreens(existing, screenId, targetId);
    });

    const missingCount = unmatched.length;
    let status: ConnectionStatus;
    if (existing.length === 0 && detected.length === 0) status = 'none';
    else if (missingCount === 0) status = 'complete';
    else status = 'partial';

    return { status, missingCount, existingConnections: existing, detectedConnections: detected, unmatched };
  }, [screenId, detectedEntranceScreens, detectedStairs, exitScreen, detectedFallHoleRooms]);
};

export { useConnectionStatus };

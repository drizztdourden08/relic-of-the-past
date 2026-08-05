/* @layer renderer-widgets @kind hook */
/**
 * Hooks for computing screen/connection data completeness badges.
 * Compares live game state against the static dataset.
 *
 * Both hooks are memo wrappers now: the screen half lives in
 * `screen-data-status.ts` so it can run outside React, and the connection half
 * is the detect-then-match pass over `detect-connections.ts`.
 */

import { useMemo } from 'react';
import type { ScreenMatchResult } from '@shared/game/logic/queries/detection';
import { find } from '@shared/game/data';
import { toScreenIdOf } from '@shared/game/data/connections/derive';
import type { ScreenId, ConnectionRecord } from '@shared/game/data';
import type { RoomStairInfo } from '../../../../lib/game';
import { detectConnections, detectionTargetId } from './detect-connections';
import type { DetectedConnection } from './detect-connections';
import { screenDataStatus } from './screen-data-status';
import type { ScreenDataStatusResult } from './screen-data-status';

// ─── Screen Status ───

const useScreenDataStatus = (matchResult: ScreenMatchResult | null, isIndoors: boolean): ScreenDataStatusResult =>
  useMemo(() => screenDataStatus(matchResult, isIndoors), [matchResult, isIndoors]);

// ─── Connection Status ───

type ConnectionStatus = 'complete' | 'partial' | 'none';

interface ConnectionStatusResult {
  status: ConnectionStatus;
  missingCount: number;
  existingConnections: ConnectionRecord[];
  detectedConnections: DetectedConnection[];
  unmatched: DetectedConnection[];
}

const useConnectionStatus = (screenId: ScreenId | null, detectedEntranceScreens: number[], detectedStairs: RoomStairInfo[], exitScreen: number | null, detectedFallHoleRooms: number[]): ConnectionStatusResult => {
  return useMemo(() => {
    if (!screenId) {
      return { status: 'none', missingCount: 0, existingConnections: [], detectedConnections: [], unmatched: [] };
    }

    const existing = find('connection', c => c.screenId === screenId || toScreenIdOf(c) === screenId);
    const detected = detectConnections({ detectedEntranceScreens, detectedStairs, exitScreen, detectedFallHoleRooms });

    // A detection is matched when an existing record actually covers a crossing
    // LEAVING this screen toward the resolved target — direction matters: a
    // record only counts when it SITS on this screen and CAN be exited
    // (`conn.canExit`). A record is one-sided now (see `data/connections/derive.ts`),
    // so there is no more "reverse endpoint of a two-way record" case to weigh —
    // the arriving side, if it exists at all, is its own separate record.
    const unmatched = detected.filter(det => {
      const targetId = detectionTargetId(det);
      if (!targetId) return true;
      return !existing.some(conn => (
        conn.screenId === screenId && conn.canExit && toScreenIdOf(conn) === targetId
      ));
    });

    const missingCount = unmatched.length;
    let status: ConnectionStatus;
    if (existing.length === 0 && detected.length === 0) status = 'none';
    else if (missingCount === 0) status = 'complete';
    else status = 'partial';

    return { status, missingCount, existingConnections: existing, detectedConnections: detected, unmatched };
  }, [screenId, detectedEntranceScreens, detectedStairs, exitScreen, detectedFallHoleRooms]);
};

export { useScreenDataStatus, useConnectionStatus };
export type { ConnectionStatus, ConnectionStatusResult };
export type { DataCorrection, ScreenDataStatus, ScreenDataStatusResult } from './screen-data-status';
export type { DetectedConnection } from './detect-connections';

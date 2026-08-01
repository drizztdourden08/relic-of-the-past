/* @layer renderer-widgets @kind hook */
/**
 * Hooks for computing screen/connection data completeness badges.
 * Compares live game state against the static dataset.
 */

import { useMemo } from 'react';
import { getScreenLookup } from '@shared/game/logic/queries/detection';
import type { ScreenMatchResult } from '@shared/game/logic/queries/detection';
import { getPalaceName } from '@shared/game/logic/queries/dungeon-values';
import { find } from '@shared/game/data';
import type { ScreenId, ScreenRecord, ConnectionRecord } from '@shared/game/data';
import type { RoomStairInfo } from '../../../../lib/game';
import { detectConnections, detectionTargetId } from './detect-connections';
import type { DetectedConnection } from './detect-connections';

// ─── Screen Status ───

type ScreenDataStatus = 'mapped' | 'incomplete' | 'missing';

interface ScreenDataStatusResult {
  status: ScreenDataStatus;
  screen: ScreenRecord | null;
  issues: string[];
  /** Data correction suggestions (shown in editor wizard) */
  corrections: DataCorrection[];
}

interface DataCorrection {
  field: string;
  message: string;
  suggestedValue: unknown;
}

const useScreenDataStatus = (matchResult: ScreenMatchResult | null, isIndoors: boolean): ScreenDataStatusResult => {
  return useMemo(() => {
    if (!matchResult) {
      return { status: 'missing', screen: null, issues: ['No screen definition for this room'], corrections: [] };
    }

    const { screen, method, palaceMismatch } = matchResult;
    const issues: string[] = [];
    const corrections: DataCorrection[] = [];

    // Palace mismatch: data has wrong/missing palaceIndex
    if (method === 'palace-scan' && palaceMismatch) {
      const actual = palaceMismatch.actual;
      const expected = palaceMismatch.expected;
      issues.push(`Palace mismatch: game reports ${getPalaceName(actual)} (0x${actual.toString(16).toUpperCase()}) but data has 0x${expected.toString(16).toUpperCase()}`);
      corrections.push({
        field: 'gameId.palaceIndex',
        message: `Set palaceIndex to 0x${actual.toString(16).toUpperCase()} (${getPalaceName(actual)})`,
        suggestedValue: actual,
      });
    }

    // Ambiguous cave match
    if (method === 'cave-ambiguous') {
      issues.push('Multiple caves share this room index — needs entranceId for disambiguation');
      corrections.push({
        field: 'gameId.entranceId',
        message: 'Add entranceId to disambiguate from other caves with same room',
        suggestedValue: null,
      });
    }

    // Check required fields
    if (!screen.locationId) issues.push('Missing location');
    if (isIndoors && screen.gameId.roomIndex == null) issues.push('Missing roomIndex');
    if (isIndoors && screen.kind === 'dungeon') {
      if (screen.position?.floor == null) issues.push('Missing floor');
    }
    if (screen.tags.length === 0) issues.push('No tags');

    return {
      status: issues.length > 0 ? 'incomplete' : 'mapped',
      screen,
      issues,
      corrections,
    };
  }, [matchResult, isIndoors]);
};

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

    const existing = find('connection', c => c.fromScreenId === screenId || c.toScreenId === screenId);
    const detected = detectConnections({ detectedEntranceScreens, detectedStairs, exitScreen, detectedFallHoleRooms });

    // A detection is matched when an existing edge already reaches the screen it
    // resolved to. One that resolves to nothing is always unmatched.
    const unmatched = detected.filter(det => {
      const targetId = detectionTargetId(det);
      if (!targetId) return true;
      return !existing.some(conn =>
        (conn.fromScreenId === screenId ? conn.toScreenId : conn.fromScreenId) === targetId);
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
export type { ScreenDataStatus, ScreenDataStatusResult, ConnectionStatus, ConnectionStatusResult, DataCorrection };
export type { DetectedConnection } from './detect-connections';

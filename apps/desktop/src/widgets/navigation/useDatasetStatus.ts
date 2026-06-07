/* @layer renderer-widgets @kind hook */
/**
 * Hooks for computing screen/connection data completeness badges.
 * Compares live game state against the static dataset.
 */

import { useMemo } from 'react';
import { getScreenLookup } from '@shared/game/data/screens';
import type { ScreenMatchResult } from '@shared/game/data/screens';
import { ALL_CONNECTIONS } from '@shared/game/data/connections';
import type { ScreenDefinition, ScreenConnection } from '@shared/game/types';
import type { RoomStairInfo } from '../../lib/game';
import { getPalaceName } from '@shared/game/data/screens/game-values';

// ─── Screen Status ───

type ScreenDataStatus = 'mapped' | 'incomplete' | 'missing';

interface ScreenDataStatusResult {
  status: ScreenDataStatus;
  screen: ScreenDefinition | null;
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
        field: 'dungeon.palaceIndex',
        message: `Set palaceIndex to 0x${actual.toString(16).toUpperCase()} (${getPalaceName(actual)})`,
        suggestedValue: actual,
      });
    }

    // Ambiguous cave match
    if (method === 'cave-ambiguous') {
      issues.push('Multiple caves share this room index — needs entranceId for disambiguation');
      corrections.push({
        field: 'entranceId',
        message: 'Add entranceId to disambiguate from other caves with same room',
        suggestedValue: null,
      });
    }

    // Check required fields
    if (!screen.location) issues.push('Missing location');
    if (isIndoors && screen.roomIndex == null) issues.push('Missing roomIndex');
    if (isIndoors && screen.type === 'dungeon') {
      if (screen.dungeon.floor == null) issues.push('Missing floor');
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

interface DetectedConnection {
  type: 'entrance' | 'stair' | 'edge';
  targetRoomOrScreen: number;
  label: string;
}

interface ConnectionStatusResult {
  status: ConnectionStatus;
  missingCount: number;
  existingConnections: ScreenConnection[];
  detectedConnections: DetectedConnection[];
  unmatched: DetectedConnection[];
}

const useConnectionStatus = (screenId: string | null, detectedEntranceScreens: number[], detectedStairs: RoomStairInfo[], exitScreen: number | null): ConnectionStatusResult => {
  return useMemo(() => {
    if (!screenId) {
      return {
        status: 'none',
        missingCount: 0,
        existingConnections: [],
        detectedConnections: [],
        unmatched: [],
      };
    }

    // Find all existing connections involving this screen
    const existing = ALL_CONNECTIONS.filter(
      c => c.from === screenId || c.to === screenId,
    );

    // Build detected connections from game state
    const detected: DetectedConnection[] = [];

    // Entrances: each entrance that leads to this room from an overworld screen
    for (const screen of detectedEntranceScreens) {
      const owScreen = getScreenLookup().byOverworldScreen.get(screen);
      detected.push({
        type: 'entrance',
        targetRoomOrScreen: screen,
        label: owScreen?.name ?? `OW 0x${screen.toString(16).toUpperCase()}`,
      });
    }

    // Stairs: each stair destination room
    for (const stair of detectedStairs) {
      if (stair.destRoom === 0) continue;
      detected.push({
        type: 'stair',
        targetRoomOrScreen: stair.destRoom,
        label: `Room 0x${stair.destRoom.toString(16).toUpperCase()} (${stair.direction})`,
      });
    }

    // Exit screen
    if (exitScreen != null) {
      const owScreen = getScreenLookup().byOverworldScreen.get(exitScreen);
      detected.push({
        type: 'entrance',
        targetRoomOrScreen: exitScreen,
        label: `Exit → ${owScreen?.name ?? `OW 0x${exitScreen.toString(16).toUpperCase()}`}`,
      });
    }

    // Compare: for each detected connection, check if a matching one exists
    const unmatched: DetectedConnection[] = [];
    const lookup = getScreenLookup();

    for (const det of detected) {
      let found = false;
      for (const conn of existing) {
        const otherScreenId = conn.from === screenId ? conn.to : conn.from;
        const otherScreen = lookup.byOverworldScreen.get(det.targetRoomOrScreen)
          ?? lookup.byCaveRoom.get(det.targetRoomOrScreen)
          ?? [...lookup.byDungeonRoom.values()].find(r => r.roomIndex === det.targetRoomOrScreen);

        if (otherScreen && otherScreenId === otherScreen.id) {
          found = true;
          break;
        }
      }
      if (!found) unmatched.push(det);
    }

    const missingCount = unmatched.length;
    let status: ConnectionStatus;
    if (existing.length === 0 && detected.length === 0) status = 'none';
    else if (missingCount === 0) status = 'complete';
    else status = 'partial';

    return { status, missingCount, existingConnections: existing, detectedConnections: detected, unmatched };
  }, [screenId, detectedEntranceScreens, detectedStairs, exitScreen]);
};

export { useScreenDataStatus, useConnectionStatus };
export type { ScreenDataStatus, ScreenDataStatusResult, ConnectionStatus, ConnectionStatusResult, DetectedConnection, DataCorrection };

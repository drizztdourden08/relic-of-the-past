/**
 * Hooks for computing region/connection data completeness badges.
 * Compares live game state against the static dataset.
 */

import { useMemo } from 'react';
import { getRegionLookup } from '@shared/game/data/regions';
import type { RegionMatchResult } from '@shared/game/data/regions';
import { ALL_CONNECTIONS } from '@shared/game/data/connections';
import type { ScreenDefinition, ScreenConnection } from '@shared/game/types';
import type { RoomStairInfo } from '../../lib/game';
import { getPalaceName } from '@shared/game/data/regions/game-values';

// ─── Region Status ───

type RegionStatus = 'mapped' | 'incomplete' | 'missing';

interface RegionStatusResult {
  status: RegionStatus;
  region: ScreenDefinition | null;
  issues: string[];
  /** Data correction suggestions (shown in editor wizard) */
  corrections: DataCorrection[];
}

interface DataCorrection {
  field: string;
  message: string;
  suggestedValue: unknown;
}

function useRegionStatus(
  matchResult: RegionMatchResult | null,
  isIndoors: boolean,
): RegionStatusResult {
  return useMemo(() => {
    if (!matchResult) {
      return { status: 'missing', region: null, issues: ['No region definition for this room'], corrections: [] };
    }

    const { region, method, palaceMismatch } = matchResult;
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
    if (!region.location) issues.push('Missing location');
    if (isIndoors && region.roomIndex == null) issues.push('Missing roomIndex');
    if (isIndoors && region.type === 'dungeon') {
      if (!region.dungeon.name) issues.push('Missing dungeon name');
      if (region.dungeon.floor == null) issues.push('Missing floor');
      if (region.dungeon.palaceIndex == null && method === 'exact') {
        // Matched via DUNGEON_PALACE_VALUES derivation — suggest explicit palaceIndex
        corrections.push({
          field: 'dungeon.palaceIndex',
          message: 'Add explicit palaceIndex for reliable detection',
          suggestedValue: null, // widget will fill from runtime
        });
      }
    }
    if (region.tags.length === 0) issues.push('No tags');

    return {
      status: issues.length > 0 ? 'incomplete' : 'mapped',
      region,
      issues,
      corrections,
    };
  }, [matchResult, isIndoors]);
}

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

function useConnectionStatus(
  regionId: string | null,
  detectedEntranceScreens: number[],
  detectedStairs: RoomStairInfo[],
  exitScreen: number | null,
): ConnectionStatusResult {
  return useMemo(() => {
    if (!regionId) {
      return {
        status: 'none',
        missingCount: 0,
        existingConnections: [],
        detectedConnections: [],
        unmatched: [],
      };
    }

    // Find all existing connections involving this region
    const existing = ALL_CONNECTIONS.filter(
      c => c.from === regionId || c.to === regionId,
    );

    // Build detected connections from game state
    const detected: DetectedConnection[] = [];

    // Entrances: each entrance that leads to this room from an overworld screen
    for (const screen of detectedEntranceScreens) {
      const owRegion = getRegionLookup().byOverworldScreen.get(screen);
      detected.push({
        type: 'entrance',
        targetRoomOrScreen: screen,
        label: owRegion?.name ?? `OW 0x${screen.toString(16).toUpperCase()}`,
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
      const owRegion = getRegionLookup().byOverworldScreen.get(exitScreen);
      detected.push({
        type: 'entrance',
        targetRoomOrScreen: exitScreen,
        label: `Exit → ${owRegion?.name ?? `OW 0x${exitScreen.toString(16).toUpperCase()}`}`,
      });
    }

    // Compare: for each detected connection, check if a matching one exists
    const unmatched: DetectedConnection[] = [];
    const lookup = getRegionLookup();

    for (const det of detected) {
      let found = false;
      for (const conn of existing) {
        const otherRegionId = conn.from === regionId ? conn.to : conn.from;
        const otherRegion = lookup.byOverworldScreen.get(det.targetRoomOrScreen)
          ?? lookup.byCaveRoom.get(det.targetRoomOrScreen)
          ?? [...lookup.byDungeonRoom.values()].find(r => r.roomIndex === det.targetRoomOrScreen);

        if (otherRegion && otherRegionId === otherRegion.id) {
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
  }, [regionId, detectedEntranceScreens, detectedStairs, exitScreen]);
}

export { useRegionStatus, useConnectionStatus };
export type { RegionStatus, RegionStatusResult, ConnectionStatus, ConnectionStatusResult, DetectedConnection, DataCorrection };

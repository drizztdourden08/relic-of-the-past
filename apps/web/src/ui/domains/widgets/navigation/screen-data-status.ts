/* @layer renderer-widgets @kind logic */
/**
 * Screen data completeness, as a plain function of the detection result.
 *
 * Lifted out of `useScreenDataStatus` unchanged so it can be called without a
 * React render. The recommendation detector reads exactly this, which is what
 * makes the two agree on what "incomplete" means.
 */

import { getPalaceName } from '@shared/game/logic/queries/dungeon-values';
import type { ScreenMatchResult } from '@shared/game/logic/queries/detection';
import type { ScreenRecord } from '@shared/game/data';

type ScreenDataStatus = 'mapped' | 'incomplete' | 'missing';

/** One field the live game can settle that the record gets wrong or leaves blank. */
interface DataCorrection {
  field: string;
  message: string;
  suggestedValue: unknown;
}

interface ScreenDataStatusResult {
  status: ScreenDataStatus;
  screen: ScreenRecord | null;
  issues: string[];
  corrections: DataCorrection[];
}

const hex = (n: number): string => `0x${n.toString(16).toUpperCase()}`;

const screenDataStatus = (matchResult: ScreenMatchResult | null, isIndoors: boolean): ScreenDataStatusResult => {
  if (!matchResult) {
    return { status: 'missing', screen: null, issues: ['No screen definition for this room'], corrections: [] };
  }

  const { screen, method, palaceMismatch } = matchResult;
  const issues: string[] = [];
  const corrections: DataCorrection[] = [];

  // Palace mismatch: data has wrong/missing palaceIndex.
  if (method === 'palace-scan' && palaceMismatch) {
    const { actual, expected } = palaceMismatch;
    issues.push(`Palace mismatch: game reports ${getPalaceName(actual)} (${hex(actual)}) but data has ${hex(expected)}`);
    corrections.push({
      field: 'gameId.palaceIndex',
      message: `Set palaceIndex to ${hex(actual)} (${getPalaceName(actual)})`,
      suggestedValue: actual,
    });
  }

  // Ambiguous cave match.
  if (method === 'cave-ambiguous') {
    issues.push('Multiple caves share this room index, so entranceId is needed to disambiguate');
    corrections.push({
      field: 'gameId.entranceId',
      message: 'Add entranceId to disambiguate from other caves with same room',
      suggestedValue: null,
    });
  }

  // Required fields.
  if (!screen.locationId) issues.push('Missing location');
  if (isIndoors && screen.gameId.roomIndex == null) issues.push('Missing roomIndex');
  if (isIndoors && screen.kind === 'dungeon') {
    if (screen.position?.floor == null) issues.push('Missing floor');
  }
  if (screen.tags.length === 0) issues.push('No tags');

  return { status: issues.length > 0 ? 'incomplete' : 'mapped', screen, issues, corrections };
};

export { screenDataStatus };
export type { DataCorrection, ScreenDataStatus, ScreenDataStatusResult };

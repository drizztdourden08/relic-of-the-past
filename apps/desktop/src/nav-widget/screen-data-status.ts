/* @layer renderer-widgets @kind logic */
import { getPalaceName } from '@rotp/game-data';
import type { ScreenMatchResult } from '@rotp/game-data';
import type { DataCorrection, ScreenDataStatusResult } from '../views/NavigationWidget/NavigationWidget.type';

const hex = (n: number): string => `0x${n.toString(16).toUpperCase()}`;

const screenDataStatus = (matchResult: ScreenMatchResult | null, isIndoors: boolean): ScreenDataStatusResult => {
  if (!matchResult) {
    return { status: 'missing', screen: null, issues: ['No screen definition for this room'], corrections: [] };
  }

  const { screen, method, palaceMismatch } = matchResult;
  const issues: string[] = [];
  const corrections: DataCorrection[] = [];

  if (method === 'palace-scan' && palaceMismatch) {
    const { actual, expected } = palaceMismatch;
    issues.push(`Palace mismatch: game reports ${getPalaceName(actual)} (${hex(actual)}) but data has ${hex(expected)}`);
    corrections.push({
      field: 'gameId.palaceIndex',
      message: `Set palaceIndex to ${hex(actual)} (${getPalaceName(actual)})`,
      suggestedValue: actual,
    });
  }

  if (method === 'cave-ambiguous') {
    issues.push('Multiple caves share this room index, so entranceId is needed to disambiguate');
    corrections.push({
      field: 'gameId.entranceId',
      message: 'Add entranceId to disambiguate from other caves with same room',
      suggestedValue: null,
    });
  }

  if (!screen.locationId) issues.push('Missing location');
  if (isIndoors && screen.gameId.roomIndex == null) issues.push('Missing roomIndex');
  if (isIndoors && screen.kind === 'dungeon') {
    if (screen.position?.floor == null) issues.push('Missing floor');
  }
  if (screen.tags.length === 0) issues.push('No tags');

  return { status: issues.length > 0 ? 'incomplete' : 'mapped', screen, issues, corrections };
};

export { screenDataStatus };
export type { DataCorrection, ScreenDataStatus, ScreenDataStatusResult } from '../views/NavigationWidget/NavigationWidget.type';

/* @layer renderer-widgets @kind logic */
import type { ScreenMatchResult } from '@rotp/game-data';
import { NO_FINDING } from './findings.constants';
import type { Finding } from './finding.type';

const caveFinding = (matchResult: ScreenMatchResult): Finding => {
  if (matchResult.method !== 'cave-ambiguous') return NO_FINDING;
  return {
    issues: ['Multiple caves share this room index, so entranceId is needed to disambiguate'],
    corrections: [{
      field: 'gameId.entranceId',
      message: 'Add entranceId to disambiguate from other caves with same room',
      suggestedValue: null,
    }],
  };
};

export { caveFinding };

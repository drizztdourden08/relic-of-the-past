/* @layer renderer-widgets @kind logic */
import { getPalaceName } from '@rotp/game-data';
import type { ScreenMatchResult } from '@rotp/game-data';
import { NO_FINDING } from './findings.constants';
import type { Finding } from './finding.type';
import { hex } from './hex';

const palaceFinding = (matchResult: ScreenMatchResult): Finding => {
  const { method, palaceMismatch } = matchResult;
  if (method !== 'palace-scan' || !palaceMismatch) return NO_FINDING;
  const { actual, expected } = palaceMismatch;
  return {
    issues: [`Palace mismatch: game reports ${getPalaceName(actual)} (${hex(actual)}) but data has ${hex(expected)}`],
    corrections: [{
      field: 'gameId.palaceIndex',
      message: `Set palaceIndex to ${hex(actual)} (${getPalaceName(actual)})`,
      suggestedValue: actual,
    }],
  };
};

export { palaceFinding };

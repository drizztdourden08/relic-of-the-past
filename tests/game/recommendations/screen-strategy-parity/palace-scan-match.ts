/* @layer test @kind helper */
import type { ScreenRecord } from '@shared/game/data';
import type { ScreenMatchResult } from '@shared/game/logic/queries/detection';
import { WRONG_PALACE } from './screen-strategy-parity.constants';

const palaceScanMatch = (screen: ScreenRecord): ScreenMatchResult => ({
  screen,
  method: 'palace-scan',
  palaceMismatch: { expected: screen.gameId.palaceIndex as number, actual: WRONG_PALACE },
});

export { palaceScanMatch };

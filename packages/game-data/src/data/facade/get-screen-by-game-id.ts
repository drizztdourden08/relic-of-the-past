/* @layer shared-game @kind logic */
import { screenByGameId } from '../indexes';
import type { ScreenGameId, ScreenRecord } from '../types';

const getScreenByGameId = (match: Partial<ScreenGameId>): ScreenRecord | undefined => screenByGameId(match);

export { getScreenByGameId };

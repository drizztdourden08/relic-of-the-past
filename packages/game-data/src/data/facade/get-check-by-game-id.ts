/* @layer shared-game @kind logic */
import { checkByGameId } from '../indexes';
import type { CheckGameId, CheckRecord } from '../types';

const getCheckByGameId = (match: Partial<CheckGameId>): CheckRecord | undefined => checkByGameId(match);

export { getCheckByGameId };

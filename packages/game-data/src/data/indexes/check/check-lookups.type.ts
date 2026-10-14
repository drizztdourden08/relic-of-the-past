/* @layer shared-game @kind types */
import type { CheckGameId, CheckRecord } from '../../types';

type CheckLookup = (match: Partial<CheckGameId>) => CheckRecord | undefined;

export type { CheckLookup };

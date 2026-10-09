/* @layer bridge-wasm @kind logic */
import { getCheck } from '@rotp/game-data';
import type { CheckId } from '@rotp/game-data';

const isReportableCheck = (checkId: string): boolean => {
  try {
    getCheck(checkId as CheckId);
    return true;
  } catch {
    return false;
  }
};

export { isReportableCheck };

/* @layer bridge-wasm @kind logic */
import { getCheck } from '@shared/game/data';
import type { CheckId } from '@shared/game/data';

const isReportableCheck = (checkId: string): boolean => {
  try {
    getCheck(checkId as CheckId);
    return true;
  } catch {
    return false;
  }
};

export { isReportableCheck };

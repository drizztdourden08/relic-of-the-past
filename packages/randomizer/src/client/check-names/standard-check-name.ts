/* @layer bridge-wasm @kind logic */
import { getCheck, standardNameOfCheck } from '@rotp/game-data';

const standardCheckName = (checkId: string): string => standardNameOfCheck(getCheck(checkId));

export { standardCheckName };

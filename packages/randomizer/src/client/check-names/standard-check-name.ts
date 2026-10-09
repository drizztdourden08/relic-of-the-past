/* @layer bridge-wasm @kind logic */
import { getCheck } from '@rotp/game-data';
import { standardNameOfCheck } from '@rotp/game-data';

const standardCheckName = (checkId: string): string => standardNameOfCheck(getCheck(checkId));

export { standardCheckName };

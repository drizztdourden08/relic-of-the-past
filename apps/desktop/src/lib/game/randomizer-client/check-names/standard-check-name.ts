/* @layer bridge-wasm @kind logic */
import { getCheck } from '@shared/game/data';
import { standardNameOfCheck } from '@shared/game/data/check-standard-name';

const standardCheckName = (checkId: string): string => standardNameOfCheck(getCheck(checkId));

export { standardCheckName };

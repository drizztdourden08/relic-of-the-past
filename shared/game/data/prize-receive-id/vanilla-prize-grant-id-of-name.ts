/* @layer shared-game @kind logic */
import { VANILLA_PRIZE_GRANT_ID_BY_NAME } from './prize-receive-id.constants';

const vanillaPrizeGrantIdOfName = (standardItemName: string): number | undefined =>
  VANILLA_PRIZE_GRANT_ID_BY_NAME.get(standardItemName);

export { vanillaPrizeGrantIdOfName };

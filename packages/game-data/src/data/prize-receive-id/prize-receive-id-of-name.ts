/* @layer shared-game @kind logic */
import { PRIZE_RECEIVE_ID_BY_NAME } from './prize-receive-id.constants';

const prizeReceiveIdOfName = (standardItemName: string): number | undefined =>
  PRIZE_RECEIVE_ID_BY_NAME.get(standardItemName);

export { prizeReceiveIdOfName };

/* @layer shared-game @kind logic */
import { PROGRESSIVE_RECEIVE_ID_BY_NAME } from './progressive-receive-id.constants';

const progressiveReceiveIdOfName = (standardItemName: string): number | undefined =>
  PROGRESSIVE_RECEIVE_ID_BY_NAME.get(standardItemName);

export { progressiveReceiveIdOfName };

/* @layer shared-game @kind logic */
import { PROGRESSIVE_RECEIVE_ID_BY_ITEM } from './progressive-receive-id.constants';

const progressiveReceiveIdOfItem = (itemId: string): number | undefined =>
  PROGRESSIVE_RECEIVE_ID_BY_ITEM.get(itemId);

export { progressiveReceiveIdOfItem };

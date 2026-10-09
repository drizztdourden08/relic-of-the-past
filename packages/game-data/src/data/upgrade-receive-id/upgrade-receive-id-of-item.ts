/* @layer shared-game @kind logic */
import { UPGRADE_RECEIVE_ID_BY_ITEM } from './upgrade-receive-id.constants';

const upgradeReceiveIdOfItem = (itemId: string): number | undefined =>
  UPGRADE_RECEIVE_ID_BY_ITEM.get(itemId);

export { upgradeReceiveIdOfItem };

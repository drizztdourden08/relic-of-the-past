/* @layer shared-game @kind logic */
import { isNativeReceiveId } from '../native-receive-id';
import { isProgressiveReceiveId } from '../progressive-receive-id';
import { isPrizeReceiveId } from '../prize-receive-id';
import { isDungeonItemReceiveId } from '../dungeon-item-receive-id';
import { isUpgradeReceiveId } from './is-upgrade-receive-id';

const isGrantableReceiveId = (id: number): boolean =>
  isNativeReceiveId(id) || isUpgradeReceiveId(id) || isProgressiveReceiveId(id)
  || isPrizeReceiveId(id) || isDungeonItemReceiveId(id);

export { isGrantableReceiveId };

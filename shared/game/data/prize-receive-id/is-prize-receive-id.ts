/* @layer shared-game @kind logic */
import { PRIZE_VIRT_FIRST, PRIZE_VIRT_LAST } from './prize-receive-id.constants';

const isPrizeReceiveId = (id: number): boolean =>
  Number.isInteger(id) && id >= PRIZE_VIRT_FIRST && id <= PRIZE_VIRT_LAST;

export { isPrizeReceiveId };

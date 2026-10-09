/* @layer shared-game @kind logic */
import { PROGRESSIVE_OCARINA_ID, PROGRESSIVE_VIRT_FIRST, PROGRESSIVE_VIRT_LAST } from './progressive-receive-id.constants';

const isProgressiveReceiveId = (id: number): boolean =>
  Number.isInteger(id) && ((id >= PROGRESSIVE_VIRT_FIRST && id <= PROGRESSIVE_VIRT_LAST) || id === PROGRESSIVE_OCARINA_ID);

export { isProgressiveReceiveId };

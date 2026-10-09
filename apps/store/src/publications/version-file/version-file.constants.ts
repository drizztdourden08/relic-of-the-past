/* @layer store-site @kind constants */
import { STORE_LIMITS } from '@rotp/hub-contracts';
import type { FileRemoval, RemovalReason, StoreItem } from '@rotp/hub-contracts';
import { deletedLine } from './deleted-line';

const DAY_MS = 24 * 60 * 60 * 1000;
const PERCENT = 100;

const REMOVED_LINES: Record<RemovalReason, (item: StoreItem, removal: FileRemoval) => string> = {
  deleted: deletedLine,
  'rejected-expired': () => `file removed after ${STORE_LIMITS.rejectedKeepDays} days`,
  'ready-expired': () => `never sent, file removed after ${STORE_LIMITS.readyKeepDays} days`,
  pruned: (item) => `file removed · older than ${STORE_LIMITS.filesKept[item.kind]} kept`,
};

export { DAY_MS, PERCENT, REMOVED_LINES };

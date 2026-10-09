/* @layer shared-game @kind data */
import type { AnchorCheck } from './comparator.type';

const ANCHOR_CHECKS: AnchorCheck[] = [
  { checkId: 'check-026', roomId: 0x104, chestIndex: 0 },
  { checkId: 'check-101', roomId: 0x72, chestIndex: 0 },
  { checkId: 'check-102', roomId: 0x80, chestIndex: 0 },
  { checkId: 'check-104', roomId: 0x11, chestIndex: 0 },
  { checkId: 'check-105', roomId: 0x11, chestIndex: 1 },
  { checkId: 'check-106', roomId: 0x11, chestIndex: 2 },
  { checkId: 'check-030', roomId: 0x105, chestIndex: 0 },
];

const STRIDE_GROUPS: string[][] = [
  ['check-104', 'check-105', 'check-106'],
  ['check-012', 'check-013', 'check-014'],
];

export { ANCHOR_CHECKS, STRIDE_GROUPS };

/* @layer shared-game @kind data */
/**
 * Live-verified crosswalk anchors: the check each one is, paired with the
 * (roomId, chestIndex) it was confirmed to occupy in the native chest table.
 * Keyed by check id, because a record has one name and an audit that named a
 * row by text would go stale the moment that name was edited.
 */
interface AnchorCheck {
  checkId: string;
  roomId: number;
  chestIndex: number;
}

const anchorChecks: AnchorCheck[] = [
  { checkId: 'check-026', roomId: 0x104, chestIndex: 0 },
  { checkId: 'check-101', roomId: 0x72, chestIndex: 0 },
  { checkId: 'check-102', roomId: 0x80, chestIndex: 0 },
  { checkId: 'check-104', roomId: 0x11, chestIndex: 0 },
  { checkId: 'check-105', roomId: 0x11, chestIndex: 1 },
  { checkId: 'check-106', roomId: 0x11, chestIndex: 2 },
  { checkId: 'check-030', roomId: 0x105, chestIndex: 0 },
];

/** Checks expected to occupy consecutive chest-table entries, in listed order. */
const strideGroups: string[][] = [
  ['check-104', 'check-105', 'check-106'],
  ['check-012', 'check-013', 'check-014'],
];

export { anchorChecks, strideGroups };

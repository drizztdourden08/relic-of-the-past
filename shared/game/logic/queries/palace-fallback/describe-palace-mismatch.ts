/* @layer shared-game @kind logic */
import type { PalaceMismatch } from './palace-fallback.type';

const hex = (n: number): string => `0x${n.toString(16).padStart(2, '0')}`;

const describePalaceMismatch = ({ expected, actual, room, screenId }: PalaceMismatch): string =>
  `[screens] palace mismatch: room ${hex(room)} reports palace ${hex(actual)} but "${screenId}" is ` +
  `tagged palace ${hex(expected)}. Resolved by room scan; fix that screen's dungeon.palaceIndex.`;

export { describePalaceMismatch };

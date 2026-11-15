/* @layer shared-asset-extraction @kind logic */
import { BANK_BYTES, BANK_OFFSET_MASK, MAX_ENTRY_BYTES, ROM_ADDRESS_BIT } from './dictionary.constants';
import type { PointerTableRead } from './dictionary.type';

const wordAt = (bytes: Uint8Array, at: number): number => (bytes[at] ?? 0) | ((bytes[at + 1] ?? 0) << 8);

const plausible = (length: number): boolean => length >= 1 && length <= MAX_ENTRY_BYTES;

const entryLength = (bytes: Uint8Array, read: PointerTableRead, index: number): number | null => {
  const length = wordAt(bytes, read.at + (index + 1) * 2) - wordAt(bytes, read.at + index * 2);
  if (plausible(length)) return length;
  return index === read.count - 1 ? read.lastLength : null;
};

const readEntry = (bytes: Uint8Array, read: PointerTableRead, index: number): Uint8Array | null => {
  const word = wordAt(bytes, read.at + index * 2);
  const length = entryLength(bytes, read, index);
  if ((word & ROM_ADDRESS_BIT) === 0 || length === null) return null;
  const start = read.bank * BANK_BYTES + (word & BANK_OFFSET_MASK);
  const entry = bytes.subarray(start, start + length);
  if (entry.length !== length || entry.some((byte) => byte >= read.commandStart)) return null;
  return entry;
};

const readPointerTable = (bytes: Uint8Array, read: PointerTableRead): Uint8Array[] | null => {
  const entries: Uint8Array[] = [];
  for (let index = 0; index < read.count; index += 1) {
    const entry = readEntry(bytes, read, index);
    if (!entry) return null;
    entries.push(entry);
  }
  return entries;
};

export { readPointerTable, wordAt };

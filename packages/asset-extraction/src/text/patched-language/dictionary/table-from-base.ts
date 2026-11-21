/* @layer shared-asset-extraction @kind logic */
import { encodeDictionary } from '../../dialogue-encoder';
import { BANK_BYTES, BANK_OFFSET_MASK, ROM_ADDRESS_BIT } from './dictionary.constants';
import type { DictionaryInput, PointerTableRead } from './dictionary.type';
import { findBytes } from './find-bytes';
import { joinEntries } from './join-entries';
import { readPointerTable } from './read-pointer-table';
import { wordAt } from './word-at';

const sameEntries = (left: readonly Uint8Array[], right: readonly Uint8Array[]): boolean =>
  joinEntries(left).equals(joinEntries(right));

const locateInBase = (base: Uint8Array, input: DictionaryInput): PointerTableRead | null => {
  const entries = encodeDictionary(input.config.id);
  const blobAt = findBytes(base, joinEntries(entries));
  if (blobAt < 0) return null;
  const firstWord = (blobAt & BANK_OFFSET_MASK) | ROM_ADDRESS_BIT;
  const lastLength = entries[entries.length - 1]?.length ?? null;
  const read = { count: entries.length, bank: Math.floor(blobAt / BANK_BYTES), commandStart: input.config.commandStart, lastLength };
  for (let at = 0; at + 1 < base.length; at += 1) {
    if (wordAt(base, at) !== firstWord) continue;
    const table = readPointerTable(base, { ...read, at });
    if (table && sameEntries(table, entries)) return { ...read, at };
  }
  return null;
};

const tableFromBase = (input: DictionaryInput): Uint8Array[] | null => {
  if (!input.base) return null;
  const read = locateInBase(input.base, input);
  return read ? readPointerTable(input.patched, read) : null;
};

export { tableFromBase };

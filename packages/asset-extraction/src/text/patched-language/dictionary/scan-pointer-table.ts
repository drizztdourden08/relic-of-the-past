/* @layer shared-asset-extraction @kind logic */
import { BANK_BYTES, MAX_ENTRY_BYTES, ROM_ADDRESS_BIT } from './dictionary.constants';
import type { DictionaryInput } from './dictionary.type';
import { readPointerTable } from './read-pointer-table';
import { wordAt } from './word-at';

const risesSteadily = (bytes: Uint8Array, at: number, count: number): boolean => {
  if ((wordAt(bytes, at) & ROM_ADDRESS_BIT) === 0) return false;
  for (let index = 0; index + 1 < count; index += 1) {
    const step = wordAt(bytes, at + (index + 1) * 2) - wordAt(bytes, at + index * 2);
    if (step < 1 || step > MAX_ENTRY_BYTES) return false;
  }
  return true;
};

const scanPointerTable = (input: DictionaryInput): Uint8Array[] | null => {
  const { patched, config } = input;
  const count = config.dictionary.length;
  for (let at = 0; at + count * 2 < patched.length; at += 1) {
    if (!risesSteadily(patched, at, count)) continue;
    const read = { at, count, bank: Math.floor(at / BANK_BYTES), commandStart: config.commandStart, lastLength: null };
    const table = readPointerTable(patched, read);
    if (table) return table;
  }
  return null;
};

export { scanPointerTable };

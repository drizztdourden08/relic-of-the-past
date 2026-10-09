/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { CURRENCY_SYMBOLS_FILE } from '@shared/asset-extraction/item-sprites/currency-symbols';
import { readSetFile } from './read-set-file';

const readCurrencySymbols = (files: FileStore, romFile: string): Promise<Uint8Array | null> =>
  readSetFile(files, romFile, CURRENCY_SYMBOLS_FILE);

export { readCurrencySymbols };

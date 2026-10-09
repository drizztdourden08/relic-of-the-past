/* @layer renderer-lib @kind logic */
import { sprites } from '@rotp/packs';
import { platformFiles } from '../platform-files';

const readCurrencySymbols = (romFile: string): Promise<Uint8Array | null> =>
  sprites.readCurrencySymbols(platformFiles(), romFile);

export { readCurrencySymbols };

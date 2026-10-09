/* @layer renderer-lib @kind logic */
import * as sprites from '@shared/storage/sprites';
import { platformFiles } from '../platform-files';

const readCurrencySymbols = (romFile: string): Promise<Uint8Array | null> =>
  sprites.readCurrencySymbols(platformFiles(), romFile);

export { readCurrencySymbols };

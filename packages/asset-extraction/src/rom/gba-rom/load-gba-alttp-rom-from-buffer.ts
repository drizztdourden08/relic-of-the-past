/* @layer shared-asset-extraction @kind logic */
import { GbaRomReader } from './gba-rom-reader';

const loadGbaAlttpRomFromBuffer = (
  bytes: Buffer,
  options: { allowUnknownHash?: boolean } = {},
): GbaRomReader => new GbaRomReader(bytes, !options.allowUnknownHash);

export { loadGbaAlttpRomFromBuffer };

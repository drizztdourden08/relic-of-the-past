/* @layer shared-asset-extraction @kind logic */
import { BYTE_SWAP_BLOCK, GBA_SAVE_SIGNATURE, GBA_SAVE_SIGNATURE_BYTES } from './progression-source.constants';

const reverseEightByteBlocks = (save: Uint8Array): Buffer => {
  const result = Buffer.from(save);
  for (let offset = 0; offset < result.length; offset += BYTE_SWAP_BLOCK) {
    result.subarray(offset, Math.min(offset + BYTE_SWAP_BLOCK, result.length)).reverse();
  }
  return result;
};

const hasSignature = (image: Buffer): boolean =>
  image.subarray(0, GBA_SAVE_SIGNATURE_BYTES).toString('ascii') === GBA_SAVE_SIGNATURE;

const normalizeGbaAlttpSave = (save: Uint8Array): Buffer => {
  const direct = Buffer.from(save);
  if (hasSignature(direct)) return direct;
  const reversed = reverseEightByteBlocks(save);
  if (hasSignature(reversed)) return reversed;
  throw new Error('The save is not an ALttP & Four Swords SRAM image');
};

export { normalizeGbaAlttpSave };

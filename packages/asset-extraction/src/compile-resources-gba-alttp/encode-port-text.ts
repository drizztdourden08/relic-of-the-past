/* @layer shared-asset-extraction @kind logic */
import { compressStrings } from '../text/dialogue-encoder';

const encodePortText = (plainTexts: readonly string[]): ReturnType<typeof compressStrings> =>
  compressStrings(plainTexts.map(plainText => plainText
    .replace(/\+ Control Pad/g, 'Control Pad')
    .replace(/:/g, ',')
    .replace(/\s+/g, ' ')
    .trim()), 'us');

export { encodePortText };

/* @layer shared-asset-extraction @kind barrel */
export { decodeTextByte } from './decode-text-byte';
export { extractGbaAlttpText } from './extract-gba-alttp-text';
export {
  GBA_EXCLUSIVE_TEXT_IDS, TEXT_BASE, TEXT_COUNT, TEXT_DATA_BLOCK, TEXT_POINTER_TABLE,
} from './text-source.constants';
export type { GbaAlttpTextMessage } from './text-source.type';

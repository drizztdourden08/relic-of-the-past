/* @layer bridge-wasm @kind logic */
import { usesNewFormat } from '@shared/asset-extraction/text/data/language-data';
import { EU_PREFIX, US_EXTRA_BYTE } from './highlight-bytes.constants';

const extraGlyphBytes = (slot: number, code: string): number[] =>
  [usesNewFormat(code) ? EU_PREFIX : US_EXTRA_BYTE, slot];

export { extraGlyphBytes };

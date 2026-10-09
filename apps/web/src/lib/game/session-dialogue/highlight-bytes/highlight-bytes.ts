/* @layer bridge-wasm @kind logic */
import { usesNewFormat } from '@shared/asset-extraction/text/data/language-data';
import { EU_HIGHLIGHT_SUB, EU_PREFIX, US_HIGHLIGHT_BYTE } from './highlight-bytes.constants';

const highlightBytes = (kind: number, code: string): number[] =>
  (usesNewFormat(code) ? [EU_PREFIX, EU_HIGHLIGHT_SUB + kind] : [US_HIGHLIGHT_BYTE + kind]);

export { highlightBytes };

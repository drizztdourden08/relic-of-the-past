/* @layer shared-asset-extraction @kind logic */
import { EXTRACTION_STAMP_FILE } from './extraction-stamp.constants';
import { extractionVersionOf } from './extraction-version-of';
import type { SpriteDef } from '../extract-items/extract-items.type';
import type { ExtractionStamp } from './extraction-stamp.type';

const extractionStampBuffer = (defs: readonly SpriteDef[]): { name: string; bytes: Uint8Array } => {
  const stamp: ExtractionStamp = { version: extractionVersionOf(defs) };
  return { name: EXTRACTION_STAMP_FILE, bytes: new TextEncoder().encode(JSON.stringify(stamp)) };
};

export { extractionStampBuffer };

/* @layer shared-asset-extraction @kind logic */
import { EXTRACTORS } from './extract-items.constants';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { ExtractionContext, SpriteExtractDef } from './extract-items.type';

const extractOne = (def: SpriteExtractDef, ctx: ExtractionContext): ImageBuffer | null => {
  const extractor = EXTRACTORS[def.method];
  if (!extractor) throw new Error(`Unknown extraction method: ${def.method}`);
  return extractor(def, ctx);
};

export { extractOne };

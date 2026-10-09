/* @layer shared-asset-extraction @kind logic */
import { extractOne } from './extract-one';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { ExtractionContext } from './extract-items.type';

const extractByFile = (file: string, ctx: ExtractionContext): ImageBuffer | null => {
  const def = ctx.byFile.get(file);
  if (!def) throw new Error(`no definition named ${file}`);
  if (ctx.resolving.has(file)) throw new Error(`${file} is its own base`);
  ctx.resolving.add(file);
  try {
    return extractOne(def, ctx);
  } finally {
    ctx.resolving.delete(file);
  }
};

export { extractByFile };

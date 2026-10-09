/* @layer shared-asset-extraction @kind logic */
import { readdirSync, unlinkSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import type { SpriteBuffersResult } from './extract-items';
import type { ExtractionResult } from './extract-items-node.type';

const pruneStalePngs = (outputDir: string, expected: ReadonlySet<string>): number => {
  let removed = 0;
  try {
    for (const f of readdirSync(outputDir).filter((f) => f.endsWith('.png'))) {
      if (!expected.has(f)) { unlinkSync(join(outputDir, f)); removed += 1; }
    }
  } catch {
    return removed;
  }
  return removed;
};

const writeAndPrune = (outputDir: string, result: SpriteBuffersResult): ExtractionResult => {
  for (const buf of result.buffers) {
    const filePath = join(outputDir, buf.name);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, buf.bytes);
  }
  const expected = new Set(result.buffers.map((b) => b.name));
  const wrotePictures = result.buffers.some((b) => b.name.endsWith('.png'));
  const removedStale = wrotePictures ? pruneStalePngs(outputDir, expected) : 0;
  return { total: result.buffers.length, counts: result.counts, errors: result.errors, removedStale };
};

export { writeAndPrune };

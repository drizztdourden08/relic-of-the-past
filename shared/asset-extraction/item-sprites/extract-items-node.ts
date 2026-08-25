/* @layer shared-asset-extraction @kind logic */
/**
 * Node-only sprite extraction: ROM-from-path, default definitions from disk, and
 * PNG file writing + stale pruning. Wraps the pure extractSpriteBuffers core.
 */
import { readFileSync, readdirSync, unlinkSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import type { RomData } from '../rom/rom-types';
import { loadRom } from '../rom/load-rom-file';
import { extractSpriteBuffers, type SpriteDef, type SpriteCounts } from './extract-items';

interface ExtractionResult {
  total: number;
  counts: SpriteCounts;
  errors: string[];
  removedStale: number;
}

const DEFAULT_DEFS_PATH = join(__dirname, '..', '..', 'game', 'sprites', 'definitions.json');

const resolveDefs = (defsOrPath?: string | SpriteDef[]): SpriteDef[] => {
  if (Array.isArray(defsOrPath)) return defsOrPath;
  const path = defsOrPath ?? DEFAULT_DEFS_PATH;
  return (JSON.parse(readFileSync(path, 'utf-8')) as { sprites: SpriteDef[] }).sprites;
};

const writeAndPrune = (outputDir: string, result: ReturnType<typeof extractSpriteBuffers>): ExtractionResult => {
  for (const buf of result.buffers) {
    const filePath = join(outputDir, buf.name);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, buf.bytes);
  }
  const expected = new Set(result.buffers.map((b) => b.name));
  let removedStale = 0;
  // Writing nothing means the definitions were absent, never that every file on
  // disk went stale. Pruning against an empty set would empty the whole folder.
  if (expected.size > 0) {
    try {
      for (const f of readdirSync(outputDir).filter((f) => f.endsWith('.png'))) {
        if (!expected.has(f)) { unlinkSync(join(outputDir, f)); removedStale += 1; }
      }
    } catch { /* outputDir may not exist on first run */ }
  }
  return { total: result.buffers.length, counts: result.counts, errors: result.errors, removedStale };
};

const extractAllItemSprites = (romPath: string, outputDir: string, defsOrPath?: string | SpriteDef[]): ExtractionResult =>
  writeAndPrune(outputDir, extractSpriteBuffers(loadRom(romPath), resolveDefs(defsOrPath)));

const extractAllItemSpritesFromRom = (rom: RomData, outputDir: string, defsOrPath: string | SpriteDef[]): ExtractionResult =>
  writeAndPrune(outputDir, extractSpriteBuffers(rom, resolveDefs(defsOrPath)));

export { extractAllItemSprites, extractAllItemSpritesFromRom };
export type { ExtractionResult };

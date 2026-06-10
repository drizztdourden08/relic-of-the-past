/* @layer shared-asset-extraction @kind logic */
/**
 * Item sprite extraction orchestrator.
 * Replaces scripts/extract-item-sprites.py — same JSON definitions, same output.
 *
 * Usage:
 *   import { extractAllItemSprites } from './extract-items';
 *   await extractAllItemSprites(romPath, outputDir);
 */
import { readFileSync, readdirSync, unlinkSync } from 'fs';
import { join, basename } from 'path';
import type { RomData } from '../rom/rom-types';
import { loadRom } from '../rom/rom-loader';
import type { ImageBuffer } from '../graphics/png-writer';
import type { RGBA } from '../graphics/palette';
import {
  loadHudPalette, loadHudSheets,
  extractHudStandard, extractHudSpecial,
  extractHudSingle, extractHudStrip, extractHudVStrip,
} from './hud-decoder';
import {
  loadSpritePalettes, loadReceiptSheets,
  extractReceipt, extractReceiptRecolor,
  type SpritePalettes, type ReceiptSheets,
} from './receipt-decoder';
import {
  loadDropSheets,
  extractDropStandard, extractDropNumbered,
  extractDropRupee, extractDropBigkey,
  extractDropShieldFighters, extractDropShieldFire,
  extractFollowerBomb,
  type DropSheets,
} from './drop-decoder';

/** Sprite definition from sprite-definitions.json */
interface SpriteExtractDef {
  method: string;
  tiles?: number[];
  layout?: string;
  width?: number;
  receiptId?: number;
  spriteType?: number;
  palette?: number;
  group?: number;
  sheet?: number;
}

interface SpriteDef {
  file: string;
  label: string;
  category: 'hud' | 'hud-pause' | 'hud-item' | 'fonts' | 'receipt' | 'drop';
  extract: SpriteExtractDef;
}

export type { SpriteDef };

interface SpriteDefsJson {
  sprites: SpriteDef[];
}

/** Extraction context with all pre-loaded ROM data. */
interface ExtractionContext {
  rom: RomData;
  hudSheets: Buffer[];
  hudPalette: Map<number, RGBA>;
  spritePalettes: SpritePalettes;
  receiptSheets: ReceiptSheets;
  dropSheets: DropSheets;
}

/**
 * Extract a single sprite given its definition.
 */
/** One extractor per method (Strategy/Factory map — add a method by adding an entry). */
type Extractor = (def: SpriteExtractDef, ctx: ExtractionContext) => ImageBuffer | null;

const EXTRACTORS: Record<string, Extractor> = {
  'hud-tiles': (def, ctx) => extractHudStandard(def.tiles!, ctx.hudSheets, ctx.hudPalette),
  'hud-special': (def, ctx) => extractHudSpecial(def.tiles!, def.layout!, ctx.hudSheets, ctx.hudPalette),
  'hud-single': (def, ctx) => extractHudSingle(def.tiles![0], ctx.hudSheets, ctx.hudPalette),
  'hud-strip': (def, ctx) => extractHudStrip(def.tiles!, ctx.hudSheets, ctx.hudPalette, def.width),
  'hud-vstrip': (def, ctx) => extractHudVStrip(def.tiles!, ctx.hudSheets, ctx.hudPalette),
  'receipt': (def, ctx) => extractReceipt(def.receiptId!, ctx.rom, ctx.receiptSheets, ctx.spritePalettes),
  'receipt-recolor': (def, ctx) => extractReceiptRecolor(def.receiptId!, def.palette!, ctx.rom, ctx.receiptSheets, ctx.spritePalettes),
  'drop-standard': (def, ctx) => extractDropStandard(def.spriteType!, def.palette!, ctx.spritePalettes, ctx.dropSheets),
  'drop-numbered': (def, ctx) => extractDropNumbered(def.spriteType!, def.palette!, def.group!, ctx.spritePalettes, ctx.dropSheets),
  'drop-rupee': (def, ctx) => extractDropRupee(def.palette!, ctx.spritePalettes, ctx.dropSheets),
  'drop-bigkey': (def, ctx) => extractDropBigkey(def.palette!, ctx.spritePalettes, ctx.receiptSheets),
  'drop-shield-fighters': (def, ctx) => extractDropShieldFighters(def.sheet!, def.tiles!, def.palette!, ctx.spritePalettes, ctx.dropSheets),
  'drop-shield-fire': (def, ctx) => extractDropShieldFire(def.sheet!, def.tiles!, def.palette!, ctx.spritePalettes, ctx.dropSheets),
  'follower-bomb': (def, ctx) => extractFollowerBomb(def.palette!, ctx.rom, ctx.spritePalettes),
};

const extractOne = (def: SpriteExtractDef, ctx: ExtractionContext): ImageBuffer | null => {
  const extractor = EXTRACTORS[def.method];
  if (!extractor) throw new Error(`Unknown extraction method: ${def.method}`);
  return extractor(def, ctx);
};

interface ExtractionResult {
  total: number;
  counts: { hud: number; 'hud-pause': number; 'hud-item': number; fonts: number; receipt: number; drop: number };
  errors: string[];
  removedStale: number;
}

const DEFAULT_DEFS_PATH = join(__dirname, '..', '..', 'game', 'sprites', 'definitions.json');

/** Resolve sprite definitions from an array, an explicit JSON path, or the default path. */
const resolveDefs = (defsOrPath?: string | SpriteDef[]): SpriteDef[] => {
  if (Array.isArray(defsOrPath)) return defsOrPath;
  const path = defsOrPath ?? DEFAULT_DEFS_PATH;
  return (JSON.parse(readFileSync(path, 'utf-8')) as SpriteDefsJson).sprites;
};

/** Shared extraction core: pre-load ROM data, extract every sprite, prune stale files. */
const runExtraction = (rom: RomData, outputDir: string, allSprites: SpriteDef[]): ExtractionResult => {
  const ctx: ExtractionContext = {
    rom,
    hudSheets: loadHudSheets(rom),
    hudPalette: loadHudPalette(rom),
    spritePalettes: loadSpritePalettes(rom),
    receiptSheets: loadReceiptSheets(rom),
    dropSheets: loadDropSheets(rom),
  };

  const counts = { hud: 0, 'hud-pause': 0, 'hud-item': 0, fonts: 0, receipt: 0, drop: 0 };
  const errors: string[] = [];

  // Extract each sprite
  for (const spriteDef of allSprites) {
    try {
      const img = extractOne(spriteDef.extract, ctx);
      if (!img) {
        errors.push(`${spriteDef.file}: extraction returned null`);
        continue;
      }
      // Scale 16×16 → 32×32 and save
      const scaled = img.scale(2);
      scaled.savePng(join(outputDir, `${spriteDef.file}.png`));
      counts[spriteDef.category]++;
    } catch (e) {
      errors.push(`${spriteDef.file}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Remove stale files not in definitions
  const expected = new Set(allSprites.map(s => `${s.file}.png`));
  let removedStale = 0;
  try {
    const existing = readdirSync(outputDir).filter(f => f.endsWith('.png'));
    for (const f of existing) {
      if (!expected.has(f)) {
        unlinkSync(join(outputDir, f));
        removedStale++;
      }
    }
  } catch {
    // outputDir might not exist yet on first run — that's fine
  }

  return {
    total: counts.hud + counts['hud-pause'] + counts['hud-item'] + counts.fonts + counts.receipt + counts.drop,
    counts,
    errors,
    removedStale,
  };
};

/** Extract from a ROM file path (loads the ROM, then runs extraction). */
const extractAllItemSprites = (romPath: string, outputDir: string, defsOrPath?: string | SpriteDef[]): ExtractionResult =>
  runExtraction(loadRom(romPath), outputDir, resolveDefs(defsOrPath));

/** Extract from an already-loaded ROM (no disk read for the ROM). */
const extractAllItemSpritesFromRom = (rom: RomData, outputDir: string, defsOrPath: string | SpriteDef[]): ExtractionResult =>
  runExtraction(rom, outputDir, resolveDefs(defsOrPath));

export { extractAllItemSprites, extractAllItemSpritesFromRom };
export type { ExtractionResult };

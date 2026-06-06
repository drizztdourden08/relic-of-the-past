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
  hudPalette: Map<number, import('../graphics/palette').RGBA>;
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

/**
 * Extract all item sprites from ROM to output directory.
 *
 * @param romPath - Path to the .sfc ROM file
 * @param outputDir - Directory for output PNGs (created if needed)
 * @param defsOrPath - Sprites array, path to sprite-definitions.json, or omit for auto-detect
 * @returns Extraction result summary
 */
function extractAllItemSprites(
  romPath: string,
  outputDir: string,
  defsOrPath?: string | SpriteDef[],
): ExtractionResult {
  // Load definitions
  const allSprites: SpriteDef[] = Array.isArray(defsOrPath)
    ? defsOrPath
    : (JSON.parse(readFileSync(
        defsOrPath ?? join(__dirname, '..', '..', 'game', 'sprites', 'definitions.json'),
        'utf-8',
      )) as SpriteDefsJson).sprites;

  // Load ROM
  const rom = loadRom(romPath);

  // Pre-load all needed data from ROM
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
}

/**
 * Extract all item sprites from a ROM already loaded in memory.
 * Used by Electron main process when ROM is already available as a Buffer.
 *
 * @param rom - Loaded ROM data
 * @param outputDir - Directory for output PNGs
 * @param defsOrPath - Either a path to sprite-definitions.json, or the sprites array directly
 */
function extractAllItemSpritesFromRom(
  rom: RomData,
  outputDir: string,
  defsOrPath: string | SpriteDef[],
): ExtractionResult {
  const allSprites: SpriteDef[] = Array.isArray(defsOrPath)
    ? defsOrPath
    : (JSON.parse(readFileSync(defsOrPath, 'utf-8')) as SpriteDefsJson).sprites;

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

  for (const spriteDef of allSprites) {
    try {
      const img = extractOne(spriteDef.extract, ctx);
      if (!img) {
        errors.push(`${spriteDef.file}: extraction returned null`);
        continue;
      }
      const scaled = img.scale(2);
      scaled.savePng(join(outputDir, `${spriteDef.file}.png`));
      counts[spriteDef.category]++;
    } catch (e) {
      errors.push(`${spriteDef.file}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

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
  } catch { /* ok */ }

  return {
    total: counts.hud + counts['hud-pause'] + counts['hud-item'] + counts.fonts + counts.receipt + counts.drop,
    counts,
    errors,
    removedStale,
  };
}

export { extractAllItemSprites, extractAllItemSpritesFromRom };
export type { ExtractionResult };

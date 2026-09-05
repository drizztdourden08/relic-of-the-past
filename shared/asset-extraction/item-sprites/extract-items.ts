/* @layer shared-asset-extraction @kind logic */
/**
 * Item sprite extraction core, pure (no fs): produces PNG byte buffers per sprite so it runs in
 * the renderer/Worker and Node. File writing and ROM-from-path live in extract-items-node.ts.
 */
import type { RomData } from '../rom/rom-types';
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
import { extractDialogueGlyph, loadDialogueFont } from './dialogue-glyph-decoder';
import {
  loadDropSheets,
  extractDropStandard, extractDropNumbered,
  extractDropRupee, extractDropBigkey,
  extractDropShieldFighters, extractDropShieldFire,
  extractFollowerBomb,
  type DropSheets,
} from './drop-decoder';

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
  /** Dialogue-font character index (its position in the language's alphabet). */
  glyph?: number;
  /** Second character, paired to the right of `glyph` to form one picture. */
  glyphRight?: number;
}

interface SpriteDef {
  file: string;
  label: string;
  category: 'hud' | 'hud-pause' | 'hud-item' | 'fonts' | 'receipt' | 'drop';
  extract: SpriteExtractDef;
}

interface ExtractionContext {
  rom: RomData;
  hudSheets: Buffer[];
  hudPalette: Map<number, RGBA>;
  spritePalettes: SpritePalettes;
  receiptSheets: ReceiptSheets;
  dropSheets: DropSheets;
  dialogueFont: Buffer;
}

type Extractor = (def: SpriteExtractDef, ctx: ExtractionContext) => ImageBuffer | null;

const EXTRACTORS: Record<string, Extractor> = {
  'hud-tiles': (def, ctx) => extractHudStandard(def.tiles!, ctx.hudSheets, ctx.hudPalette),
  'hud-special': (def, ctx) => extractHudSpecial(def.tiles!, def.layout!, ctx.hudSheets, ctx.hudPalette),
  'hud-single': (def, ctx) => extractHudSingle(def.tiles![0], ctx.hudSheets, ctx.hudPalette),
  'hud-strip': (def, ctx) => extractHudStrip(def.tiles!, ctx.hudSheets, ctx.hudPalette, def.width),
  'hud-vstrip': (def, ctx) => extractHudVStrip(def.tiles!, ctx.hudSheets, ctx.hudPalette),
  'dialogue-glyph': (def, ctx) => extractDialogueGlyph(def.glyph!, def.glyphRight, ctx.dialogueFont),
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

interface SpriteCounts { hud: number; 'hud-pause': number; 'hud-item': number; fonts: number; receipt: number; drop: number }
interface SpriteBuffer { name: string; bytes: Uint8Array }
interface SpriteBuffersResult { buffers: SpriteBuffer[]; counts: SpriteCounts; errors: string[] }

/** Extract every sprite from an already-loaded ROM into PNG byte buffers (no fs). */
const extractSpriteBuffers = (rom: RomData, allSprites: SpriteDef[]): SpriteBuffersResult => {
  const ctx: ExtractionContext = {
    rom,
    hudSheets: loadHudSheets(rom),
    hudPalette: loadHudPalette(rom),
    spritePalettes: loadSpritePalettes(rom),
    receiptSheets: loadReceiptSheets(rom),
    dropSheets: loadDropSheets(rom),
    dialogueFont: loadDialogueFont(rom),
  };

  const counts: SpriteCounts = { hud: 0, 'hud-pause': 0, 'hud-item': 0, fonts: 0, receipt: 0, drop: 0 };
  const errors: string[] = [];
  const buffers: SpriteBuffer[] = [];

  for (const spriteDef of allSprites) {
    try {
      const img = extractOne(spriteDef.extract, ctx);
      if (!img) { errors.push(`${spriteDef.file}: extraction returned null`); continue; }
      const scaled = img.scale(2); // 16×16 → 32×32
      buffers.push({ name: `${spriteDef.file}.png`, bytes: new Uint8Array(scaled.toPngBuffer()) });
      counts[spriteDef.category] += 1;
    } catch (e) {
      errors.push(`${spriteDef.file}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return { buffers, counts, errors };
};

export { extractSpriteBuffers };
export type { SpriteDef, SpriteCounts, SpriteBuffer, SpriteBuffersResult };

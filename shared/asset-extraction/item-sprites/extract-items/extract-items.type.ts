/* @layer shared-asset-extraction @kind types */
import type { RomData } from '../../rom/rom-types';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { RGBA } from '../../graphics/palette';
import type { SpritePalettes } from '../receipt-palettes';
import type { ReceiptSheets } from '../receipt-decoder/receipt-decoder.type';
import type { DropSheets } from '../drop-sprite-assembly';
import type { ColorSwap } from '../palette-swap';
import type { TitlePart, TitleSource } from '../../title-screen/extract-title';
import type { Legend } from '../../story-intro/extract-legend';

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
  glyph?: number;
  glyphRight?: number;
  baseFile?: string;
  art?: string;
  badge?: string;
  colors?: ColorSwap[];
  part?: TitlePart;
  legend?: number;
  sheets?: number[];
  upper?: number[];
  paletteSet?: 'overworld' | 'dungeon';
  paletteAux?: number[];
}

interface SpriteDef {
  file: string;
  label: string;
  category: 'hud' | 'hud-pause' | 'hud-item' | 'fonts' | 'receipt' | 'drop' | 'randomizer' | 'title' | 'ground';
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
  byFile: ReadonlyMap<string, SpriteExtractDef>;
  resolving: Set<string>;
  resolveFile: (file: string) => ImageBuffer | null;
  titleSource: () => TitleSource;
  legendSource: () => Legend;
}

type Extractor = (def: SpriteExtractDef, ctx: ExtractionContext) => ImageBuffer | null;

interface SpriteCounts {
  hud: number; 'hud-pause': number; 'hud-item': number;
  fonts: number; receipt: number; drop: number; randomizer: number; title: number; ground: number;
}
interface SpriteBuffer { name: string; bytes: Uint8Array }
interface SpriteBuffersResult { buffers: SpriteBuffer[]; counts: SpriteCounts; errors: string[] }

export type {
  ExtractionContext, Extractor, SpriteBuffer, SpriteBuffersResult, SpriteCounts, SpriteDef, SpriteExtractDef,
};

/* @layer shared-asset-extraction @kind constants */
import {
  extractHudStandard, extractHudSpecial,
  extractHudSingle, extractHudStrip, extractHudVStrip,
} from '../hud-decoder';
import { extractReceipt, extractReceiptRecolor } from '../receipt-decoder';
import { extractDialogueGlyph } from '../dialogue-glyph-decoder';
import { extractBgTile } from '../bg-tile-decoder';
import {
  extractDropStandard, extractDropNumbered,
  extractDropRupee, extractDropBigkey,
  extractDropShieldFighters, extractDropShieldFire,
  extractFollowerBomb,
} from '../drop-decoder';
import { artImage } from '../art-picture';
import { extractArtBadge } from '../art-badge';
import { extractUpgradeComposite } from '../upgrade-composite';
import { extractPaletteSwap } from '../palette-swap';
import { extractTitlePart } from '../../title-screen/extract-title';
import { extractLegend } from '../../story-intro/extract-legend';
import type { Extractor } from './extract-items.type';

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
  'art': (def) => artImage(def.art!),
  'art-badge': (def) => extractArtBadge({ art: def.art!, badge: def.badge! }),
  'upgrade-composite': (def, ctx) =>
    extractUpgradeComposite({ baseFile: def.baseFile, art: def.art, badge: def.badge! }, ctx.resolveFile),
  'title-screen': (def, ctx) => extractTitlePart(def.part!, ctx.titleSource()),
  'story-legend': (def, ctx) => extractLegend(ctx.rom, ctx.legendSource(), def.legend!),
  'palette-swap': (def, ctx) =>
    extractPaletteSwap({ baseFile: def.baseFile!, colors: def.colors! }, ctx.resolveFile),
  'bg-tile': (def, ctx) => extractBgTile(ctx.rom, {
    sheets: def.sheets!, upper: def.upper ?? [], tiles: def.tiles!,
    paletteSet: def.paletteSet ?? 'overworld', paletteIndex: def.palette ?? 0,
    paletteAux: def.paletteAux ?? [],
  }),
};

const PNG_SCALE = 2;

export { EXTRACTORS, PNG_SCALE };

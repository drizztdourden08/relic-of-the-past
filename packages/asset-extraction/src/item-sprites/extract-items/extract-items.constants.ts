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
import { itemAt } from '../../checked-read';
import type { Extractor } from './extract-items.type';
import { needField as need } from './need-field';

const EXTRACTORS: Partial<Record<string, Extractor>> = {
  'hud-tiles': (def, ctx) => extractHudStandard(need(def, 'tiles'), ctx.hudSheets, ctx.hudPalette),
  'hud-special': (def, ctx) =>
    extractHudSpecial(need(def, 'tiles'), need(def, 'layout'), ctx.hudSheets, ctx.hudPalette),
  'hud-single': (def, ctx) =>
    extractHudSingle(itemAt(need(def, 'tiles'), 0, 'hud-single tiles'), ctx.hudSheets, ctx.hudPalette),
  'hud-strip': (def, ctx) => extractHudStrip(need(def, 'tiles'), ctx.hudSheets, ctx.hudPalette, def.width),
  'hud-vstrip': (def, ctx) => extractHudVStrip(need(def, 'tiles'), ctx.hudSheets, ctx.hudPalette),
  'dialogue-glyph': (def, ctx) => extractDialogueGlyph(need(def, 'glyph'), def.glyphRight, ctx.dialogueFont),
  'receipt': (def, ctx) =>
    extractReceipt(need(def, 'receiptId'), ctx.rom, ctx.receiptSheets, ctx.spritePalettes),
  'receipt-recolor': (def, ctx) => extractReceiptRecolor(
    need(def, 'receiptId'), need(def, 'palette'), ctx.rom, ctx.receiptSheets, ctx.spritePalettes,
  ),
  'drop-standard': (def, ctx) =>
    extractDropStandard(need(def, 'spriteType'), need(def, 'palette'), ctx.spritePalettes, ctx.dropSheets),
  'drop-numbered': (def, ctx) => extractDropNumbered(
    need(def, 'spriteType'), need(def, 'palette'), need(def, 'group'), ctx.spritePalettes, ctx.dropSheets,
  ),
  'drop-rupee': (def, ctx) => extractDropRupee(need(def, 'palette'), ctx.spritePalettes, ctx.dropSheets),
  'drop-bigkey': (def, ctx) => extractDropBigkey(need(def, 'palette'), ctx.spritePalettes, ctx.receiptSheets),
  'drop-shield-fighters': (def, ctx) => extractDropShieldFighters(
    need(def, 'sheet'), need(def, 'tiles'), need(def, 'palette'), ctx.spritePalettes, ctx.dropSheets,
  ),
  'drop-shield-fire': (def, ctx) => extractDropShieldFire(
    need(def, 'sheet'), need(def, 'tiles'), need(def, 'palette'), ctx.spritePalettes, ctx.dropSheets,
  ),
  'follower-bomb': (def, ctx) => extractFollowerBomb(need(def, 'palette'), ctx.rom, ctx.spritePalettes),
  'art': (def) => artImage(need(def, 'art')),
  'art-badge': (def) => extractArtBadge({ art: need(def, 'art'), badge: need(def, 'badge') }),
  'upgrade-composite': (def, ctx) =>
    extractUpgradeComposite({ baseFile: def.baseFile, art: def.art, badge: need(def, 'badge') }, ctx.resolveFile),
  'title-screen': (def, ctx) => extractTitlePart(need(def, 'part'), ctx.titleSource()),
  'story-legend': (def, ctx) => extractLegend(ctx.rom, ctx.legendSource(), need(def, 'legend')),
  'palette-swap': (def, ctx) =>
    extractPaletteSwap({ baseFile: need(def, 'baseFile'), colors: need(def, 'colors') }, ctx.resolveFile),
  'bg-tile': (def, ctx) => extractBgTile(ctx.rom, {
    sheets: need(def, 'sheets'), upper: def.upper ?? [], tiles: need(def, 'tiles'),
    paletteSet: def.paletteSet ?? 'overworld', paletteIndex: def.palette ?? 0,
    paletteAux: def.paletteAux ?? [],
  }),
};

const PNG_SCALE = 2;

export { EXTRACTORS, PNG_SCALE };

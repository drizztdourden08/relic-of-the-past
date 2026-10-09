/* @layer shared-asset-extraction @kind logic */
import { loadHudPalette, loadHudSheets } from '../hud-decoder';
import { loadSpritePalettes, loadReceiptSheets } from '../receipt-decoder';
import { loadDialogueFont } from '../dialogue-glyph-decoder';
import { loadDropSheets } from '../drop-decoder';
import { loadTitleSource } from '../../title-screen/extract-title';
import { loadLegend } from '../../story-intro/extract-legend';
import { extractByFile } from './extract-by-file';
import type { RomData } from '../../rom/rom-types';
import type { TitleSource } from '../../title-screen/extract-title';
import type { Legend } from '../../story-intro/extract-legend';
import type { ExtractionContext, SpriteDef } from './extract-items.type';

const createExtractionContext = (rom: RomData, allSprites: SpriteDef[]): ExtractionContext => {
  let title: TitleSource | undefined;
  let legend: Legend | undefined;
  const ctx: ExtractionContext = {
    rom,
    hudSheets: loadHudSheets(rom),
    hudPalette: loadHudPalette(rom),
    spritePalettes: loadSpritePalettes(rom),
    receiptSheets: loadReceiptSheets(rom),
    dropSheets: loadDropSheets(rom),
    dialogueFont: loadDialogueFont(rom),
    byFile: new Map(allSprites.map((sprite) => [sprite.file, sprite.extract])),
    resolving: new Set(),
    resolveFile: (file) => extractByFile(file, ctx),
    titleSource: () => (title ??= loadTitleSource(rom)),
    legendSource: () => (legend ??= loadLegend(rom)),
  };
  return ctx;
};

export { createExtractionContext };

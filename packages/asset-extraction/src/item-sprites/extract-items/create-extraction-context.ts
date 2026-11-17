/* @layer shared-asset-extraction @kind logic */
import { loadHudPalette, loadHudSheets } from '../hud-decoder';
import { loadSpritePalettes, loadReceiptSheets } from '../receipt-decoder';
import { loadDialogueFont } from '../dialogue-glyph-decoder';
import { loadDropSheets } from '../drop-decoder';
import { loadTitleSource } from '../../title-screen/extract-title';
import { loadLegend } from '../../story-intro/extract-legend';
import { spriteSourceOf } from '../sources';
import { extractByFile } from './extract-by-file';
import type { RomData } from '../../rom/rom-types';
import type { TitleSource } from '../../title-screen/extract-title';
import type { Legend } from '../../story-intro/extract-legend';
import type { ExtractionContext, SpriteDef } from './extract-items.type';

const createExtractionContext = (rom: RomData, allSprites: SpriteDef[]): ExtractionContext => {
  let title: TitleSource | undefined;
  let legend: Legend | undefined;
  const source = spriteSourceOf(rom);
  const ctx: ExtractionContext = {
    rom,
    source,
    hudSheets: loadHudSheets(source),
    hudPalette: loadHudPalette(source),
    spritePalettes: loadSpritePalettes(source),
    receiptSheets: loadReceiptSheets(source),
    dropSheets: loadDropSheets(source),
    dialogueFont: loadDialogueFont(source),
    byFile: new Map(allSprites.map((sprite) => [sprite.file, sprite.extract])),
    resolving: new Set(),
    resolveFile: (file) => extractByFile(file, ctx),
    titleSource: () => (title ??= loadTitleSource(source)),
    legendSource: () => (legend ??= loadLegend(source)),
  };
  return ctx;
};

export { createExtractionContext };

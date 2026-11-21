/* @layer shared-asset-extraction @kind logic */
import type { SpriteSource } from '../../item-sprites/sources';
import type { TitleSource } from '../title-render';
import { buildTitlePalette } from '../title-palette';
import { buildTitleVram } from '../title-vram';

const loadTitleSource = (source: SpriteSource): TitleSource => ({
  vram: buildTitleVram(source),
  palette: buildTitlePalette(source),
});

export { loadTitleSource };

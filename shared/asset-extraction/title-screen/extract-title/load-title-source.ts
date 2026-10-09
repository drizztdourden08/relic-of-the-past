/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import type { TitleSource } from '../title-render';
import { buildTitlePalette } from '../title-palette';
import { buildTitleVram } from '../title-vram';

const loadTitleSource = (rom: RomData): TitleSource => ({ vram: buildTitleVram(rom), palette: buildTitlePalette(rom) });

export { loadTitleSource };

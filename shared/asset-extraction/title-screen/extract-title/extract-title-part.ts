/* @layer shared-asset-extraction @kind logic */
import type { ImageBuffer } from '../../graphics/png-writer';
import { renderBgScreen, renderSprites } from '../title-render';
import type { TitleSource } from '../title-render';
import { TITLE_SWORD_PIECES, TITLE_TRIFORCE_PIECES } from '../title-sprite-pieces.constants';
import {
  TITLE_BACKGROUND_MAP, TITLE_BG_CHARS, TITLE_LOGO_MAP, TITLE_OBJ_NAMES, TITLE_SWORD_PALETTE, TITLE_TRIFORCE_PALETTE,
} from '../title-tables';
import type { TitlePart } from './extract-title.type';
import { cropToContent } from './crop-to-content';
import { onBackdrop } from './on-backdrop';

const extractTitlePart = (part: TitlePart, src: TitleSource): ImageBuffer => {
  if (part === 'logo') return cropToContent(renderBgScreen(src, TITLE_LOGO_MAP, TITLE_BG_CHARS));
  if (part === 'sword') return cropToContent(renderSprites(src, TITLE_OBJ_NAMES, TITLE_SWORD_PALETTE, TITLE_SWORD_PIECES));
  if (part === 'triforce') {
    return cropToContent(renderSprites(src, TITLE_OBJ_NAMES, TITLE_TRIFORCE_PALETTE, TITLE_TRIFORCE_PIECES));
  }
  return onBackdrop(cropToContent(renderBgScreen(src, TITLE_BACKGROUND_MAP, TITLE_BG_CHARS)), src);
};

export { extractTitlePart };

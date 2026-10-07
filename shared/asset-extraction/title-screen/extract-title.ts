/* @layer shared-asset-extraction @kind logic */
/**
 * The pictures of the finished title screen, each whole and cropped to what it draws:
 * the logo (BG1), the Master Sword (ten intro sprites at rest), the triforce behind the
 * logo (three copies of the polyhedral engine's triangle) and the lake with the castle
 * behind them all (BG2).
 */
import type { RomData } from '../rom/rom-types';
import { ImageBuffer } from '../graphics/png-writer';
import { buildTitlePalette } from './title-palette';
import { buildTitleVram } from './title-vram';
import { renderBgScreen, renderSprites, type TitleSource } from './title-render';
import {
  TITLE_BACKGROUND_MAP, TITLE_BG_CHARS, TITLE_LOGO_MAP,
  TITLE_OBJ_NAMES, TITLE_SWORD_PALETTE, TITLE_SWORD_PIECES, TITLE_TRIFORCE_PALETTE, TITLE_TRIFORCE_PIECES,
} from './title-tables';

type TitlePart = 'logo' | 'sword' | 'triforce' | 'background';

const loadTitleSource = (rom: RomData): TitleSource => ({ vram: buildTitleVram(rom), palette: buildTitlePalette(rom) });

/** The smallest rectangle holding every drawn pixel. */
const cropToContent = (img: ImageBuffer): ImageBuffer => {
  let left = img.width, top = img.height, right = -1, bottom = -1;
  for (let y = 0; y < img.height; y += 1) {
    for (let x = 0; x < img.width; x += 1) {
      if (img.data[(y * img.width + x) * 4 + 3] === 0) continue;
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  if (right < 0) return new ImageBuffer(1, 1);
  const out = new ImageBuffer(right - left + 1, bottom - top + 1);
  for (let y = top; y <= bottom; y += 1) {
    img.data.copy(out.data, (y - top) * out.width * 4, (y * img.width + left) * 4, (y * img.width + right + 1) * 4);
  }
  return out;
};

/** The backdrop shows through the scene's own colour-0 pixels, so the background is opaque. */
const onBackdrop = (img: ImageBuffer, src: TitleSource): ImageBuffer => {
  const out = new ImageBuffer(img.width, img.height);
  for (let y = 0; y < img.height; y += 1) for (let x = 0; x < img.width; x += 1) out.putPixel(x, y, src.palette[0]);
  out.paste(img, 0, 0);
  return out;
};

const extractTitlePart = (part: TitlePart, src: TitleSource): ImageBuffer => {
  if (part === 'logo') return cropToContent(renderBgScreen(src, TITLE_LOGO_MAP, TITLE_BG_CHARS));
  if (part === 'sword') return cropToContent(renderSprites(src, TITLE_OBJ_NAMES, TITLE_SWORD_PALETTE, TITLE_SWORD_PIECES));
  if (part === 'triforce') {
    return cropToContent(renderSprites(src, TITLE_OBJ_NAMES, TITLE_TRIFORCE_PALETTE, TITLE_TRIFORCE_PIECES));
  }
  return onBackdrop(cropToContent(renderBgScreen(src, TITLE_BACKGROUND_MAP, TITLE_BG_CHARS)), src);
};

export { extractTitlePart, loadTitleSource };
export type { TitlePart, TitleSource };

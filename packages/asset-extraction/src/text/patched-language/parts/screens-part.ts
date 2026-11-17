/* @layer shared-asset-extraction @kind logic */
import { US_SCREEN_ADDRESSES } from '../../../screens/addresses/us';
import { extractScreens } from '../../../screens/extract-screens';
import { TILEMAP_FONT_BYTES } from '../../../screens/screens.constants';
import type { PatchedPartReport, PatchedWork } from '../patched-language.type';

const screensPart = (work: PatchedWork): PatchedPartReport => {
  const read = extractScreens(work.patched, US_SCREEN_ADDRESSES);
  const ownFont = work.tiles?.length === TILEMAP_FONT_BYTES ? Uint8Array.from(work.tiles) : undefined;
  work.screens = { ...read, tilemapFontData: ownFont ?? read.tilemapFontData };
  const sheets = work.screens.sheets.length;
  return { part: 'screens', status: 'ok', detail: `Screens read; ${sheets} graphics sheets taken through the ROM's own tables.` };
};

export { screensPart };

/* @layer shared-asset-extraction @kind logic */
import { snesToLinear } from '../../../rom/snes-address';
import { kFontTypes } from '../../data/font-data';
import { locateFontTiles } from '../font';
import { formatSnes } from '../format-snes';
import type { PatchedPartReport, PatchedWork } from '../patched-language.type';

const fontTilesPart = (work: PatchedWork): PatchedPartReport => {
  const source = kFontTypes[work.base];
  if (!source) return { part: 'font-tiles', status: 'failed', detail: `No font layout is known for ${work.base}.` };
  const at = snesToLinear(source.tileAddr);
  const found = locateFontTiles({
    patched: work.patched.bytes, at, references: work.references, glyphLimit: work.config.commandStart,
  });
  work.tiles = found.tiles;
  if (found.moved) {
    return { part: 'font-tiles', status: 'recovered', detail: `The patch moved the font; found it at ${formatSnes(found.at)}.` };
  }
  if (found.checked) return { part: 'font-tiles', status: 'ok', detail: 'Read at the usual place.' };
  if (work.references.length === 0) {
    return { part: 'font-tiles', status: 'ok', detail: 'Read at the usual place. No release font was at hand to check it.' };
  }
  return {
    part: 'font-tiles', status: 'recovered',
    detail: 'The font does not match a known one; it was read at the usual place.',
  };
};

export { fontTilesPart };

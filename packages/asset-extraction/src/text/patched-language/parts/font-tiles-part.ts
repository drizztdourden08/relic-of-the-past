/* @layer shared-asset-extraction @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { snesToLinear } from '../../../rom/snes-address';
import { kFontTypes } from '../../data/font-data';
import { locateFontTiles } from '../font';
import { formatSnes } from '../format-snes';
import type { PatchedPartReport, PatchedWork } from '../patched-language.type';

const fontTilesPart = (work: PatchedWork): PatchedPartReport => {
  const source = kFontTypes[work.base];
  if (!source) return { part: 'font-tiles', status: 'failed', detail: msg('rom-loader:patched.fontTiles.unknownLayout', { base: work.base }) };
  const at = snesToLinear(source.tileAddr);
  const found = locateFontTiles({
    patched: work.patched.bytes, at, references: work.references, glyphLimit: work.config.commandStart,
  });
  work.tiles = found.tiles;
  if (found.moved) {
    return { part: 'font-tiles', status: 'recovered', detail: msg('rom-loader:patched.fontTiles.moved', { address: formatSnes(found.at) }) };
  }
  if (found.checked) return { part: 'font-tiles', status: 'ok', detail: msg('rom-loader:patched.fontTiles.usual') };
  if (work.references.length === 0) {
    return { part: 'font-tiles', status: 'ok', detail: msg('rom-loader:patched.fontTiles.unchecked') };
  }
  return {
    part: 'font-tiles', status: 'recovered',
    detail: msg('rom-loader:patched.fontTiles.mismatch'),
  };
};

export { fontTilesPart };

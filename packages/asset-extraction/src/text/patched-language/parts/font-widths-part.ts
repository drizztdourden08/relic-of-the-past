/* @layer shared-asset-extraction @kind logic */
import { snesToLinear } from '../../../rom/snes-address';
import { kFontTypes } from '../../data/font-data';
import { DEFAULT_GLYPH_WIDTH, locateFontWidths, MAX_GLYPH_WIDTH } from '../font';
import type { PatchedPartReport, PatchedWork } from '../patched-language.type';
import { WIDTH_DETAILS } from './parts.constants';

const highestGlyph = (work: PatchedWork): number => Math.max(-1, ...Object.values(work.glyphs));

const extendWidths = (work: PatchedWork, widths: Uint8Array, at: number): Uint8Array => {
  const length = Math.max(widths.length, highestGlyph(work) + 1);
  return Uint8Array.from({ length }, (_, glyph) => {
    if (glyph < widths.length) return widths[glyph] ?? DEFAULT_GLYPH_WIDTH;
    const width = work.patched.bytes[at + glyph] ?? 0;
    return width >= 1 && width <= MAX_GLYPH_WIDTH ? width : DEFAULT_GLYPH_WIDTH;
  });
};

const fontWidthsPart = (work: PatchedWork): PatchedPartReport => {
  const source = kFontTypes[work.base];
  if (!source) return { part: 'font-widths', status: 'failed', detail: `No width table is known for ${work.base}.` };
  const at = snesToLinear(source.widthAddr);
  const reference = work.references.find((candidate) => candidate.isBase)?.widths ?? null;
  const found = locateFontWidths({ patched: work.patched.bytes, at, count: source.widthCount, reference });
  if (!found) return { part: 'font-widths', status: 'failed', detail: 'No width table that looks right was found.' };
  work.widths = extendWidths(work, found.widths, at);
  const status = found.source === 'base' || found.source === 'unchecked' ? 'ok' : 'recovered';
  return { part: 'font-widths', status, detail: WIDTH_DETAILS[found.source] };
};

export { fontWidthsPart };

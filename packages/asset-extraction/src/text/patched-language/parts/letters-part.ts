/* @layer shared-asset-extraction @kind logic */
import type { PatchedPartReport, PatchedWork } from '../patched-language.type';
import { NON_LATIN_MIN_UNKNOWN, NOT_LATIN_ERROR } from './parts.constants';

const builtDetail = (work: PatchedWork): string => {
  const built = (work.reading?.namings ?? []).filter((naming) => naming.how !== 'font');
  if (built.length === 0) return '';
  return ` ${built.length} letters built from a known letter and a mark: ${built.map((naming) => `${naming.token} (${naming.detail})`).join(', ')}.`;
};

const unknownDetail = (unknown: readonly number[]): string => {
  if (unknown.length === 0) return '';
  const ids = unknown.map((glyph) => `0x${glyph.toString(16).padStart(2, '0')}`).join(', ');
  return ` ${unknown.length} redrawn glyphs are not letters the import can name (${ids}); they keep the release letters.`;
};

const lettersPart = (work: PatchedWork): PatchedPartReport => {
  const { reading } = work;
  if (!reading) return { part: 'letters', status: 'failed', detail: 'The font could not be read, so the letters were not checked.' };
  if (reading.unknown.length >= NON_LATIN_MIN_UNKNOWN) {
    return {
      part: 'letters', status: 'failed',
      detail: `${NOT_LATIN_ERROR} ${reading.unknown.length} glyphs the patch redrew are not Latin letters the import can name.`,
    };
  }
  if (reading.restyled) {
    return {
      part: 'letters', status: 'recovered',
      detail: `The patch redraws ${reading.changed.length} glyphs in its own style; they keep the release letters.`,
    };
  }
  if (reading.namings.length === 0 && reading.unknown.length === 0) {
    const how = reading.checked ? 'The letters are those of the release.' : 'No release font was at hand; letters are read as the release has them.';
    return { part: 'letters', status: 'ok', detail: how };
  }
  const named = `${reading.namings.length} redrawn letters identified.${builtDetail(work)}`;
  return { part: 'letters', status: 'recovered', detail: `${named}${unknownDetail(reading.unknown)}` };
};

export { lettersPart };

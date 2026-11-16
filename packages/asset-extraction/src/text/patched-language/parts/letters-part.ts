/* @layer shared-asset-extraction @kind logic */
import { UNKNOWN_LETTER } from '../font';
import type { PatchedPartReport, PatchedWork } from '../patched-language.type';
import { NOT_LATIN_ERROR } from './parts.constants';

const unknownCount = (work: PatchedWork): number => work.reading?.unknown.length ?? 0;

const builtDetail = (work: PatchedWork): string => {
  const built = (work.reading?.namings ?? []).filter((naming) => naming.how !== 'font');
  if (built.length === 0) return '';
  return ` ${built.length} letters built from a known letter and a mark: ${built.map((naming) => `${naming.token} (${naming.detail})`).join(', ')}.`;
};

const lettersPart = (work: PatchedWork): PatchedPartReport => {
  const { reading } = work;
  if (!reading) return { part: 'letters', status: 'failed', detail: 'The font could not be read, so the letters were not checked.' };
  const text = (work.texts ?? []).join('\n');
  if (text.includes(UNKNOWN_LETTER)) {
    return {
      part: 'letters', status: 'failed',
      detail: `${NOT_LATIN_ERROR} ${unknownCount(work)} glyphs the patch redrew are not Latin letters the import can name.`,
    };
  }
  if (reading.restyled) {
    return {
      part: 'letters', status: 'recovered',
      detail: `The patch redraws ${reading.changed.length} glyphs in its own style; they keep the release letters.`,
    };
  }
  if (reading.namings.length === 0) {
    const how = reading.checked ? 'The letters are those of the release.' : 'No release font was at hand; letters are read as the release has them.';
    return { part: 'letters', status: 'ok', detail: how };
  }
  return { part: 'letters', status: 'recovered', detail: `${reading.namings.length} redrawn letters identified.${builtDetail(work)}` };
};

export { lettersPart };

/* @layer shared-asset-extraction @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { PatchedPartReport, PatchedWork } from '../patched-language.type';
import { NON_LATIN_MIN_UNKNOWN } from './parts.constants';

const builtTokens = (work: PatchedWork): string[] =>
  (work.reading?.namings ?? [])
    .filter((naming) => naming.how !== 'font')
    .map((naming) => `${naming.token} (${naming.detail})`);

const unknownIds = (unknown: readonly number[]): string[] =>
  unknown.map((glyph) => `0x${glyph.toString(16).padStart(2, '0')}`);

const lettersPart = (work: PatchedWork): PatchedPartReport => {
  const { reading } = work;
  if (!reading) return { part: 'letters', status: 'failed', detail: msg('rom-loader:patched.letters.unreadable') };
  if (reading.unknown.length >= NON_LATIN_MIN_UNKNOWN) {
    return {
      part: 'letters', status: 'failed',
      detail: msg('rom-loader:patched.letters.notLatin', { count: reading.unknown.length }),
    };
  }
  if (reading.restyled) {
    return {
      part: 'letters', status: 'recovered',
      detail: msg('rom-loader:patched.letters.restyled', { count: reading.changed.length }),
    };
  }
  if (!reading.checked) {
    return { part: 'letters', status: 'recovered', detail: msg('rom-loader:patched.letters.unchecked') };
  }
  if (reading.namings.length === 0 && reading.unknown.length === 0) {
    return { part: 'letters', status: 'ok', detail: msg('rom-loader:patched.letters.release') };
  }
  const built = builtTokens(work);
  return {
    part: 'letters', status: 'recovered',
    detail: msg('rom-loader:patched.letters.identified', {
      named: reading.namings.length,
      builtCount: built.length,
      builtList: built,
      unknownCount: reading.unknown.length,
      unknownIds: unknownIds(reading.unknown).join(', '),
    }),
  };
};

export { lettersPart };

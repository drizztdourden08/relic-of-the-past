/* @layer shared-asset-extraction @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { pickDictionary } from '../dictionary';
import type { PatchedPartReport, PatchedWork } from '../patched-language.type';

const dictionaryPart = (work: PatchedWork): PatchedPartReport => {
  const pick = pickDictionary({ patched: work.patched.bytes, base: work.baseRom?.bytes ?? null, config: work.config });
  work.dictionary = pick;
  if (pick.source === 'base') return { part: 'dictionary', status: 'ok', detail: msg('rom-loader:patched.dictionary.base') };
  if (pick.source === 'table') {
    return {
      part: 'dictionary', status: 'recovered',
      detail: msg('rom-loader:patched.dictionary.table', { count: pick.entries.length }),
    };
  }
  if (pick.source === 'release') {
    return { part: 'dictionary', status: 'recovered', detail: msg('rom-loader:patched.dictionary.release', { release: pick.release }) };
  }
  return {
    part: 'dictionary', status: 'failed',
    detail: msg('rom-loader:patched.dictionary.missing'),
  };
};

export { dictionaryPart };

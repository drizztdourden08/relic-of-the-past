/* @layer shared-asset-extraction @kind logic */
import { pickDictionary } from '../dictionary';
import type { PatchedPartReport, PatchedWork } from '../patched-language.type';

const dictionaryPart = (work: PatchedWork): PatchedPartReport => {
  const pick = pickDictionary({ patched: work.patched.bytes, base: work.baseRom?.bytes ?? null, config: work.config });
  work.dictionary = pick;
  if (pick.source === 'base') return { part: 'dictionary', status: 'ok', detail: 'The release word dictionary is in place.' };
  if (pick.source === 'table') {
    return {
      part: 'dictionary', status: 'recovered',
      detail: `The patch changed the word dictionary; read ${pick.entries.length} words from its table.`,
    };
  }
  if (pick.source === 'release') {
    return { part: 'dictionary', status: 'recovered', detail: `The patch uses the ${pick.release} word dictionary.` };
  }
  return {
    part: 'dictionary', status: 'failed',
    detail: 'The word dictionary was not found; the release one is used, so some words may read wrong.',
  };
};

export { dictionaryPart };

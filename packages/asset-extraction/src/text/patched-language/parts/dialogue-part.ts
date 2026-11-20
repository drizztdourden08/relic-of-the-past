/* @layer shared-asset-extraction @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { normalizeTexts } from '../../build-language-entry/normalize-texts';
import { encodeDictionary } from '../../dialogue-encoder';
import { decodeStringsWithConfig } from '../../dialogue-decoder/decode-strings-with-config';
import { diffHints, resolveStream, SCAN_STEP_BUDGET, streamLayout } from '../stream';
import { MOVED_FIRST, MOVED_SECOND } from '../stream/stream.constants';
import { EXPECTED_LINE_COUNT } from '../patched-language.constants';
import type { PatchedPartReport, PatchedWork } from '../patched-language.type';
import { unnamedGlyphs } from './unnamed-glyphs';

const dictionaryWords = (work: PatchedWork): string[] =>
  (work.dictionary?.entries ?? encodeDictionary(work.config.id))
    .map((entry) => Array.from(entry, (glyph) => work.letters[glyph] ?? '').join(''));

const movedBanks = (moved: readonly string[]): string => {
  const first = moved.includes(MOVED_FIRST);
  const second = moved.includes(MOVED_SECOND);
  if (first && second) return 'both';
  return first ? 'first' : 'second';
};

const dialoguePart = (work: PatchedWork): PatchedPartReport => {
  const { config, patched } = work;
  const dictionary = dictionaryWords(work);
  const layout = streamLayout(config, dictionary.length);
  const scan = { bytes: patched.bytes, layout, budget: { steps: SCAN_STEP_BUDGET } };
  const plan = resolveStream({ scan, romAddrs: config.romAddrs, hints: diffHints(patched.bytes, work.baseRom?.bytes ?? null) });
  if (!plan) {
    const detail = scan.budget.steps <= 0 ? msg('rom-loader:patched.dialogue.timeout') : msg('rom-loader:patched.dialogue.noStream');
    return { part: 'dialogue', status: 'failed', detail };
  }
  work.plan = plan;
  const info = { ...config, alphabet: work.letters, dictionary, romAddrs: [...plan.starts, ...config.romAddrs.slice(plan.starts.length)] };
  const texts = normalizeTexts(decodeStringsWithConfig((addr) => patched.getByte(addr), info, config.id).map((d) => d.text));
  if (texts.length !== EXPECTED_LINE_COUNT) {
    return { part: 'dialogue', status: 'failed', detail: msg('rom-loader:patched.dialogue.count', { count: texts.length, expected: EXPECTED_LINE_COUNT }) };
  }
  const unnamed = unnamedGlyphs(work.letters, texts);
  if (unnamed.length > 0) {
    return { part: 'dialogue', status: 'failed', detail: msg('rom-loader:patched.dialogue.unnamed', { glyphs: unnamed.join(', ') }) };
  }
  work.texts = texts;
  if (plan.moved.length === 0) return { part: 'dialogue', status: 'ok', detail: msg('rom-loader:patched.dialogue.read', { count: texts.length }) };
  return {
    part: 'dialogue', status: 'recovered',
    detail: msg('rom-loader:patched.dialogue.moved', { count: texts.length, banks: movedBanks(plan.moved) }),
  };
};

export { dialoguePart };

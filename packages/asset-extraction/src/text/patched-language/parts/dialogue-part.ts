/* @layer shared-asset-extraction @kind logic */
import { normalizeTexts } from '../../build-language-entry/normalize-texts';
import { encodeDictionary } from '../../dialogue-encoder';
import { decodeStringsWithConfig } from '../../dialogue-decoder/decode-strings-with-config';
import { diffHints, resolveStream, SCAN_STEP_BUDGET, streamLayout } from '../stream';
import { EXPECTED_LINE_COUNT } from '../patched-language.constants';
import type { PatchedPartReport, PatchedWork } from '../patched-language.type';

const dictionaryWords = (work: PatchedWork): string[] =>
  (work.dictionary?.entries ?? encodeDictionary(work.config.id))
    .map((entry) => Array.from(entry, (glyph) => work.letters[glyph] ?? '').join(''));

const dialoguePart = (work: PatchedWork): PatchedPartReport => {
  const { config, patched } = work;
  const dictionary = dictionaryWords(work);
  const layout = streamLayout(config, dictionary.length);
  const scan = { bytes: patched.bytes, layout, budget: { steps: SCAN_STEP_BUDGET } };
  const plan = resolveStream({ scan, romAddrs: config.romAddrs, hints: diffHints(patched.bytes, work.baseRom?.bytes ?? null) });
  if (!plan) {
    const reason = scan.budget.steps <= 0 ? 'The search ran out of time' : 'No dialogue stream decodes';
    return { part: 'dialogue', status: 'failed', detail: `${reason}; the patch may change the text format.` };
  }
  work.plan = plan;
  const info = { ...config, alphabet: work.letters, dictionary, romAddrs: [...plan.starts, ...config.romAddrs.slice(plan.starts.length)] };
  const texts = normalizeTexts(decodeStringsWithConfig((addr) => patched.getByte(addr), info, config.id).map((d) => d.text));
  if (texts.length !== EXPECTED_LINE_COUNT) {
    return { part: 'dialogue', status: 'failed', detail: `Read ${texts.length} messages where ${EXPECTED_LINE_COUNT} are expected.` };
  }
  work.texts = texts;
  if (plan.moved.length === 0) return { part: 'dialogue', status: 'ok', detail: `${texts.length} messages read.` };
  return {
    part: 'dialogue', status: 'recovered',
    detail: `${texts.length} messages read. The patch moved the ${plan.moved.join(' and the ')}; found by searching the ROM.`,
  };
};

export { dialoguePart };

/* @layer shared-asset-extraction @kind logic */
import { kLanguages } from '../data/language-data';
import { decodeEndingCaptions } from '../menu-text/decode-captions';
import { decodeCredits } from '../menu-text/decode-credits';
import { decodeMenuText } from '../menu-text/decode-stripe-text';
import { dialoguePart } from './parts/dialogue-part';
import { dictionaryPart } from './parts/dictionary-part';
import { fontTilesPart } from './parts/font-tiles-part';
import { lettersPart } from './parts/letters-part';
import { readLetters } from './parts/read-letters';
import { screensPart } from './parts/screens-part';
import { screenTextPart } from './parts/screen-text-part';
import { FATAL_PARTS } from './patched-language.constants';
import type { PatchedLanguage, PatchedLanguageInput, PatchedPartReport, PatchedWork } from './patched-language.type';
import { runPart } from './part-report';

const startWork = (input: PatchedLanguageInput): PatchedWork => {
  const base = input.patched.language;
  const config = kLanguages[base];
  if (!config) throw new Error(`"${base}" has no dialogue layout.`);
  return {
    ...input, base, config, tiles: null, reading: null, letters: [...config.alphabet], dictionary: null, plan: null,
    texts: null, menu: {}, credits: {}, screens: null,
  };
};

const lettersOf = (work: PatchedWork): string[] => {
  try {
    return readLetters(work);
  } catch {
    return [...work.config.alphabet];
  }
};

const runParts = (work: PatchedWork): PatchedPartReport[] => {
  const tiles = runPart('font-tiles', fontTilesPart, work);
  work.letters = lettersOf(work);
  const dictionary = runPart('dictionary', dictionaryPart, work);
  const dialogue = runPart('dialogue', dialoguePart, work);
  const letters = runPart('letters', lettersPart, work);
  const menu = runPart('menu-text', (w) => screenTextPart({
    part: 'menu-text', decode: decodeMenuText, keep: (into, lines) => { into.menu = lines; },
  }, w), work);
  const credits = runPart('credits', (w) => screenTextPart({
    part: 'credits', decode: (rom) => [...decodeCredits(rom), ...decodeEndingCaptions(rom)],
    keep: (into, lines) => { into.credits = lines; },
  }, w), work);
  const screens = runPart('screens', screensPart, work);
  return [dialogue, tiles, letters, dictionary, menu, credits, screens];
};

const extractPatchedLanguage = (input: PatchedLanguageInput): PatchedLanguage => {
  const work = startWork(input);
  const parts = runParts(work);
  const success = parts.every((part) => part.status !== 'failed' || !FATAL_PARTS.includes(part.part));
  const done = success && work.texts && work.tiles;
  return {
    success: Boolean(done),
    parts,
    texts: done ? work.texts ?? [] : [],
    menu: work.menu,
    credits: work.credits,
    screens: work.screens,
  };
};

export { extractPatchedLanguage };

/* @layer shared-game @kind logic */
import type { PackedLangEntry } from '@rotp/asset-extraction';
import type { BakedLanguages, SetBakeInput } from './compile.type';
import { compileSet } from './compile-set';
import { compileSets } from './compile-sets';
import { messageOf } from './message-of';
import { setFontOf } from './set-font-of';

const isRomSet = (input: SetBakeInput, rom: SetBakeInput): boolean =>
  input.set.id === rom.set.id && input.set.base === rom.set.base;

const compileBase = (stored: SetBakeInput | undefined, rom: SetBakeInput, onWarn: (message: string) => void): PackedLangEntry => {
  if (stored === undefined) return compileSet(rom.set, setFontOf(rom));
  try {
    return compileSet(stored.set, setFontOf(stored));
  } catch (err) {
    onWarn(`Language set "${stored.set.id}" failed to compile, so the default language is baked from the ROM's own text: ${messageOf(err)}`);
    return compileSet(rom.set, setFontOf(rom));
  }
};

const compileBake = (inputs: SetBakeInput[], rom: SetBakeInput, onWarn: (message: string) => void): BakedLanguages => {
  const stored = inputs.find((input) => isRomSet(input, rom));
  return {
    baseLanguage: compileBase(stored, rom, onWarn),
    extraLanguages: compileSets(inputs.filter((input) => input !== stored), onWarn),
  };
};

export { compileBake };

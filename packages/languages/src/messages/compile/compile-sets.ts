/* @layer shared-game @kind logic */
import type { PackedLangEntry } from '@rotp/asset-extraction';
import type { SetBakeInput } from './compile.type';
import { compileSet } from './compile-set';
import { messageOf } from './message-of';
import { setFontOf } from './set-font-of';

const compileSets = (inputs: SetBakeInput[], onWarn: (message: string) => void): PackedLangEntry[] => {
  const packed: PackedLangEntry[] = [];

  for (const input of inputs) {
    try {
      packed.push(compileSet(input.set, setFontOf(input)));
    } catch (err) {
      onWarn(`Language set "${input.set.id}" failed to compile and was skipped: ${messageOf(err)}`);
    }
  }

  return packed;
};

export { compileSets };

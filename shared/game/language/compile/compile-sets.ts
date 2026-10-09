/* @layer shared-game @kind logic */
import type { PackedLangEntry } from '@shared/asset-extraction/text/build-language-entry';
import type { SetBakeInput } from './compile.type';
import { compileSet } from './compile-set';

const messageOf = (err: unknown): string => (err instanceof Error ? err.message : String(err));

const compileSets = (inputs: SetBakeInput[], onWarn: (message: string) => void): PackedLangEntry[] => {
  const packed: PackedLangEntry[] = [];

  for (const { set, fontData, fontWidth } of inputs) {
    try {
      packed.push(compileSet(set, {
        fontData: Buffer.from(fontData),
        fontWidth: Buffer.from(fontWidth),
      }));
    } catch (err) {
      onWarn(`Language set "${set.id}" failed to compile and was skipped: ${messageOf(err)}`);
    }
  }

  return packed;
};

export { compileSets };

/* @layer shared-asset-extraction @kind logic */
import type { RomData } from './rom/rom-types';
import type { AssetBuilder } from './asset-builder';
import { packArrays } from './asset-builder';
import { extractLangEntry } from './text/build-language-entry';
import type { PackedLangEntry } from './text/build-language-entry';
import type { CompileOptions } from './compile-resources.type';

const buildDialogue = (rom: RomData, A: AssetBuilder, options: CompileOptions): void => {
  const base = options.baseLanguage ?? extractLangEntry(rom, rom.language, 0);
  const all: PackedLangEntry[] = [base, ...(options.extraLanguages ?? [])];

  A.addPacked('kDialogue', all.map((e) => e.langData));
  A.addPacked('kDialogueFont', all.map((e) => e.fontPacked));
  A.addPacked('kDialogueMap', all.map((e, i) =>
    packArrays([Buffer.from(e.code, 'utf8'), Buffer.from([i, i, e.flags]), Buffer.from(e.base, 'utf8')])));
};

export { buildDialogue };

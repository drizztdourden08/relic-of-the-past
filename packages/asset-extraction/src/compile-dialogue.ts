/* @layer shared-asset-extraction @kind logic */
import type { RomData } from './rom/rom-types';
import type { AssetBuilder } from './asset-builder';
import { packArrays } from './asset-builder';
import { extractLangEntry } from './text/build-language-entry';
import type { PackedLangEntry } from './text/build-language-entry';

const buildDialogue = (rom: RomData, A: AssetBuilder, extras: PackedLangEntry[] = []): void => {
  const us = extractLangEntry(rom, 'us', 0);
  const all: PackedLangEntry[] = [us, ...extras];

  A.addPacked('kDialogue', all.map((e) => e.langData));
  A.addPacked('kDialogueFont', all.map((e) => e.fontPacked));
  A.addPacked('kDialogueMap', all.map((e, i) =>
    packArrays([Buffer.from(e.code, 'utf8'), Buffer.from([i, i, e.flags])])));
};

export { buildDialogue };

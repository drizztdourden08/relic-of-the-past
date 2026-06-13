/* @layer shared-asset-extraction @kind logic */
/**
 * Dialogue asset compilation — packs the US ROM dialogue plus any extra language
 * packs into the parallel kDialogue / kDialogueFont / kDialogueMap arrays. The
 * running game selects one at startup via the INI `Language` key.
 */
import type { RomData } from './rom/rom-types';
import type { AssetBuilder } from './asset-builder';
import { packArrays } from './asset-builder';
import { extractLangEntry } from './text/build-language-entry';
import type { PackedLangEntry } from './text/build-language-entry';

const buildDialogue = (rom: RomData, A: AssetBuilder, extras: PackedLangEntry[] = []): void => {
  // US is always index 0; extras follow in the order provided.
  const us = extractLangEntry(rom, 'us', 0);
  const all: PackedLangEntry[] = [us, ...extras];

  A.addPacked('kDialogue', all.map((e) => e.langData));
  A.addPacked('kDialogueFont', all.map((e) => e.fontPacked));
  A.addPacked('kDialogueMap', all.map((e, i) =>
    packArrays([Buffer.from(e.code, 'utf8'), Buffer.from([i, i, e.flags])])));
};

export { buildDialogue };

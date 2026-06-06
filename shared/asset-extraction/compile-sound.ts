/**
 * Sound bank asset compilation — extract and compile music/SFX data.
 */
import type { RomData } from './rom/rom-types';
import type { AssetBuilder } from './asset-builder';
import { bufToArr } from './asset-builder';
import { extractSoundData } from './music/extract-music';
import { compileSoundBank, produceLoadableSeq } from './music/compile-music';

const buildSoundBanks = (rom: RomData, A: AssetBuilder): void => {
  const extracted = extractSoundData(rom);

  for (const song of ['intro', 'indoor', 'ending']) {
    const compiled = compileSoundBank(song, {
      songTexts: extracted.songTexts,
      sfxText: extracted.sfxText,
      brrSamples: extracted.brrSamples,
      musicInfoYaml: extracted.musicInfoYaml,
    });
    const loadableSeq = produceLoadableSeq(compiled.memory);
    A.addUint8(`kSoundBank_${song}`, bufToArr(loadableSeq));
  }
};

export { buildSoundBanks };

/**
 * Music extraction — orchestrator that loads SPC sound banks from ROM,
 * decodes songs/phrases/patterns/SFX, and produces text + sample output.
 *
 * Ported from: core/zelda3/assets/extract_music.py
 */
import type { RomData } from '../rom/rom-types';
import type { MusicExtractionResult } from './extract-types';
import { SoundBankContext } from './sound-bank-context';
import { formatEntity } from './format-entities';
import { printAllSfx } from './decode-sfx';
import { dumpBrrAndInfo } from './dump-brr-info';

function extractSoundData(rom: RomData): MusicExtractionResult {
  const ctx = new SoundBankContext();
  const songTexts: Record<string, string> = {};
  let sfxText = '';
  const brrSamples: Buffer[] = [];
  const pcmSamples: Buffer[] = [];
  let musicInfoYaml = '';

  for (const songName of ['intro', 'indoor', 'ending']) {
    ctx.loadSong(rom, songName);

    if (songName === 'intro') {
      const { brr, pcm, infoYaml } = dumpBrrAndInfo(ctx);
      brrSamples.push(...brr);
      pcmSamples.push(...pcm);
      musicInfoYaml = infoYaml;
      sfxText = printAllSfx(ctx);
    }

    ctx.getSongList(0xd000, ctx.songsInBank);

    if (songName === 'intro') {
      ctx.getPhrase(0xd878);
      ctx.getPhrase(0xd8a8);
      ctx.getPhrase(0xd8b8);
      ctx.getPhrase(0xdf11);
      ctx.getPhrase(0xe37c);
    } else if (songName === 'indoor') {
      ctx.getPhrase(0xdc5e);
      ctx.getPhrase(0xdc6e);
      ctx.getPattern(0xe905);
      ctx.getPhrase(0xe94a);
    } else if (songName === 'ending') {
      ctx.getPhrase(0x2a10);
    }

    ctx.processQueue();

    const sorted = Array.from(ctx.typesForEa.entries()).sort((a, b) => a[0] - b[0]);
    let text = '';
    for (const [, entity] of sorted) {
      if (!entity.isImported) {
        text += formatEntity(entity) + '\n';
      }
    }
    songTexts[`sound_${songName}.txt`] = text;
  }

  return { songTexts, sfxText, brrSamples, pcmSamples, musicInfoYaml };
}

export { extractSoundData };
export type { MusicExtractionResult };

/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { MusicEntity, Pattern, Phrase, Song, SongList } from './extract-types.type';
import { copySoundBank } from './copy-sound-bank';
import { createMusicEntity } from './create-music-entity';
import { decodePatternCommand } from './decode-pattern-command';
import { readCommandPrefix } from './read-command-prefix';

class SoundBankContext {
  memory: (number | null)[] = new Array<number | null>(65536).fill(null);
  typesForEa = new Map<number, MusicEntity>();
  pqueue: [number, MusicEntity][] = [];
  songsInBank = 0;

  getByte(ea: number): number | null {
    return this.memory[ea] ?? null;
  }

  readByte(ea: number): number {
    const value = this.getByte(ea);
    if (value === null) throw new Error(`Sound bank byte 0x${ea.toString(16)} is not loaded`);
    return value;
  }

  getWord(ea: number): number {
    return (this.memory[ea] ?? 0) | ((this.memory[ea + 1] ?? 0) << 8);
  }

  reset(): void {
    this.typesForEa.clear();
    this.pqueue = [];
  }

  loadSoundBank(rom: RomData, ea: number, memIn?: (number | null)[]): number {
    if (memIn) this.memory = [...memIn];
    else this.memory = new Array<number | null>(65536).fill(null);
    return copySoundBank(rom, ea, this.memory);
  }

  getTypeForEa<T extends MusicEntity>(ea: number, type: T['type']): T | null {
    if (ea === 0) return null;
    if (ea < 256) throw new Error(`Invalid ea: 0x${ea.toString(16)}`);

    const existing = this.typesForEa.get(ea);
    if (existing) {
      if (existing.type !== type) {
        throw new Error(`Type mismatch at 0x${ea.toString(16)}: expected ${type}, got ${existing.type}`);
      }
      return existing as T;
    }

    const entity = createMusicEntity<T>(ea, type);
    this.typesForEa.set(ea, entity);
    if (this.getByte(ea) !== null) {
      this.pqueue.push([ea, entity]);
      this.pqueue.sort((a, b) => a[0] - b[0]);
      entity.isImported = false;
    } else {
      entity.isImported = true;
    }
    return entity;
  }

  getPattern(ea: number): Pattern | null {
    if (ea === 0) return null;
    return this.getTypeForEa<Pattern>(ea, 'Pattern');
  }

  getSong(ea: number, index: number): Song | null {
    const song = this.getTypeForEa<Song>(ea, 'Song');
    if (song) song.index = index;
    return song;
  }

  getPhrase(ea: number): Phrase | null {
    return this.getTypeForEa<Phrase>(ea, 'Phrase');
  }

  getSongList(ea: number, num: number): void {
    const songList = this.getTypeForEa<SongList>(ea, 'SongList');
    if (songList) {
      songList.songs = [];
      for (let i = 0; i < num; i++) {
        songList.songs.push(this.getSong(this.getWord(ea + i * 2), i));
      }
    }
  }

  decodePattern(pattern: Pattern, nextEa: number | null): void {
    let ea = pattern.ea;
    const startEa = ea;
    pattern.lines = [];

    while (ea === startEa || ea !== nextEa) {
      const prefix = readCommandPrefix(this, ea);
      if (prefix === null) return;
      const { line, size } = decodePatternCommand(this, prefix);
      pattern.lines.push(line);
      ea = prefix.next + size;
    }
    pattern.lines.push({ kind: 'fallthrough' });
  }

  decodePhrase(phrase: Phrase): void {
    phrase.patterns = [];
    for (let i = 0; i < 8; i++) {
      phrase.patterns.push(this.getPattern(this.getWord(phrase.ea + i * 2)));
    }
  }

  decodeSong(song: Song): void {
    let ea = song.ea;
    song.phrases = [];

    while (true) {
      const phrase = this.getWord(ea);
      if (phrase === 0) break;
      if (phrase < 0x100) {
        const tgt = this.getWord(ea + 2);
        song.phrases.push({ type: 'PhraseLoop', name: `PhraseLoop ${phrase} ${(tgt - ea) / 2}`, loops: phrase, jmp: (tgt - ea) / 2 });
        ea += 4;
      } else {
        const p = this.getPhrase(phrase);
        if (p) song.phrases.push(p);
        ea += 2;
      }
    }
  }

  decodeAny(what: MusicEntity, nextEa: number | null): void {
    switch (what.type) {
      case 'Song': this.decodeSong(what); break;
      case 'Phrase': this.decodePhrase(what); break;
      case 'Pattern': this.decodePattern(what, nextEa); break;
      case 'SongList': break;
    }
  }

  processQueue(): void {
    let head = this.pqueue.shift();
    while (head !== undefined) {
      const [, item] = head;
      const nextEa = this.pqueue[0]?.[0] ?? null;
      this.decodeAny(item, nextEa);
      head = this.pqueue.shift();
    }
  }

  loadSong(rom: RomData, song: string): void {
    this.reset();
    if (song === 'intro') {
      this.loadSoundBank(rom, 0x998000);
      this.songsInBank = (this.getWord(0xd000) - 0xd000) / 2;
    } else if (song === 'lightworld') {
      this.loadSoundBank(rom, 0x9a9ef5);
      this.songsInBank = (this.getWord(0xd000) - 0xd000) / 2;
    } else if (song === 'indoor') {
      this.loadSoundBank(rom, 0x9b8000);
      this.songsInBank = (0xd046 - 0xd000) / 2;
    } else if (song === 'ending') {
      this.loadSoundBank(rom, 0x9ad380);
      this.songsInBank = (0xd046 - 0xd000) / 2;
    }
  }
}

export { SoundBankContext };

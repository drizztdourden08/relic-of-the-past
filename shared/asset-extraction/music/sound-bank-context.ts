/* @layer shared-asset-extraction @kind logic */
/** Manages SPC memory state and decodes song/phrase/pattern structures. */
import type { RomData } from '../rom/rom-types';
import type { MusicEntity, Pattern, Phrase, PhraseLoop, Song, SongList } from './extract-types';
import { kEffectByteLength, kEffectNames, noteToStr } from './extract-types';

class SoundBankContext {
  memory: (number | null)[] = new Array(65536).fill(null);
  typesForEa = new Map<number, MusicEntity>();
  pqueue: [number, MusicEntity][] = [];
  songsInBank = 0;

  getByte(ea: number): number | null {
    return this.memory[ea];
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
    else this.memory = new Array(65536).fill(null);

    let j = 0;
    while (true) {
      const numBytes = rom.getWord(ea);
      const target = rom.getWord(ea + 2);
      if (numBytes === 0) return target;
      ea += 4;
      for (let i = 0; i < numBytes; i++) {
        this.memory[target + i] = rom.getByte(ea);
        ea += 1;
        if ((ea & 0xffff) < 0x8000) ea += 0x8000;
      }
      j++;
      if (j > 256) break;
    }
    return 0;
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

    const entity = { type, ea, name: `${type}_0x${ea.toString(16)}`, isImported: false } as unknown as T;
    if (type === 'Song') (entity as unknown as Song).index = 0;
    if (type === 'Song') (entity as unknown as Song).phrases = [];
    if (type === 'Phrase') (entity as unknown as Phrase).patterns = [];
    if (type === 'Pattern') (entity as unknown as Pattern).lines = [];
    if (type === 'SongList') (entity as unknown as SongList).songs = [];

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

    while (true) {
      if (ea !== startEa && ea === nextEa) {
        pattern.lines.push({ kind: 'fallthrough' });
        return;
      }
      let noteLength: number | null = null;
      let volstuff: number | null = null;
      let cmd = this.getByte(ea)!;
      ea += 1;
      if (cmd === 0) break;
      if (!(cmd & 0x80)) {
        noteLength = cmd;
        cmd = this.getByte(ea)!;
        ea += 1;
        if (!(cmd & 0x80)) {
          volstuff = cmd;
          cmd = this.getByte(ea)!;
          ea += 1;
        }
      }
      if (cmd === 0xef) {
        const addr = this.getWord(ea);
        const loops = this.getByte(ea + 2)!;
        ea += 3;
        pattern.lines.push({ kind: 'call', name: 'Call', target: this.getPattern(addr), loops, noteLength, volstuff });
      } else if (cmd >= 0xe0) {
        const x = kEffectByteLength[cmd - 0xe0];
        const args: number[] = [];
        for (let i = 0; i < x; i++) args.push(this.getByte(ea + i)!);
        ea += x;
        pattern.lines.push({ kind: 'effect', name: kEffectNames[cmd - 0xe0], args, noteLength, volstuff });
      } else {
        pattern.lines.push({ kind: 'note', note: noteToStr(cmd & 0x7f), noteLength, volstuff });
      }
    }
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
      case 'Song': this.decodeSong(what as Song); break;
      case 'Phrase': this.decodePhrase(what as Phrase); break;
      case 'Pattern': this.decodePattern(what as Pattern, nextEa); break;
      case 'SongList': break;
    }
  }

  processQueue(): void {
    while (this.pqueue.length > 0) {
      const [, item] = this.pqueue.shift()!;
      const nextEa = this.pqueue.length > 0 ? this.pqueue[0][0] : null;
      this.decodeAny(item, nextEa);
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

/* @layer shared-asset-extraction @kind logic */
import type {
  CompiledPattern,
  CompiledPhrase,
  CompiledSfxList,
  CompiledSfxPattern,
  CompiledSong,
  CompiledSongList,
  Entity,
  PatternLine,
} from './compile-types.type';
import { kEffectNamesDict, kGapStartAddrs, kKeysDict } from './compile-lookups.constants';
import { encodeSfxLine } from './encode-sfx-line';

const effectArgs = (args: PatternLine[1]): (number | null)[] =>
  args.map((arg) => {
    if (typeof arg === 'number' || arg === null) return arg;
    throw new Error(`Effect argument is not a number: ${typeof arg === 'string' ? arg : arg.name}`);
  });

const callTarget = (args: PatternLine[1]): Entity => {
  const [target] = args;
  if (typeof target !== 'object' || target === null) throw new Error('Call line has no target pattern');
  return target;
};

class MusicSerializer {
  memory: (number | null)[] = new Array<number | null>(65536).fill(null);
  relocs: [number, Entity][] = [];
  addr: number | null = null;

  cursor(): number {
    if (this.addr === null) throw new Error('MusicSerializer: no write address set');
    return this.addr;
  }

  write(data: Iterable<number | null>): void {
    for (const value of data) {
      const at = this.cursor();
      if (this.memory[at] !== null) {
        throw new Error(`Memory already written at 0x${at.toString(16)}`);
      }
      this.memory[at] = value;
      this.addr = at + 1;
    }
  }

  writeAt(a: number, data: readonly number[]): void {
    for (const [offset, d] of data.entries()) this.memory[a + offset] = d;
  }

  writeWord(a: number, v: number): void {
    this.memory[a] = v & 0xff;
    this.memory[a + 1] = (v >> 8) & 0xff;
  }

  writeRelocEntry(r: Entity | null): void {
    this.write([0, 0]);
    if (r) this.relocs.push([this.cursor() - 2, r]);
  }

  writeSong(song: CompiledSong): void {
    for (const phrase of song.phrases) {
      if (phrase.type === 'PhraseLoop') {
        const target = this.cursor() + phrase.jmp * 2;
        this.write([phrase.loops, 0]);
        this.write([target & 0xff, target >> 8]);
      } else {
        this.writeRelocEntry(phrase);
      }
    }
    this.write([0, 0]);
  }

  writePhrase(phrase: CompiledPhrase): void {
    for (let i = 0; i < 8; i++) {
      this.writeRelocEntry(phrase.patterns[i] ?? null);
    }
  }

  writeSongList(songList: CompiledSongList): void {
    for (const song of songList.songs) {
      this.writeRelocEntry(song);
    }
  }

  writePatternLine([cmd, args]: PatternLine): void {
    const key = kKeysDict.get(cmd);
    const effect = kEffectNamesDict.get(cmd);
    if (key !== undefined) {
      this.write([0x80 | key]);
    } else if (cmd === 'Call') {
      this.write([0xef, 0, 0, typeof args[1] === 'number' ? args[1] : null]);
      this.relocs.push([this.cursor() - 3, callTarget(args)]);
    } else if (effect !== undefined) {
      this.write([0xe0 + effect]);
      this.write(effectArgs(args));
    }
  }

  writePattern(patt: CompiledPattern): void {
    for (const line of patt.lines) {
      const [, , noteLength, volstuff] = line;
      if (noteLength !== null) this.write([noteLength]);
      if (volstuff !== null) this.write([volstuff]);
      this.writePatternLine(line);
    }
    if (!patt.fallthrough) this.write([0]);
  }

  writeSfxPattern(patt: CompiledSfxPattern): void {
    for (const line of patt.lines) {
      const { bytes, end } = encodeSfxLine(line);
      this.write(bytes);
      if (end) return;
    }
    this.write([0]);
  }

  writeSfxList(sfxList: CompiledSfxList): void {
    for (const pat of sfxList.patterns) {
      this.writeRelocEntry(pat);
    }
    for (const n of sfxList.next) this.write([n]);
    for (const e of sfxList.echo) this.write([e]);
  }

  placeEntity(what: Entity): void {
    if (what.ea === null) return;
    if (this.addr === null || kGapStartAddrs.has(what.ea)) {
      this.addr = what.ea;
    } else if (what.ea !== this.addr) {
      throw new Error(`${what.name}: 0x${what.ea.toString(16)} != 0x${this.addr.toString(16)}`);
    }
  }

  writeObj(what: Entity): void {
    this.placeEntity(what);
    what.writeAddr = this.cursor();

    switch (what.type) {
      case 'Phrase': this.writePhrase(what); break;
      case 'Pattern': this.writePattern(what); break;
      case 'Song': this.writeSong(what); break;
      case 'SongList': this.writeSongList(what); break;
      case 'SfxPattern': this.writeSfxPattern(what); break;
      case 'SfxList': this.writeSfxList(what); break;
    }
  }

  processRelocs(): void {
    for (const [p, r] of this.relocs) {
      this.memory[p] = r.writeAddr & 0xff;
      this.memory[p + 1] = (r.writeAddr >> 8) & 0xff;
    }
  }
}

export { MusicSerializer };

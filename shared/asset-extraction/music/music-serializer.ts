/* @layer shared-asset-extraction @kind logic */
/**
 * MusicSerializer — writes compiled music entities into SPC memory layout.
 */
import type {
  CompiledPattern,
  CompiledPhrase,
  CompiledSfxList,
  CompiledSfxPattern,
  CompiledSong,
  CompiledSongList,
  Entity,
} from './compile-types';
import { kEffectNamesDict, kGapStartAddrs, kKeysDict } from './compile-types';

class MusicSerializer {
  memory: (number | null)[] = new Array(65536).fill(null);
  relocs: [number, Entity][] = [];
  addr: number | null = null;

  write(data: ArrayLike<number>): void {
    for (let i = 0; i < data.length; i++) {
      if (this.memory[this.addr!] !== null) {
        throw new Error(`Memory already written at 0x${this.addr!.toString(16)}`);
      }
      this.memory[this.addr!] = data[i];
      this.addr!++;
    }
  }

  writeAt(a: number, data: number[]): void {
    for (const d of data) {
      this.memory[a] = d;
      a++;
    }
  }

  writeWord(a: number, v: number): void {
    this.memory[a] = v & 0xff;
    this.memory[a + 1] = (v >> 8) & 0xff;
  }

  writeRelocEntry(r: Entity | null): void {
    this.write([0, 0]);
    if (r) this.relocs.push([this.addr! - 2, r]);
  }

  writeSong(song: CompiledSong): void {
    for (const phrase of song.phrases) {
      if ((phrase as { type: string }).type === 'PhraseLoop') {
        const pl = phrase as { loops: number; jmp: number };
        const target = this.addr! + pl.jmp * 2;
        this.write([pl.loops, 0]);
        this.write([target & 0xff, target >> 8]);
      } else {
        this.writeRelocEntry(phrase as unknown as Entity);
      }
    }
    this.write([0, 0]);
  }

  writePhrase(phrase: CompiledPhrase): void {
    for (let i = 0; i < 8; i++) {
      this.writeRelocEntry(phrase.patterns[i] as unknown as Entity | null);
    }
  }

  writeSongList(songList: CompiledSongList): void {
    for (const song of songList.songs) {
      this.writeRelocEntry(song as unknown as Entity | null);
    }
  }

  writePattern(patt: CompiledPattern): void {
    for (const [cmd, args, noteLength, volstuff] of patt.lines) {
      if (noteLength !== null) this.write([noteLength]);
      if (volstuff !== null) this.write([volstuff]);
      if (kKeysDict.has(cmd)) {
        this.write([0x80 | kKeysDict.get(cmd)!]);
      } else if (cmd === 'Call') {
        this.write([0xef, 0, 0, args[1] as number]);
        this.relocs.push([this.addr! - 3, args[0] as unknown as Entity]);
      } else if (kEffectNamesDict.has(cmd)) {
        const i = kEffectNamesDict.get(cmd)!;
        this.write([0xe0 + i]);
        this.write(args as number[]);
      }
    }
    if (!patt.fallthrough) this.write([0]);
  }

  writeSfxPattern(patt: CompiledSfxPattern): void {
    for (let i = 0; i < patt.lines.length; i++) {
      const line = patt.lines[i];
      const parts = line.split(/\s+/);
      const lineCmd = parts[0];
      const lineArgs = parts.slice(1);

      if (lineCmd === 'SetInstrument') {
        this.write([0xe0, parseInt(lineArgs[0])]);
      } else if (lineCmd === 'Restart') {
        this.write([0xff]);
        return;
      } else if (lineCmd === 'Fallthrough') {
        return;
      } else if (kKeysDict.has(lineCmd) || lineCmd === '.') {
        if (lineArgs[0] !== '--') {
          this.write([parseInt(lineArgs[0])]);
          if (lineArgs[1] !== '---') {
            this.write([parseInt(lineArgs[1])]);
            if (lineArgs[2] !== '---') {
              this.write([parseInt(lineArgs[2])]);
            }
          }
        }
        if (lineArgs.length >= 4 && lineArgs[3] === 'PitchSlide') {
          if (lineCmd === '.') {
            this.write([0xf1, parseInt(lineArgs[4]), parseInt(lineArgs[5]), parseInt(lineArgs[6])]);
          } else {
            this.write([0xf9, kKeysDict.get(lineCmd)! | 0x80,
              parseInt(lineArgs[4]), parseInt(lineArgs[5]), parseInt(lineArgs[6])]);
          }
        } else {
          if (lineCmd === '.') {
            // rest/tie — no extra byte
          } else {
            this.write([kKeysDict.get(lineCmd)! | 0x80]);
          }
        }
      }
    }
    this.write([0]);
  }

  writeSfxList(sfxList: CompiledSfxList): void {
    for (const pat of sfxList.patterns) {
      this.writeRelocEntry(pat as unknown as Entity | null);
    }
    for (const n of sfxList.next) this.write([n]);
    for (const e of sfxList.echo) this.write([e]);
  }

  writeObj(what: Entity): void {
    if (what.ea !== null) {
      if (this.addr === null || kGapStartAddrs.has(what.ea)) {
        this.addr = what.ea;
      } else if (what.ea !== this.addr) {
        throw new Error(`${what.name}: 0x${what.ea.toString(16)} != 0x${this.addr.toString(16)}`);
      }
    }
    what.writeAddr = this.addr!;

    switch ((what as { type: string }).type) {
      case 'Phrase': this.writePhrase(what as CompiledPhrase); break;
      case 'Pattern': this.writePattern(what as CompiledPattern); break;
      case 'Song': this.writeSong(what as unknown as CompiledSong); break;
      case 'SongList': this.writeSongList(what as CompiledSongList); break;
      case 'SfxPattern': this.writeSfxPattern(what as CompiledSfxPattern); break;
      case 'SfxList': this.writeSfxList(what as CompiledSfxList); break;
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

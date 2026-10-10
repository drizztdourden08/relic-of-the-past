/* @layer test @kind helper */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { FEATURES0_DEVELOPER_TOOLS, SRAM_BASE, SRAM_SIZE, WRAM_SIZE } from './core-harness.constants';
import { assetBlobPath } from './asset-blob-path';
import { fixturePath } from './fixture-path';
import { maskOf } from './mask-of';
import { required } from '../../required';
import type { RawCore, Step } from './core-harness.type';

class Core {
  private ram = 0;
  private constructor(private readonly raw: RawCore, readonly label: string) {}

  static async load(wasmJs: string, label: string): Promise<Core> {
    const blob = assetBlobPath();
    if (blob === undefined) throw new Error('no asset blob found');
    const factory = createRequire(import.meta.url)(wasmJs) as (opts: object) => Promise<RawCore>;
    const raw = await factory({ noInitialRun: true, print: () => undefined, printErr: () => undefined });
    raw.FS.writeFile('/zelda3_assets.dat', readFileSync(blob));
    raw.FS.mkdir('/saves');
    const core = new Core(raw, label);
    core.call('WasmInitHeadless');
    core.call('WasmSetGateWord', 0, FEATURES0_DEVELOPER_TOOLS);
    core.frames(2);
    core.ram = core.call('WasmProbeWramPtr');
    if (core.ram === 0) throw new Error('dev tools gate refused the WRAM pointer');
    return core;
  }

  call(name: string, ...args: number[]): number {
    return this.raw.ccall(name, 'number', args.map(() => 'number'), args);
  }

  get8(addr: number): number { return required(this.raw.HEAPU8[this.ram + addr], `WRAM byte ${addr}`); }
  heap(ptr: number, length: number): Uint8Array { return this.raw.HEAPU8.subarray(ptr, ptr + length); }
  set8(addr: number, value: number): void { this.raw.HEAPU8[this.ram + addr] = value & 0xff; }
  get16(addr: number): number { return this.get8(addr) | (this.get8(addr + 1) << 8); }
  set16(addr: number, value: number): void { this.set8(addr, value); this.set8(addr + 1, value >> 8); }

  frames(n: number, mask = 0): void {
    for (let i = 0; i < n; i += 1) {
      if (this.call('WasmDevRunFrame', mask) !== 1) throw new Error(`${this.label}: frame refused`);
    }
  }

  play(script: readonly Step[]): void {
    for (const { hold, frames } of script) this.frames(frames, maskOf(hold));
  }

  loadFixture(name: string): void {
    this.loadFixtureFile(fixturePath(name));
  }

  loadFixtureFile(path: string): void {
    this.raw.FS.writeFile('/saves/save0.sav', readFileSync(path));
    this.call('WasmLoadState', 0);
    this.frames(2);
  }

  saveStateBytes(slot: number): Uint8Array {
    this.call('WasmSaveState', slot);
    return this.raw.FS.readFile(`/saves/save${slot}.sav`);
  }

  setGateWord(index: number, word: number): void {
    this.call('WasmSetGateWord', index, word);
    this.frames(2);
  }

  hash(start = 0, length = WRAM_SIZE, skip: readonly [number, number][] = []): string {
    const bytes = Buffer.from(this.raw.HEAPU8.subarray(this.ram + start, this.ram + start + length));
    for (const [from, count] of skip) bytes.fill(0, from - start, from - start + count);
    return createHash('sha256').update(bytes).digest('hex');
  }

  sramHash(): string { return this.hash(SRAM_BASE, SRAM_SIZE); }

  static firstDiff(a: Core, b: Core): number | null {
    for (let i = 0; i < WRAM_SIZE; i += 1) if (a.get8(i) !== b.get8(i)) return i;
    return null;
  }
}

export { Core };

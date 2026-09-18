/* @layer test @kind helper */
/**
 * Headless core harness for the story-events work: loads a built core in node with no
 * window, gives RAM read and write, save-state load, frame-exact scripted input, and a
 * hash of the game state. Two cores can be loaded side by side (the new build and the
 * master baseline) and driven with the same script, so "same result" is a byte compare.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { SNES_BUTTON_BITS } from '@shared/types/controls';

const ROOT = resolve(__dirname, '../..');
const FEATURES0_DEVELOPER_TOOLS = 1073741824;
/** SNES WRAM is 128 KB; the battery block sits inside it at 0xF000. */
const WRAM_SIZE = 0x20000;
const SRAM_BASE = 0xf000;
const SRAM_SIZE = 0x500;

type Button = keyof typeof SNES_BUTTON_BITS;
/** One script step: hold these buttons for this many frames. */
type Step = { hold: readonly Button[]; frames: number };

interface RawCore {
  ccall: (name: string, ret: 'number' | null, types: string[], args: number[]) => number;
  HEAPU8: Uint8Array;
  FS: { mkdir: (path: string) => void; writeFile: (path: string, data: Uint8Array) => void; readFile: (path: string) => Uint8Array };
}

const maskOf = (hold: readonly Button[]): number =>
  hold.reduce((mask, button) => mask | (1 << SNES_BUTTON_BITS[button]), 0);

const assetBlobPath = (): string | undefined => {
  if (process.env.ROTP_ASSETS_DAT !== undefined && existsSync(process.env.ROTP_ASSETS_DAT)) return process.env.ROTP_ASSETS_DAT;
  const dirs = [resolve(ROOT, '.user-data/Data/assets'), join(process.env.APPDATA ?? '', 'relic-of-the-past/Data/assets')];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    const dat = readdirSync(dir).find((name) => name.endsWith('.dat'));
    if (dat !== undefined) return join(dir, dat);
  }
  return undefined;
};

const fixturePath = (name: string): string => resolve(ROOT, 'tests/fixtures/save-states', `${name}.sav`);

const fixtureNames = (): string[] => {
  const dir = resolve(ROOT, 'tests/fixtures/save-states');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.sav')).map((f) => f.slice(0, -4)).sort();
};

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

  get8(addr: number): number { return this.raw.HEAPU8[this.ram + addr]; }
  set8(addr: number, value: number): void { this.raw.HEAPU8[this.ram + addr] = value & 0xff; }
  get16(addr: number): number { return this.get8(addr) | (this.get8(addr + 1) << 8); }
  set16(addr: number, value: number): void { this.set8(addr, value); this.set8(addr + 1, value >> 8); }

  /** Run |n| frames holding |mask|. Throws if the dev gate ever refuses a frame. */
  frames(n: number, mask = 0): void {
    for (let i = 0; i < n; i += 1) {
      if (this.call('WasmDevRunFrame', mask) !== 1) throw new Error(`${this.label}: frame refused`);
    }
  }

  play(script: readonly Step[]): void {
    for (const { hold, frames } of script) this.frames(frames, maskOf(hold));
  }

  /** Load a fixture by name into slot 0 and settle two frames. */
  loadFixture(name: string): void {
    this.raw.FS.writeFile('/saves/save0.sav', readFileSync(fixturePath(name)));
    this.call('WasmLoadState', 0);
    this.frames(2);
  }

  /** Load any save-state file by path into slot 0 and settle two frames. */
  loadFixtureFile(path: string): void {
    this.raw.FS.writeFile('/saves/save0.sav', readFileSync(path));
    this.call('WasmLoadState', 0);
    this.frames(2);
  }

  /** Save the current state into MEMFS slot |slot| and hand its bytes back. */
  saveStateBytes(slot: number): Uint8Array {
    this.call('WasmSaveState', slot);
    return this.raw.FS.readFile(`/saves/save${slot}.sav`);
  }

  setGateWord(index: number, word: number): void {
    this.call('WasmSetGateWord', index, word);
    this.frames(2);
  }

  /** SHA-256 of a WRAM range; |skip| ranges are zeroed out of the digest (the ledger, for T2). */
  hash(start = 0, length = WRAM_SIZE, skip: readonly [number, number][] = []): string {
    const bytes = Buffer.from(this.raw.HEAPU8.subarray(this.ram + start, this.ram + start + length));
    for (const [from, count] of skip) bytes.fill(0, from - start, from - start + count);
    return createHash('sha256').update(bytes).digest('hex');
  }

  sramHash(): string { return this.hash(SRAM_BASE, SRAM_SIZE); }

  /** First differing WRAM address between two cores, for a readable failure. */
  static firstDiff(a: Core, b: Core): number | null {
    for (let i = 0; i < WRAM_SIZE; i += 1) if (a.get8(i) !== b.get8(i)) return i;
    return null;
  }
}

export { Core, ROOT, SRAM_BASE, SRAM_SIZE, WRAM_SIZE, fixtureNames, fixturePath, maskOf };
export type { Button, Step };

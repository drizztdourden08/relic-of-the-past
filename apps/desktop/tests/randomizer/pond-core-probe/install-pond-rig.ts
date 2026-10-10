/* @layer tests @kind helper */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { beforeAll, expect } from 'vitest';
import { assetBlobPath } from '../../story-events/core-harness/asset-blob-path';
import { FEATURES0_DEVELOPER_TOOLS, FIXTURE, NO_PRIZE, UNARMED_LINE, WASM_JS, WRAM } from './pond-core.constants';
import type { Core, PondRig } from './pond-core.type';

const installPondRig = (): PondRig => {
  let core: Core;
  let ram = 0;

  const call = (name: string, ...args: number[]): number =>
    core.ccall(name, 'number', args.map(() => 'number'), args);
  const set8 = (addr: number, value: number): void => { core.HEAPU8[ram + addr] = value; };
  const get8 = (addr: number): number => core.HEAPU8[ram + addr];
  const set16 = (addr: number, value: number): void => { set8(addr, value & 0xff); set8(addr + 1, value >> 8); };
  const get16 = (addr: number): number => get8(addr) | (get8(addr + 1) << 8);
  const frames = (n: number): void => { for (let i = 0; i < n; i += 1) expect(call('WasmDevRunFrame', 0)).toBe(1); };
  const gate3 = (word: number): void => { call('WasmSetGateWord', 3, word); frames(2); };

  const armPlan = (): void => {
    call('WasmClearPondPlan');
    call('WasmSetPondThrow', 0, 427, 0, 0, UNARMED_LINE, UNARMED_LINE);
    call('WasmSetPondThrow', 1, 300, NO_PRIZE, 0, UNARMED_LINE, UNARMED_LINE);
    call('WasmSetPondThrow', 2, 200, NO_PRIZE, 100, UNARMED_LINE, UNARMED_LINE);
    set8(WRAM.pondThrows, 0);
  };

  const seam = (kind: number): number => {
    const module = get8(WRAM.module);
    const submodule = get8(WRAM.submodule);
    const owned = call('WasmProbePondSeam', kind);
    set8(WRAM.module, module);
    set8(WRAM.submodule, submodule);
    return owned;
  };

  beforeAll(async () => {
    const factory = createRequire(import.meta.url)(WASM_JS) as (opts: object) => Promise<Core>;
    core = await factory({ noInitialRun: true, print: () => undefined, printErr: () => undefined });
    core.FS.writeFile('/zelda3_assets.dat', readFileSync(assetBlobPath()!));
    core.FS.mkdir('/saves');
    core.FS.writeFile('/saves/save0.sav', readFileSync(FIXTURE));
    call('WasmInitHeadless');
    call('WasmSetGateWord', 0, FEATURES0_DEVELOPER_TOOLS);
    frames(2);
    ram = call('WasmProbeWramPtr');
    expect(ram).toBeGreaterThan(0);
    call('WasmLoadState', 0);
    frames(2);
  }, 120_000);

  return { call, set8, get8, set16, get16, gate3, armPlan, seam };
};

export { installPondRig };
